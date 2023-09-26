import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req:NextApiRequest,res:NextApiResponseServerIo){
    
    if(req.method !== "POST"){
        return res.status(405).json({error:"Method not allowed"})
    }
    const profile=await currentProfilePages(req);
    if(!profile){
        return res.status(401).json({msg:"Unauthorized access"})
    }
    const {content,fileUrl}=req.body;
    const {conversationId}=req.query
    if(!conversationId|| !content){
        return res.status(400).json({msg:"serverId,ChannelId and content are needed"})
    }

    try{
        
        const conversation=await db.conversation.findFirst({
            where:{
                id:conversationId as string,
                OR:[
                    {memberOne:{
                        profileId:profile.id
                    }},
                    {memberTwo:{
                        profileId:profile.id
                    }}
                ]
            },
            include:{
                memberOne:{
                    include:{profile:true}
                },
                memberTwo:{
                    include:{profile:true}
                }
            }
        })
        if(!conversation){
            return res.status(404).json({msg:"Conversation not found"})
        }
        const member=conversation?.memberOne.profileId===profile.id?conversation.memberOne:conversation?.memberTwo
        // const member=await db.member.findFirst({
        //     where:{
        //         profileId:profile.id
        //     }
        // })
        
        const message=await db.directMessage.create({
            data:{
                conversationId:conversationId as string,
                content,
                fileUrl,
                memberId:member?.id || ""
            },
            include:{
                member:{
                    include:{
                        profile:true
                    }
                }
            }
        })
        const conversationKey=`chat:${conversationId}:messages`
        res?.socket?.server?.io?.emit(conversationKey,message)
        return res.status(201).json({message})
    }catch(err){
        console.log("[MESSAGES_POST,err]");
        return res.status(500).json({msg:"Internal server Error"})
    }
}