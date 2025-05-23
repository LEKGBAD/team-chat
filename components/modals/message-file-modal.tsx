"use client"
import { useForm } from "react-hook-form";
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";
import axios from "axios"
import {useRouter} from "next/navigation"
import qs from "query-string"
import { Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle 
} from "@/components/ui/dialog";
import { Form ,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import { useModal } from "@/hooks/use-modal-store";



const formSchema=z.object({
    fileUrl:z.string().min(1,{
        message:"Attachment is required"
    })
})


const MessageFilelModal = () => {

    const {isOpen,onClose,type,data}=useModal()
    const router=useRouter()
    const isModalOpen=isOpen && type==="messageFile"
   const {apiUrl,query}=data;

    const form=useForm({
        resolver:zodResolver(formSchema),
        defaultValues:{
            fileUrl:"",
        }
    })

    const isLoading=form.formState.isSubmitting;
    
    const onSubmit= async (values:z.infer<typeof formSchema>)=>{
        try{
        //  const {data:{server}}=await axios.post("/api/servers",values)
        const url=qs.stringifyUrl({
            url:apiUrl || "",
            query:query
        })
        await axios.post(url,{...values,content:values.fileUrl})
         form.reset();
         router.refresh();
         handleClose()
        }catch(err){
            console.log(err)
        }
    }

    const handleClose=()=>{
        form.reset();
        onClose();
    }
    
    
    return ( 
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Send a file as a message
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField 
                                control={form.control}
                                name="fileUrl"
                                render={({field})=>(
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload 
                                            endpoint="messageFile"
                                            value={field.value}
                                            onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            
                        </div>
                        <DialogFooter className="px-6 py-4 bg-gray-100">
                            <Button disabled={isLoading} variant="primary">Send</Button>

                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

        </Dialog>
     );
}
 
export default MessageFilelModal;