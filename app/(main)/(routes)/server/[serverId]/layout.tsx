import ServerSiderbar from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";


const ServerIdLayout = async ({children,params
}:
{
    children:React.ReactNode
    params:{serverId:string}
}) => {
    const profile=await currentProfile()

    if (!profile){
        redirectToSignIn()
    }
    const server=await db.server.findUnique({
        where:{
            id:params?.serverId,
            members:{
                some:{
                    profileId:profile?.id
                }
            }
        }
    })
    if(!server){
        return redirect("/");
    }
    return ( 
        <div>
            <div className="w-0 overflow-hidden md:flex h-full md:w-60 z-20 flex-col inset-y-0 fixed">
                <ServerSiderbar serverId={params.serverId}/>
            </div>
            <main className="h-full md:pl-60">
            {children}
            </main>
            
        </div>
     );
}
 
export default ServerIdLayout;