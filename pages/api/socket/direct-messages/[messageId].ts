import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole, Message } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(req:NextApiRequest,res:NextApiResponseServerIo){
    if(req.method !== "PATCH" && req.method !=="DELETE"){
        return res.status(405).json({error:"Method not allowed"})
    }

    try{
        const {content}=req.body;
        const {messageId,conversationId}=req.query
        const profile=await currentProfilePages(req)
        if(!profile){
            return res.status(401).json({error:"Unauthorized access"})
        }
        if(!conversationId){
            return res.status(400).json({error:"ServerId or Channel ID is missing"})
        }

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
        
         let message=await db.directMessage.findFirst({
            where:{
            id:messageId as string,
            },
            include:{
                member:{
                    include:{
                        profile:true
                    }
                }
            }
        }) 
        if(!message || message.deleted){
            return res.status(404).json({error:"message not found"})    
        }
        
        const memberId=member?.id;
        const isMessageOwner=message.memberId===memberId;
        const isAdmin=member?.role===MemberRole.ADMIN
        const isModerator=member?.role===MemberRole.MODERATOR
        const canModify=isMessageOwner || isAdmin || isModerator
        
        if(!canModify){
            return res.status(401).json({error:"Unauthorized"})   
        }

        if(req.method==="DELETE"){
            message=await db.directMessage.update({
                where:{
                    id:messageId as string,
                },
                data:{
                    fileUrl:null,
                    content:"This message has been deleted",
                    deleted:true
                },
                include:{
                    member:{
                        include:{
                            profile:true
                        }
                    }
                }
            }) 

        }

        if(req.method==="PATCH"){
            if(!isMessageOwner){
                return res.status(401).json({error:"Unauthorized"})
            }
            message=await db.directMessage.update({
                where:{
                    id:messageId as string,
                },
                data:{
                    content:content,
                },
                include:{
                    member:{
                        include:{
                            profile:true
                        }
                    }
                }
            }) 

        }
        const updateKey=`chat:${conversationId}:messages:update`;
        res?.socket?.server?.io?.emit(updateKey,message);
        return res.status(200).json(message)
        
    

    }catch(err){
        console.log("[DIRECT_MESSAGE_UPDATE]",err)
        return res.status(500).json({error:"Internal server error"})
    }
}
