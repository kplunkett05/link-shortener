import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

const redis = Redis.fromEnv();

interface RequestBody {
    url: string;
}

export async function POST(req: Request){
    try{
        const body = await req.json() as RequestBody;
        const { url } = body;
        
        // validate if url given
        if(!url){
            return NextResponse.json({error: "URL is required"}, {status: 400});
        }

        // generate 6 character long code
        const shortId = nanoid(6);

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