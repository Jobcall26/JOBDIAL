import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const isMobile = useMobile();
  const { user } = useAuth();
  
  const isAdmin = user?.role === "admin";
  
  // Close mobile sidebar when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  // Define sidebar classes based on mobile state and if sidebar is open
  const sidebarClasses = `${
    isMobile
      ? `fixed top-0 left-0 z-40 w-64 h-full shadow-xl`
      : "hidden md:block"
  } w-64 bg-white border-r border-neutral-light p-4 h-[calc(100vh-61px)]`;

  const isActive = (path: string) => location === path;
  
  // Animation variants for sidebar links
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.07
      }
    }
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };
  
  const groupVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.07
      }
    }
  };
  
  const supportVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.8, duration: 0.5 }
    }
  };

  return (
    <AnimatePresence>
      {(!isMobile || isOpen) && (
        <motion.aside 
          className={sidebarClasses}
          initial={isMobile ? { x: -320 } : "hidden"}
          animate={isMobile ? { x: 0 } : "visible"}
          exit={isMobile ? { x: -320 } : "hidden"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.nav 
            className="flex flex-col gap-1"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-xs font-semibold uppercase text-neutral-dark mb-2 mt-2">
              Principal
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/"
                onClick={handleLinkClick}
                className={`sidebar-icon ${isActive("/") ? "active" : ""}`}
              >
                <i className="ri-dashboard-line mr-3 text-lg"></i>
                <span>Tableau de bord</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/softphone"
                onClick={handleLinkClick}
                className={`sidebar-icon ${isActive("/softphone") ? "active" : ""}`}
              >
                <i className="ri-phone-line mr-3 text-lg"></i>
                <span>Softphone</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/agents"
                onClick={handleLinkClick}
                className={`sidebar-icon ${isActive("/agents") ? "active" : ""}`}
              >
                <i className="ri-customer-service-2-line mr-3 text-lg"></i>
                <span>Agents</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/campaigns"
                onClick={handleLinkClick}
                className={`sidebar-icon ${isActive("/campaigns") ? "active" : ""}`}
              >
                <i className="ri-megaphone-line mr-3 text-lg"></i>
                <span>Campagnes</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/contacts"
                onClick={handleLinkClick}
                className={`sidebar-icon ${isActive("/contacts") ? "active" : ""}`}
              >
                <i className="ri-contacts-book-line mr-3 text-lg"></i>
                <span>Contacts</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/scripts"
                onClick={handleLinkClick}
                className={`sidebar-icon ${isActive("/scripts") ? "active" : ""}`}
              >
                <i className="ri-file-list-3-line mr-3 text-lg"></i>
                <span>Scripts</span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/history"
                onClick={handleLinkClick}
                className={`sidebar-icon ${isActive("/history") ? "active" : ""}`}
              >
                <i className="ri-history-line mr-3 text-lg"></i>
                <span>Historique</span>
              </Link>
            </motion.div>

            <motion.div 
              variants={groupVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="text-xs font-semibold uppercase text-neutral-dark mb-2 mt-6">
                Supervision
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/supervision"
                  onClick={handleLinkClick}
                  className={`sidebar-icon ${isActive("/supervision") ? "active" : ""}`}
                >
                  <i className="ri-eye-line mr-3 text-lg"></i>
                  <span>Temps réel</span>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/stats"
                  onClick={handleLinkClick}
                  className={`sidebar-icon ${isActive("/stats") ? "active" : ""}`}
                >
                  <i className="ri-bar-chart-line mr-3 text-lg"></i>
                  <span>Statistiques</span>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/reports"
                  onClick={handleLinkClick}
                  className={`sidebar-icon ${isActive("/reports") ? "active" : ""}`}
                >
                  <i className="ri-file-chart-line mr-3 text-lg"></i>
                  <span>Rapports</span>
                </Link>
              </motion.div>
            </motion.div>

            {isAdmin && (
              <motion.div 
                variants={groupVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="text-xs font-semibold uppercase text-neutral-dark mb-2 mt-6">
                  Configuration
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link
                    href="/settings"
                    onClick={handleLinkClick}
                    className={`sidebar-icon ${isActive("/settings") ? "active" : ""}`}
                  >
                    <i className="ri-settings-line mr-3 text-lg"></i>
                    <span>Paramètres</span>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link
                    href="/users"
                    onClick={handleLinkClick}
                    className={`sidebar-icon ${isActive("/users") ? "active" : ""}`}
                  >
                    <i className="ri-user-settings-line mr-3 text-lg"></i>
                    <span>Utilisateurs</span>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.nav>

          <motion.div 
            className="mt-auto pt-6"
            variants={supportVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-neutral-lightest rounded-lg shadow-sm p-4 border border-neutral-light hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center">
                <i className="ri-headphone-line text-2xl mr-3 text-primary"></i>
                <div>
                  <div className="text-sm font-medium">Support technique</div>
                  <div className="text-xs text-neutral-dark">Besoin d&apos;aide ?</div>
                </div>
              </div>
              <motion.button 
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors w-full mt-3 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contacter
              </motion.button>
            </div>
          </motion.div>
          
          {isMobile && (
            <motion.div 
              className="absolute top-0 right-0 mt-2 mr-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-neutral-lightest hover:bg-neutral-light transition-colors"
              >
                <i className="ri-close-line text-lg text-neutral-dark"></i>
              </button>
            </motion.div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
