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
    const {serverId,channelId}=req.query
    if(!serverId || !channelId || !content){
        return res.status(400).json({msg:"serverId,ChannelId and content are needed"})
    }

    try{
        const server=await db.server.findFirst({
            where:{
                id:serverId as string,
                members:{
                    some:{
                        profileId:profile.id
                    }
                }
            },
            include:{
                members:true
            }
        })
        if(!server){
            return res.status(404).json({msg:"Server not found"})
        }
        const channel=await db.channel.findFirst({
            where:{
                id:channelId as string,
                serverId:serverId as string
            }
        })
        if(!channel){
            return res.status(404).json({msg:"Channel not found"})
        }
        const member=server.members.find((member)=>member.profileId === profile.id)

        if(!member){
            return res.status(404).json({msg:"Member not found"})
        }
        const message=await db.message.create({
            data:{
                memberId:member.id,
                content,
                fileUrl,
                channelId:channelId as string
            },
            include:{
                member:{
                    include:{
                        profile:true
                    }
                }
            }
        })
        const channelKey=`chat:${channelId}:messages`
        res?.socket?.server?.io?.emit(channelKey,message)
        return res.status(201).json({message})
    }catch(err){
        console.log("[MESSAGES_POST,err]");
        return res.status(500).json({msg:"Internal server Error"})
    }
}