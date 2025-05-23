import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {v4 as uuidv4} from "uuid"
import {MemberRole} from "@prisma/client"

export async function POST(request:Request){
    try{
        const {name,imageUrl}=await request.json();
        const profile=await currentProfile()
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        const server=await db.server.create({
            data:{
                profileId:profile.id,
                name,
                imageUrl,
                inviteCode:uuidv4(),
                channels:{
                    create:[
                        {
                            name:"general",profileId:profile.id}
                    ]
                },
                members:{
                    create:[
                        {profileId:profile.id,role:MemberRole.ADMIN}
                    ]
                }
            }
        })
        return NextResponse.json(server)

    }catch(err){
        console.log("[SERVERS POST]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}