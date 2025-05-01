import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }: { children: ReactNode }) {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar isOpen={true} onClose={() => {}} />}
        <motion.main 
          className="flex-1 overflow-auto p-4 md:p-6 bg-neutral-lightest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
}
