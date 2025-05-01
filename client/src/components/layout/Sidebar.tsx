import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "wouter";

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
      ? `fixed top-0 left-0 z-40 w-64 h-full transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`
      : "hidden md:block"
  } w-64 bg-white border-r border-neutral-light p-4 h-[calc(100vh-61px)]`;

  const isActive = (path: string) => location === path;

  return (
    <aside className={sidebarClasses}>
      <nav className="flex flex-col gap-1">
        <div className="text-xs font-semibold uppercase text-neutral-dark mb-2 mt-2">
          Principal
        </div>
        <Link
          href="/"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/") ? "active" : ""}`}
        >
          <i className="ri-dashboard-line mr-3 text-lg"></i>
          <span>Tableau de bord</span>
        </Link>
        <Link
          href="/softphone"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/softphone") ? "active" : ""}`}
        >
          <i className="ri-phone-line mr-3 text-lg"></i>
          <span>Softphone</span>
        </Link>
        <Link
          href="/agents"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/agents") ? "active" : ""}`}
        >
          <i className="ri-customer-service-2-line mr-3 text-lg"></i>
          <span>Agents</span>
        </Link>
        <Link
          href="/campaigns"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/campaigns") ? "active" : ""}`}
        >
          <i className="ri-megaphone-line mr-3 text-lg"></i>
          <span>Campagnes</span>
        </Link>
        <Link
          href="/contacts"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/contacts") ? "active" : ""}`}
        >
          <i className="ri-contacts-book-line mr-3 text-lg"></i>
          <span>Contacts</span>
        </Link>
        <Link
          href="/scripts"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/scripts") ? "active" : ""}`}
        >
          <i className="ri-file-list-3-line mr-3 text-lg"></i>
          <span>Scripts</span>
        </Link>
        <Link
          href="/history"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/history") ? "active" : ""}`}
        >
          <i className="ri-history-line mr-3 text-lg"></i>
          <span>Historique</span>
        </Link>

        <div className="text-xs font-semibold uppercase text-neutral-dark mb-2 mt-6">
          Supervision
        </div>
        <Link
          href="/supervision"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/supervision") ? "active" : ""}`}
        >
          <i className="ri-eye-line mr-3 text-lg"></i>
          <span>Temps réel</span>
        </Link>
        <Link
          href="/stats"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/stats") ? "active" : ""}`}
        >
          <i className="ri-bar-chart-line mr-3 text-lg"></i>
          <span>Statistiques</span>
        </Link>
        <Link
          href="/reports"
          onClick={handleLinkClick}
          className={`sidebar-icon ${isActive("/reports") ? "active" : ""}`}
        >
          <i className="ri-file-chart-line mr-3 text-lg"></i>
          <span>Rapports</span>
        </Link>

        {isAdmin && (
          <>
            <div className="text-xs font-semibold uppercase text-neutral-dark mb-2 mt-6">
              Configuration
            </div>
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className={`sidebar-icon ${isActive("/settings") ? "active" : ""}`}
            >
              <i className="ri-settings-line mr-3 text-lg"></i>
              <span>Paramètres</span>
            </Link>
            <Link
              href="/users"
              onClick={handleLinkClick}
              className={`sidebar-icon ${isActive("/users") ? "active" : ""}`}
            >
              <i className="ri-user-settings-line mr-3 text-lg"></i>
              <span>Utilisateurs</span>
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto pt-6">
        <div className="bg-neutral-lightest rounded-lg shadow-sm p-4 border border-neutral-light">
          <div className="flex items-center">
            <i className="ri-headphone-line text-2xl mr-3 text-primary"></i>
            <div>
              <div className="text-sm font-medium">Support technique</div>
              <div className="text-xs text-neutral-dark">Besoin d&apos;aide ?</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors w-full mt-3 text-sm">
            Contacter
          </button>
        </div>
      </div>
    </aside>
  );
}
