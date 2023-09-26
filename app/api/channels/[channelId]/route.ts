import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request:Request,{params}:{params:{channelId:string}}){
    try{
        const {searchParams}=new URL(request.url)
        const serverId=searchParams.get("serverId")
        console.log(serverId)
        const profile=await currentProfile()
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!params?.channelId){
            return new NextResponse("Channel ID is needed",{status:400})
        }
        if(!serverId){
            return new NextResponse("Serve ID is needed",{status:400})
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
                    delete:{id:params.channelId,name:{not:"general"}}
                }
            }
        })
        return NextResponse.json({server})

    }catch(err){
        console.log("[DELETE CHANNEL]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}

export async function PATCH(request:Request,{params}:{params:{channelId:string}}){
    try{
        const {searchParams}=new URL(request.url)
        const serverId=searchParams.get("serverId")
        const {name,type}=await request.json()
        const profile=await currentProfile()
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!params?.channelId){
            return new NextResponse("Channel ID is needed",{status:400})
        }
        if(!serverId){
            return new NextResponse("Serve ID is needed",{status:400})
        }
        if(name === "general"){
            return new NextResponse("'general' channel can not be edited",{status:400})
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
                    update:{
                        where:{id:params.channelId,NOT:{name:"general"}},
                        data:{name,type}
                    }
                }
            }
        })
        return NextResponse.json({server})

    }catch(err){
        console.log("[EDIT_CHANNEL_PATCH]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}

