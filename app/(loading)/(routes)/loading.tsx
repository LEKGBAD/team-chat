import { Loader2 } from "lucide-react";

const Loading = () => {
    return ( 
        <div className="h-full w-full flex items-center justify-center">

            <Loader2 className="animate-spin text-zinc-500 ml-auto w-10 h-10"/>
            loading.....

        </div>
     );
}
 
export default Loading;