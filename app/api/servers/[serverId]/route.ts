import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {v4 as uuidv4} from "uuid"

export async function PATCH(request:Request,{params}:{params:{serverId:string}}){
    try{
        const value=await request.json();
        const profile=await currentProfile()
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!params?.serverId){
            return new NextResponse("Serve ID is needed",{status:400})
        }
        const server=await db.server.update({
            where:{id:params.serverId,profileId:profile.id},
            data:{...value}
        })
        return NextResponse.json(server)

    }catch(err){
        console.log("[SERVER_ID]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}

export async function DELETE(request:Request,{params}:{params:{serverId:string}}){
    try{
        const profile=await currentProfile()
        if(!profile){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!params?.serverId){
            return new NextResponse("Serve ID is needed",{status:400})
        }
        
        const server=await db.server.delete({
            where:{id:params.serverId,profileId:profile.id},
        
        })
        return NextResponse.json(server)

    }catch(err){
        console.log("[DELETE SERVER]",err)
        return new NextResponse("Internal Server Error",{status:500})
    }
}

