import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { nanoid } from "nanoid";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "10 s"),
});

interface RequestBody {
    url: string;
    customAlias: string;
}

export async function POST(req: Request){
    try{
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

        const {success} = await ratelimit.limit(ip);
        if(!success){
            return NextResponse.json({error: "Rate limit exceeded."}, {status: 429});
        }
        
        const body = await req.json() as RequestBody;
        let { url, customAlias } = body;
        
        // validate if url given
        if(!url){
            return NextResponse.json({error: "URL is required"}, {status: 400});
        }

        if(!/^https?:\/\//i.test(url)){
            url = "https://" + url;
        }

        let shortId;
        
        if(customAlias){
            customAlias = customAlias.replace(/\s+/g, "-");

            const exists = await redis.exists(customAlias);
            if(exists){
                return NextResponse.json({error: "Alias already taken."}, {status: 409})
            }
            shortId = customAlias;
        }
        else{
            shortId = nanoid(6);
        }

        // save to redis, await its completion. save under shortId key
        await redis.set(shortId, url);

        // set click counter to 0 for the id
        await redis.set("clicks:${shortId}", 0);

        // send success to frontend
        return NextResponse.json({
            shortId: shortId,
            success: true
        })
    }

    catch(error){
        console.error("Error saving to Redis:", error);
        return NextResponse.json({error:"Internal server error"}, {status: 500});
    }
}