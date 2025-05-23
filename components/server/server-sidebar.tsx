import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { ChannelType, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import ServerHeader from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import ServerSearch from "./server-search";
import { Hash, Mic, Shield, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import ServerSection from "./server-section";
import Server from "next/dist/server/base-server";
import ServerChannel from "./server-channel";
import ServerMember from "./server-member";

const IconMap={
    [ChannelType.TEXT]:<Hash className="w-4 h-4 mr-2"/>,
    [ChannelType.AUDIO]:<Mic className="w-4 h-4 mr-2"/>,
    [ChannelType.VIDEO]:<Video className="w-4 h-4 mr-2"/>,
}

const roleIconMap={
    [MemberRole.GUEST]:null,
    [MemberRole.MODERATOR]:<ShieldCheck className="w-4 h-4 mr-2 text-indigo-500"/>,
    [MemberRole.ADMIN]:<ShieldAlert className="w-4 h-4 mr-2 text-rose-500"/>,
}

const ServerSiderbar = async ({serverId}:{serverId:string}) => {

    const profile=await currentProfile();
    if(!profile){
        return redirectToSignIn()
    }

    const server=await db.server.findUnique({
        where:{
            id:serverId,
            },
            include:{
                channels:{
                    orderBy:{createdAt:"asc"}
                },
                members:{
                    include:{
                        profile:true },
                    orderBy:{
                        role:"asc"
                    }
                }
            }
        }
    )
    if (!server){
        return redirect("/")
    }

    const textChannels= server?.channels?.filter((channel)=>channel?.type === ChannelType.TEXT);
    
    const audioChannels= server?.channels?.filter((channel)=>channel?.type === ChannelType.AUDIO);

    const videoChannels= server?.channels?.filter((channel)=>channel?.type === ChannelType.VIDEO);

    const members= server?.members?.filter((member)=>member?.profileId !== profile.id)
    
    const role=server?.members?.find((member)=>member.profileId===profile.id)?.role 

    return ( 
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader role={role} server={server}/>
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <ServerSearch data={[
                        {
                            label:"Text Channels",
                            type:"channel",
                            data:textChannels?.map((channel)=>(
                                {
                                    id:channel?.id,
                                    name:channel?.name,
                                    icon:IconMap[channel.type]
                                }
                            ))
                        
                        },
                        {
                            label:"Voice Channels",
                            type:"channel",
                            data:audioChannels?.map((channel)=>(
                                {
                                    id:channel?.id,
                                    name:channel?.name,
                                    icon:IconMap[channel.type]
                                }
                            ))
                        
                        },
                        {
                            label:"Video Channels",
                            type:"channel",
                            data:videoChannels?.map((channel)=>(
                                {
                                    id:channel?.id,
                                    name:channel?.name,
                                    icon:IconMap[channel.type]
                                }
                            ))
                        
                        },
                        {
                            label:"Member",
                            type:"member",
                            data:members?.map((member)=>(
                                {
                                    id:member?.id,
                                    name:member?.profile?.name,
                                    icon:roleIconMap[member.role]
                                }
                            ))
                        
                        }
                    ]}/>
                    
                </div>
                <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"/>
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection 
                        sectionType="channels"
                        channelType={ChannelType.TEXT}
                        role={role}
                        label="Text Channels"
                        />
                    </div>
                )}
                <div className="space-y-[2px]">
                {textChannels.map((channel)=>(
                    <ServerChannel 
                    key={channel.id}
                    channel={channel}
                    role={role}
                    server={server}
                    />
                ))}
                </div>
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection 
                        sectionType="channels"
                        channelType={ChannelType.AUDIO}
                        role={role}
                        label="Voice Channels"
                        />
                    </div>
                )}
                <div className="space-y-[2px]">
                {audioChannels.map((channel)=>(
                    <ServerChannel 
                    key={channel.id}
                    channel={channel}
                    role={role}
                    server={server}
                    />
                ))}
                </div>
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection 
                        sectionType="channels"
                        channelType={ChannelType.VIDEO}
                        role={role}
                        label="Video Channels"
                        />
                    </div>
                )}
                <div className="space-y-[2px]">
                {videoChannels.map((channel)=>(
                    <ServerChannel 
                    key={channel.id}
                    channel={channel}
                    role={role}
                    server={server}
                    />
                ))}
                </div>
                {!!members?.length && (
                    <div className="mb-2">
                        <ServerSection 
                        sectionType="members"
                        role={role}
                        label="Members"
                        server={server}
                        />
                    </div>
                )}
                <div className="space-y-[2px]">
                {members.map((member)=>(
                    <ServerMember key={member.id} member={member} server={server}/>
                ))}
                </div>
            </ScrollArea>
        </div>
     );
}
 
export default ServerSiderbar;