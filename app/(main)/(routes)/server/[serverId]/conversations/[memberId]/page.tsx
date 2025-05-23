import ChatHeader from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import MediaRoom from "@/components/media-room";
import SocketIndicator from "@/components/socket-indicator";
import { getorcreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
    params:{
        memberId:string;
        serverId:string
    },
    searchParams:{
        video:boolean|undefined
    }
}

const MemberIdPage =async ({params,searchParams}:MemberIdPageProps) => {

    const profile=await currentProfile();

    if (!profile){
        return redirectToSignIn()
    }
    const {video}=searchParams;
    const currentMember=await db.member.findFirst({
        where:{
            profileId:profile.id,
            serverId:params.serverId
        },
        include:{
            profile:true
        }
    })
    if(!currentMember){
        return redirect("/")
    }

    const conversation=await getorcreateConversation(currentMember.id,params.memberId);

    if(!conversation){
        return redirect(`/server/${params?.serverId}`)
    }

    const {memberOne,memberTwo}=conversation;
    const otherMember=memberOne?.profileId===profile?.id?memberTwo:memberOne;
    return ( 
        <div className="bg-white dark:bg-[#313338] flex flex-col h-screen">
            
            <ChatHeader 
            imageUrl={otherMember?.profile?.imageUrl}
            name={otherMember?.profile?.name}
            serverId={params?.serverId}
            type="conversation"
            />
            {video ? 
            (<MediaRoom chatId={conversation.id} video={true} audio={true}/>):
            (<>
            <ChatMessages 
            member={currentMember}
            name={otherMember?.profile?.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{conversationId:conversation.id}}
            />
            <ChatInput 
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{conversationId:conversation.id}}
            />
            </>)
        }
            
            
        </div>
     );
}
 
export default MemberIdPage;