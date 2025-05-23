import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage, Message } from "@prisma/client";
import { url } from "inspector";
import { NextResponse } from "next/server";

const MESSAGES_BATCH=10;
export async function GET(req:Request){
    try{
        const {searchParams}=new URL(req.url)
        const cursor=searchParams.get("cursor");
        const conversationId=searchParams.get("conversationId");
        const profile=currentProfile()
        if(!profile){
            return new NextResponse("Unauthorzed Access",{status:401})
        }
        if(!profile){
            return new NextResponse("Unauthorzed Access",{status:401})
        }
        if(!conversationId){
            return new NextResponse("Conversation ID is needed",{status:400})
        }
        let messages:DirectMessage[]=[];

        if(cursor){
            messages=await db.directMessage.findMany({
                take:MESSAGES_BATCH,
                skip:1,
                cursor:{
                    id:cursor
                },
                where:{conversationId},
                include:{
                    member:{
                        include:{
                            profile:true
                        }
                    }
                },
                orderBy:{
                    createdAt:"desc"
                }
            })
        }
        else{
            messages=await db.directMessage.findMany({
                take:MESSAGES_BATCH,
                where:{
                    conversationId
                },
                include:{
                    member:{
                        include:{
                            profile:true
                        }
                    }
                },
                orderBy:{
                    createdAt:"desc"
                }
            })
        }
        let nextCursor=null;
        if(messages.length===MESSAGES_BATCH){
            nextCursor=messages[MESSAGES_BATCH - 1].id
        }
        return NextResponse.json({items:messages,nextCursor})

    }catch(err){
        console.log(`[DIRECT_MESSAGES_GET],${err}`);
        return new NextResponse("Internal Server Error",{status:500})
    }
}