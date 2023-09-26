import { Menu, } from "lucide-react";
import { Sheet,SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import NavigationSideBar from "./navigation/navigation-sidebar";
import ServerSiderbar from "./server/server-sidebar";

const MobileToggle = ({serverId}:{serverId:string}) => {
    return ( 
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0">
                <div className="w-[72px]">
                    <NavigationSideBar />
                </div>
                <ServerSiderbar serverId={serverId}/>
            </SheetContent>
        </Sheet>
     );
}
 
export default MobileToggle;