"use client"

import { Member, Message, Profile } from "@prisma/client";
import ChatWelcome from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment,useRef,ElementRef } from "react";
import ChatItem from "./chat-item";
import {format} from "date-fns"
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

interface ChatMessagesProps {
    name:string;
    member:Member;
    chatId:string;
    apiUrl:string;
    socketUrl:string;
    socketQuery:Record<string,string>;
    paramKey:"channelId" | "conversationId";
    paramValue:string;
    type:"channel" | "conversation"

}
type MessageWithMemberWithProfile =Message & {
    member:Member & {
        profile:Profile
    }}

    const DATE_FORMAT="d MMM yyyy, HH:mm"
const ChatMessages = ({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type
}:ChatMessagesProps) => {
    const queryKey=`chat:${chatId}`
    const updateKey=`chat:${chatId}:messages:update`;
    const addKey=`chat:${chatId}:messages`

    const chatRef=useRef<ElementRef<"div">>(null) 
    const bottomRef=useRef<ElementRef<"div">>(null) 

    const {data,fetchNextPage,hasNextPage,isFetchingNextPage,status}=useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue
    })

    useChatSocket({addKey,updateKey,queryKey})

    useChatScroll({
        chatRef,
        bottomRef,
        loadMore:fetchNextPage,
        shouldLoadMore:!isFetchingNextPage && !!hasNextPage,
        count:data?.pages[0]?.items?.length ?? 0
        })

    if(status==="loading"){
        return (
            <div className="flex flex-1 flex-col items-center justify-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4"/>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading messages...
                </p>
            </div>
        )
    }
    if(status==="error"){
        return (
            <div className="flex flex-1 flex-col items-center justify-center">
                <ServerCrash className="h-7 w-7 text-zinc-500  my-4"/>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong
                </p>
            </div>
        )
    }
    return ( 
        <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
            {!hasNextPage && <div className="flex-1"/>}
            {!hasNextPage && <ChatWelcome type={type} name={name}/>}
            {hasNextPage && (
                <div className="flex justify-center">
                    {isFetchingNextPage ?
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500 my-4"/>
                    :
                    <button 
                    onClick={()=>fetchNextPage()}
                    className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400
                    text-xs my-4 dark:hover:text-zinc-300 transition">
                        Load previous messages
                    </button>
                    }
                </div>
            )}
            <div className="flex flex-col-reverse mt-auto">
                {data?.pages?.map((group,i)=>(
                    <Fragment key={i}>
                        {group?.items.map((message:MessageWithMemberWithProfile)=>(
                            <ChatItem 
                            key={message?.id}
                            id={message.id}
                            content={message?.content}
                            currentMember={member}
                            socketUrl={socketUrl}
                            socketQuery={socketQuery}
                            fileUrl={message.fileUrl}
                            deleted={message.deleted}
                            timeStamp={format(new Date(message.createdAt),DATE_FORMAT)}
                            isUpdated={message.updatedAt !== message.createdAt}
                            member={message.member}
                            />
                        ))} 
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef} />
        </div>
     );
}
 
export default ChatMessages;