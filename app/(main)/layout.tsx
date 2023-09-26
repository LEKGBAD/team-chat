import NavigationSideBar from "@/components/navigation/navigation-sidebar";
import ModalProvider from "@/components/providers/modal-provider";

const MainLayout =async  ({
    children
}:
{children:React.ReactNode
}) => {
    return ( 
        <div className="h-full">
            <div className="w-0 overflow-hidden  md:flex h-full md:w-[72px] z-30 flex-col fixed inset-y-0">
                <NavigationSideBar />
            </div>
            
            <main className="md:pl-[72px] h-full">
                
                {/* <ModalProvider /> */}
                {children}
            </main>
            
        </div>
     );
}
 
export default MainLayout;