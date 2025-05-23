import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {v4 as uuidv4} from "uuid"
import {MemberRole} from "@prisma/client"

export async function PATCH(request:Request,{params}:{params:{memberId:string}}){
    try{
        const {role}=await request.json();
        const profile=await currentProfile()
        const {searchParams}=new URL(request.url)
        const serverId=searchParams.get("serverId")
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!serverId){
            return new NextResponse("Server Id needed",{status:400})
        }
        if(!params.memberId){
            return new NextResponse("Member Id needed",{status:400})
        }
        
        const server=await db.server.update({
            where:{id:serverId,profileId:profile.id},
            data:{
                members:{
                    update:{
                        where:{
                            id:params.memberId,
                            profileId:{
                                not:profile.id
                            }
                        },
                        data:{role}
                    }
                }
            },
            include:{
                members:{
                    include:{
                        profile:true
                    },
                    orderBy:{
                        role:"asc"
                    }
                }
            }
        })
        
        return NextResponse.json(server)

    }catch(err){
        console.log("[MEMBERS_ID_PATCH]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}

export async function DELETE(request:Request,{params}:{params:{memberId:string}}){
    try{
        const profile=await currentProfile()
        const {searchParams}=new URL(request.url)
        const serverId=searchParams.get("serverId")
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!serverId){
            return new NextResponse("Server Id needed",{status:400})
        }
        if(!params.memberId){
            return new NextResponse("Member Id needed",{status:400})
        }
        
        const server=await db.server.update({
            where:{id:serverId,profileId:profile.id},
            data:{
                members:{
                    deleteMany:{
                        id:params.memberId,
                        profileId:{
                            not:profile.id
                        }
                    }
            }},
            include:{
                members:{
                    include:{
                        profile:true
                    },
                    orderBy:{
                        role:"asc"
                    }
                }
            }
        })
        
        return NextResponse.json(server)

    }catch(err){
        console.log("[MEMBERS_ID_DELETE]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}