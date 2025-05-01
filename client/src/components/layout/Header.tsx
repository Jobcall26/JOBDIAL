import { useAuth } from "@/hooks/use-auth";
import UserAvatar from "@/components/common/UserAvatar";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <header className="bg-white border-b border-neutral-light">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            {isMobile && (
              <button onClick={toggleSidebar} className="md:hidden mr-2 text-neutral-dark">
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
            <div className="flex items-center">
              <div className="gradient-bg text-white font-bold text-2xl px-3 py-1 rounded mr-2">
                J
              </div>
              <h1 className="text-xl font-bold">JOBDIAL</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center mr-4">
              <div className="status-badge status-badge-available">
                <span className="h-2 w-2 bg-[#10B981] rounded-full mr-1"></span>
                Système opérationnel
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-2 text-right hidden md:block">
                <div className="text-sm font-semibold">{user?.username}</div>
                <div className="text-xs text-neutral-dark">
                  {user?.role === "admin" ? "Administrateur" : "Agent"}
                </div>
              </div>
              <div className="relative">
                <UserAvatar
                  className="rounded-full bg-neutral-light w-8 h-8 flex items-center justify-center overflow-hidden"
                  user={user}
                />
                <button
                  onClick={handleLogout}
                  className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {isMobile && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
    </>
  );
}
