"use client"
import * as z from "zod"
import qs from "query-string"
import { Member, MemberRole, Profile } from "@prisma/client";
import UserAvatar from "../user-avatar";
import ActionToolTip from "../action-tooltip";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { useRouter,useParams } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
    id:string;
    content:string;
    member:Member & {
        profile:Profile
    };
    timeStamp:string;
    fileUrl:string|null;
    deleted:boolean;
    currentMember:Member;
    isUpdated:boolean;
    socketUrl:string;
    socketQuery:Record<string,string>
}

const roleIconMap={
    GUEST:null,
    MODERATOR:<ShieldCheck className="w-4 h-4 ml-2 text-indigo-500"/>,
    ADMIN:<ShieldAlert className="w-4 h-4 ml-2 text-rose-500"/>,
}

const formSchema=z.object({
    content:z.string().min(1)
})

const ChatItem = ({
    content,
    id,
    member,
    timeStamp,
    fileUrl,
    deleted,
    currentMember,
    isUpdated,
    socketUrl,
    socketQuery


}:ChatItemProps) => {
    const [isEditing,setIsEditing]=useState(false);
    const [isDeleting,setIsDeleting]=useState(false);
    const {onOpen}=useModal()

    
    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
            content:content
        }
    })

    const isLoading=form.formState.isSubmitting
    const router=useRouter()
    const params=useParams()

    useEffect(()=>{
        form.reset({
            content:content
        })
    },[content])
    
    useEffect(()=>{
        const handleKeyDown=(event:any)=>{
            if(event.key==="Escape" || event.keyCode===27){
                setIsEditing(false)
            }
        }
        window.addEventListener("keydown",handleKeyDown)

        return ()=>{
            window.removeEventListener("keydown",handleKeyDown)
        }
    },[])

    const fileType=fileUrl?.split(".").pop();
    const isAdmin=currentMember.role === MemberRole.ADMIN;
    const isModerator=currentMember.role === MemberRole.MODERATOR;
    const isOwner=currentMember.id===member.id;
    const canDelete=!deleted && (isAdmin || isModerator || isOwner);
    const canEdit=!deleted && isOwner && !fileUrl
    const isPDF=fileType==="pdf" && fileUrl
    const isImage=!isPDF && fileUrl

    const onMemberClick=()=>{
        
        if(member.profile.id===currentMember.profileId){
            return;
        }
        router.push(`/server/${params?.serverId}/conversations/${member.id}`)
    }
    const onSubmit=async(values:z.infer<typeof formSchema>)=>{
        try{
            const url=qs.stringifyUrl({
                url:`${socketUrl}/${id}`,
                query:socketQuery
            })
            await axios.patch(url,values);
            form.reset();
            setIsEditing(false)
            router.refresh()
            
        }catch(err){
            console.log(err)
        }
    }
    return ( 
        <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div className="cursor-pointer hover:drop-shadow-md transition" 
                onClick={onMemberClick}
                >
                    <UserAvatar src={member?.profile?.imageUrl}/>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2 cursor-pointer">
                        <div className="flex items-center">
                            <p className="font-semibold text-sm hover:underline cursor-pointer"
                            onClick={onMemberClick}
                            >
                                {member.profile.name}
                            </p>
                            <ActionToolTip label={member.role}>
                                {roleIconMap[member.role]}
                            </ActionToolTip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {timeStamp}
                        </span>
                    </div>
                    {isImage && (
                        <a 
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square rounded-md mt-2 overflow-hidden border flex
                        items-center bg-secondary h-48 w-48"
                        >
                            <Image src={fileUrl} alt="content" fill className="object-cover"/>
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400"/>
                        <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                        >
                            PDF file
                        </a>
                        
                    </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn("text-sm text-zinc-600 dark:text-zinc-300",
                        deleted && "text-zinc-500 dark:text-zinc-400 text-xs mt-1")}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                                    edited
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}
                            className="flex items-center w-full gap-x-2 pt-2"
                            >
                                <FormField 
                                control={form.control}
                                name="content"
                                render={({field})=>(
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <div className="relative w-full">
                                                <Input 
                                                disabled={isLoading}
                                                className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75
                                                border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0
                                                text-zinc-600 dark:text-zinc-200"
                                                placeholder="Edited field"
                                                {...field}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                    )}
                                />
                                <Button disabled={isLoading} variant="primary" size="sm">
                                    Save
                                </Button>
                            </form>
                            <span className="text-[10px] mt-1 text-zinc-400">
                                Press esc to cancel, Enter to save
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDelete && (
                <div className="hidden group-hover:flex items-center gap-x-2 p-1 absolute -top-2 right-5 bg-white
                dark:bg-zinc-800 border rounded-sm">
                    {canEdit && (
                        <ActionToolTip label="Edit">
                            <Edit 
                            onClick={()=>setIsEditing(true)}
                            className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600
                            dark:hover:text-zinc-300 transition"/>
                        </ActionToolTip>
                    )}
                    <ActionToolTip label="Delete">
                            <Trash 
                            onClick={()=>onOpen("deleteMessage",
                            {apiUrl:`${socketUrl}/${id}`,query:socketQuery})}
                            className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600
                            dark:hover:text-zinc-300 transition"/>
                        </ActionToolTip>
                </div>
            )}
        </div>
     );
}
 
export default ChatItem;