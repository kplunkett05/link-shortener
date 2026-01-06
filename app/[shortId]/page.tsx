import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";

const redis = Redis.fromEnv();

interface PageProps{
    params: {
        shortId: string;
    };
}

export default async function RedirectPage({params}: PageProps){
    const { shortId } = await params;

    const longUrl = await redis.get<string>(shortId);

    if(!longUrl){
        redirect('/');
    }

    redis.incr("clicks:${shortId}");

    redirect(longUrl);
}