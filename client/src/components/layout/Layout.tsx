import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMobile } from "@/hooks/use-mobile";

export default function Layout({ children }: { children: ReactNode }) {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar isOpen={true} onClose={() => {}} />}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-neutral-lightest">
          {children}
        </main>
      </div>
    </div>
  );
}
