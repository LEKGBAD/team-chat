import { useEffect, useState } from "react";

type ChatScrollProps ={
    chatRef:React.RefObject<HTMLDivElement>;
    bottomRef:React.RefObject<HTMLDivElement>;
    shouldLoadMore:boolean;
    loadMore:()=>void;
    count:number;
}

export const useChatScroll=({
    chatRef,
    bottomRef,
    shouldLoadMore,
    loadMore,
    count
}:ChatScrollProps)=>{
const [hasInitialized,setHasInitialized]=useState(false);

useEffect(()=>{
const topDiv=chatRef.current;

const handleScroll=()=>{
    const scrolltop=topDiv?.scrollTop;
    if(scrolltop===0 && shouldLoadMore){
        loadMore()
    }
}
topDiv?.addEventListener("scroll",handleScroll)

return ()=>{
    topDiv?.removeEventListener("scroll",handleScroll)
}
},[shouldLoadMore,loadMore,chatRef])

useEffect(()=>{
    const topDiv=bottomRef.current;

    const ShouldAutoScroll=()=>{
        if(!hasInitialized){
            setHasInitialized(true);
            return true;
        }
        if(!topDiv){
            return false
        }

        const distanceFromBottom= (topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight)
                
        return distanceFromBottom <= 100;

    }
    if(ShouldAutoScroll()){
        setTimeout(()=>{
            bottomRef.current?.scrollIntoView({
                behavior:"smooth"
            })
        },100)
    }

},[bottomRef,chatRef,count,hasInitialized])

}