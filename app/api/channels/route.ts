import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {v4 as uuidv4} from "uuid"
import {MemberRole} from "@prisma/client"

export async function POST(request:Request){
    try{
        const {name,type}=await request.json();
        const profile=await currentProfile()
        const {searchParams}=new URL(request.url)
        const serverId=searchParams.get("serverId")
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!serverId){
            return new NextResponse("Server Id needed",{status:400})
        }
        if(name === "'general"){
            return new NextResponse("Name cannot be general",{status:400})
        }
       
        const server=await db.server.update({
            where:{
                id:serverId,
                members:{
                    some:{
                        profileId:profile.id,
                        role:{
                            in:[MemberRole.ADMIN,MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data:{
                channels:{
                    create:{
                            name,
                            profileId:profile.id,
                            type 
                        }
                    
                }
            }
        })
        
        
        
        return  NextResponse.json(server)

    }catch(err){
        console.log("[CREATE_CHANNEL]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}