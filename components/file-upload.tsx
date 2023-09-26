"use client"
import { UploadDropzone} from "@/lib/uploadthing";
import "@uploadthing/react/styles.css"
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEffect } from "react";

interface FileUploadProps{
    onChange:(url?:string)=>void;
    value:string;
    endpoint:"messageFile"|"serverImage"

}

const FileUpload=({onChange,value,endpoint}:FileUploadProps)=>{

    const fileType=value.split(".").pop()

    
     useEffect(()=>{
        
     },[])
    if(value && fileType !=="pdf"){
        return (
            <div className="relative h-20 w-20">
                <Image 
                fill
                src={value}
                alt="Upload"
                className="rounded-full"
                />
                <Button
                className="bg-rose-500 hover:bg-rose-500/80 text-white p-1 rounded-full absolute top-0 right-0 h-4 w-4 shadow-sm"
                type="button"
                onClick={()=>{
                    onChange("")
                }}
                >
                    <X className="h-4 w-4"/>
                </Button>
            </div>
        )
    }
    if(value && fileType === "pdf"){
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400"/>
                <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                    {value}
                </a>
                <Button
                className="bg-rose-500 hover:bg-rose-500/80 text-white p-1 rounded-full 
                absolute -top-2 -right-2 h-4 w-4 shadow-sm"
                type="button"
                onClick={()=>{
                    onChange("")
                }}
                >
                    <X className="h-4 w-4"/>
                </Button>
            </div>
        )
    }
    return (
        <UploadDropzone 
        endpoint={endpoint}
        onClientUploadComplete={(res)=>{
            onChange(res?.[0].url)
        }}
        onUploadError={(error:Error)=>{
            console.log(error)
        }}
        />
    )
}
export default FileUpload