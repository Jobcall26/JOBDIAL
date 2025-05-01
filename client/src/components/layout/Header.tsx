import { useAuth } from "@/hooks/use-auth";
import UserAvatar from "@/components/common/UserAvatar";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.header 
        className="bg-white border-b border-neutral-light"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            {isMobile && (
              <motion.button 
                onClick={toggleSidebar} 
                className="md:hidden mr-2 text-neutral-dark"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isSidebarOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
            <motion.div 
              className="flex items-center"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <motion.div 
                className="gradient-bg text-white font-bold text-2xl px-3 py-1 rounded mr-2"
                whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
              >
                J
              </motion.div>
              <motion.h1 
                className="text-xl font-bold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                JOBDIAL
              </motion.h1>
            </motion.div>
          </div>
          <div className="flex items-center">
            <motion.div 
              className="hidden md:flex items-center mr-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className="status-badge status-badge-available">
                <motion.span 
                  className="h-2 w-2 bg-[#10B981] rounded-full mr-1"
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    repeatDelay: 1
                  }}
                />
                Système opérationnel
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="mr-2 text-right hidden md:block">
                <div className="text-sm font-semibold">{user?.username}</div>
                <div className="text-xs text-neutral-dark">
                  {user?.role === "admin" ? "Administrateur" : "Agent"}
                </div>
              </div>
              <div className="relative">
                <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                  <UserAvatar
                    className="rounded-full bg-neutral-light w-8 h-8 flex items-center justify-center overflow-hidden"
                    user={user}
                  />
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>
      
      {isMobile && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
    </>
  );
}
