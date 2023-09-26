"use client"

import { UseSocket } from "./providers/socket-provider";
import { Badge } from "./ui/badge";

const SocketIndicator = () => {
    const {isConnected}=UseSocket();
    
    if(!isConnected){
        return (
            <Badge variant="outline" className="bg-yellow-600 text-white border-none">
                Fallback:polling every 1s
            </Badge>
        )
    }
    return (
        <Badge variant="outline" className="bg-emerald-600 text-white border-none">
            Live:Real-time updates
        </Badge>
    )
}
 
export default SocketIndicator;