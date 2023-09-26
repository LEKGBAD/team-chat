import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {MemberRole} from "@prisma/client"

export async function PATCH(request:Request,{params}:{params:{serverId:string}}){
    try{
        console.log(params.serverId)
        const profile=await currentProfile()
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!params.serverId){
            return new NextResponse("Server ID is missing",{status:400})
        }
        const server=await db.server.update({
            where:{
                id:params.serverId,
                profileId:{not:profile.id},
                members:{
                    some:{
                        profileId:profile.id
                    }
                }
            },
            data:{
                members:{
                    deleteMany:{
                        profileId:profile?.id     
                    }
                }
                    
                }
            
        })
        return NextResponse.json(server)

    }catch(err){
        console.log("[MEMBER_LEAVE]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}