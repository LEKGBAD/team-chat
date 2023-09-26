"use client"
import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";
import qs from "query-string"
import { Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";


const DeleteChannelModal = () => {
    const {onOpen,isOpen,onClose,type,data} = useModal();
    


    const [isLoading, setIsLoading] = useState(false)
    const isModalOpen=isOpen && type==="deleteChannel"
    const router=useRouter()

    const {server,channel}=data;


    const onConfirm=async ()=>{
        setIsLoading(true);
       
        try{
            const url=qs.stringifyUrl({
                url:`/api/channels/${channel?.id}`,
                query:{
                    serverId:server?.id
                }
            })
            const response=await axios.delete(url)
            onClose()
            router.refresh()
            router.push(`/server/${server?.id}`)

        }catch(err){
            console.log(err)
        }
        finally{
            setIsLoading(false)
        }

    }

    return ( 
        
        <Dialog open={isModalOpen} onOpenChange={onClose} >
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Channel
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to delete <span className="font-semibold text-indigo-500">{channel?.name}</span> channel?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button
                        disabled={isLoading}
                        variant="ghost"
                        onClick={()=>onClose()}
                        >
                            Cancel
                        </Button>
                        <Button
                        disabled={isLoading}
                        variant="primary"
                        onClick={onConfirm}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
                
                
            </DialogContent>

        </Dialog>
        
        
     );
    
}
 
export default DeleteChannelModal;