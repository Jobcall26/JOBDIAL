import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { X, Menu, Phone, User, ChevronRight, Clock, FileText, BarChart, WifiOff, Wifi } from "lucide-react";
import { useSoftphone } from "@/hooks/use-softphone";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const { status: softphoneStatus, connect, disconnect } = useSoftphone();
  const { isConnected: wsConnected, disconnect: wsDisconnect } = useWebSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useMobile();
  const [location] = useLocation();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  // Navbar at the top of the screen (always visible)
  const AgentNavbar = () => (
    <header className="bg-primary text-white h-16 flex items-center justify-between px-4 shadow-md z-30">
      <div className="flex items-center">
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-4 p-2 hover:bg-primary-dark rounded-full transition-colors"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
        <div className="flex items-center">
          <div className="font-bold text-xl mr-2">JOBDIAL</div>
          <Badge variant="outline" className="bg-primary-dark border-none">
            Agent
          </Badge>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium hidden md:block">
          {currentTime.toLocaleTimeString()}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                {wsConnected ? (
                  <Wifi className="h-5 w-5 text-green-400" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-400" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{wsConnected ? "WebSocket connecté" : "WebSocket déconnecté"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant={softphoneStatus === "ready" ? "default" : "outline"}
          size="sm"
          className={`rounded-full ${softphoneStatus === "ready" ? "bg-green-500 hover:bg-green-600" : "bg-transparent"} px-3 border-white text-white hover:text-white hover:border-white`}
          onClick={softphoneStatus === "ready" ? disconnect : connect}
        >
          <div className="flex items-center">
            <div
              className={`h-2 w-2 rounded-full mr-2 ${softphoneStatus === "ready" ? "bg-white" : "bg-red-500"}`}
            />
            {softphoneStatus === "ready" ? "Connecté" : "Déconnecté"}
          </div>
        </Button>

        <div className="flex items-center">
          <span className="font-medium text-sm hidden md:block mr-2">
            {user?.username}
          </span>
          <Link href="/logout" onClick={handleLogout}>
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-full text-white hover:bg-primary-dark"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );

  // Collapsed sidebar with just icons (on desktop)
  const CollapsedSidebar = () => (
    <div className="hidden md:flex flex-col items-center w-16 bg-white border-r border-neutral-light py-4 h-[calc(100vh-64px)]">
      <div className="flex flex-col space-y-6">
        <Link
          href="/agent-dashboard"
          className={`flex justify-center p-2 rounded-lg ${isActive("/agent-dashboard") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
        >
          <BarChart className="h-6 w-6" />
        </Link>
        <Link
          href="/agent-softphone"
          className={`flex justify-center p-2 rounded-lg ${isActive("/agent-softphone") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
        >
          <Phone className="h-6 w-6" />
        </Link>
        <Link
          href="/agent-scripts"
          className={`flex justify-center p-2 rounded-lg ${isActive("/agent-scripts") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
        >
          <FileText className="h-6 w-6" />
        </Link>
        <Link
          href="/agent-history"
          className={`flex justify-center p-2 rounded-lg ${isActive("/agent-history") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
        >
          <Clock className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );

  // Mobile sidebar (only visible when toggled)
  const MobileSidebar = () => (
    <div> {/* Removed AnimatePresence */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-xl"> {/* Removed motion.div */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="font-bold text-xl">JOBDIAL</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <Link
                  href="/agent-dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center p-2 rounded-lg ${isActive("/agent-dashboard") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
                >
                  <BarChart className="h-5 w-5 mr-3" />
                  <span>Tableau de bord</span>
                </Link>
                <Link
                  href="/agent-softphone"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center p-2 rounded-lg ${isActive("/agent-softphone") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
                >
                  <Phone className="h-5 w-5 mr-3" />
                  <span>Softphone</span>
                </Link>
                <Link
                  href="/agent-scripts"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center p-2 rounded-lg ${isActive("/agent-scripts") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <span>Scripts</span>
                </Link>
                <Link
                  href="/agent-history"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center p-2 rounded-lg ${isActive("/agent-history") ? "bg-primary-light text-primary" : "text-neutral-dark hover:bg-neutral-lightest"}`}
                >
                  <Clock className="h-5 w-5 mr-3" />
                  <span>Historique</span>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{user?.username}</div>
                    <div className="text-xs text-neutral-dark">Agent</div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AgentNavbar />
      <div className="flex flex-1">
        <CollapsedSidebar />
        <MobileSidebar />
        <main className="flex-1 p-4 bg-neutral-lightest overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}