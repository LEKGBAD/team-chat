"use client"

import { useParams,useRouter } from "next/navigation";
import Image from "next/image";
import ActionToolTip from "@/components/action-tooltip";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
    id:string;
    name:string;
    imageUrl:string;
}
const NavigationItem = ({id,name,imageUrl}:NavigationItemProps) => {
    const params=useParams()
    const router=useRouter()
    return ( 
        <ActionToolTip label={name} side="right" align="center">
        <button
        onClick={()=>router.push(`/server/${id}`)}
        className="group relative flex items-center"
        >
            <div
            className={cn("absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId !==id  && "group-hover:h-[20px]",
            params?.serverId ===id  ? "h-[36px]":"h-[8px]")
        }
           / > 
           <div className={cn(" relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
           params.serverId === id && "bg-primary/10 text-primary rounded-[16px]")}>
            <Image 
            fill
            src={imageUrl}
            alt="Server Image"
            />
           </div>
           
        </button>
        </ActionToolTip>
     );
}
 
export default NavigationItem;