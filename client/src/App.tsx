import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import SoftphonePage from "@/pages/softphone-page";
import AgentsPage from "@/pages/agents-page";
import CampaignsPage from "@/pages/campaigns-page";
import ScriptsPage from "@/pages/scripts-page";
import SupervisionPage from "@/pages/supervision-page";
import CallHistoryPage from "@/pages/call-history-page";
import SettingsPage from "@/pages/settings-page";
import ContactsPage from "@/pages/contacts-page";
import StatsPage from "@/pages/stats-page";
import ReportsPage from "@/pages/reports-page";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { SoftphoneProvider } from "@/hooks/use-softphone";
import { useEffect, useState } from "react";
import WelcomeAnimation from "@/components/animations/WelcomeAnimation";
import { AnimatePresence } from "framer-motion";
// Import additional pages for agent interface
import AgentDashboardPage from "@/pages/agent-dashboard-page";
import AgentSoftphonePage from "@/pages/agent-softphone-page";
import AgentScriptsPage from "@/pages/agent-scripts-page";
import AgentHistoryPage from "@/pages/agent-history-page";

// Composant pour gérer l'animation de bienvenue
function WelcomeHandler() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [initialAuth, setInitialAuth] = useState(true);
  
  useEffect(() => {
    // Si l'utilisateur vient de se connecter (n'était pas connecté avant)
    if (user && initialAuth) {
      setInitialAuth(false);
      setShowWelcome(true);
      
      // Écouter l'événement de fin d'animation envoyé par le composant WelcomeAnimation
      const handleAnimationComplete = () => {
        setShowWelcome(false);
        console.log("Animation terminée, état mis à jour");
      };
      
      document.addEventListener('welcomeAnimationComplete', handleAnimationComplete);
      
      return () => {
        document.removeEventListener('welcomeAnimationComplete', handleAnimationComplete);
      };
    } else if (user) {
      setInitialAuth(false);
    }
  }, [user, initialAuth]);
  
  return (
    <AnimatePresence mode="wait">
      {showWelcome && <WelcomeAnimation />}
    </AnimatePresence>
  );
}

function Router() {
  console.log("Router component initializing");
  const { user } = useAuth();
  const isAgent = user?.role === "agent";
  
  useEffect(() => {
    console.log("Router component mounted");
  }, []);
  
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Routes spécifiques aux agents */}
      {isAgent && (
        <>
          <ProtectedRoute path="/" component={AgentDashboardPage} />
          <ProtectedRoute path="/agent-dashboard" component={AgentDashboardPage} />
          <ProtectedRoute path="/agent-softphone" component={AgentSoftphonePage} />
          <ProtectedRoute path="/agent-scripts" component={AgentScriptsPage} />
          <ProtectedRoute path="/agent-history" component={AgentHistoryPage} />
          {/* Fallback pour éviter l'accès aux routes admin */}
          <Route path="*" component={AgentDashboardPage} />
        </>
      )}
      
      {/* Routes pour les administrateurs */}
      {!isAgent && (
        <>
          <ProtectedRoute path="/" component={DashboardPage} />
          <ProtectedRoute path="/softphone" component={SoftphonePage} />
          <ProtectedRoute path="/agents" component={AgentsPage} />
          <ProtectedRoute path="/campaigns" component={CampaignsPage} />
          <ProtectedRoute path="/contacts" component={ContactsPage} />
          <ProtectedRoute path="/scripts" component={ScriptsPage} />
          <ProtectedRoute path="/supervision" component={SupervisionPage} />
          <ProtectedRoute path="/history" component={CallHistoryPage} />
          <ProtectedRoute path="/stats" component={StatsPage} />
          <ProtectedRoute path="/reports" component={ReportsPage} />
          <ProtectedRoute path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  console.log("App component initializing");
  
  useEffect(() => {
    console.log("App component mounted");
    
    // Ne pas rediriger automatiquement - cela sera géré par le Router
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => {
        console.log("Auth check response status:", res.status);
        return res.json().catch(() => ({ error: "Invalid JSON" }));
      })
      .then(data => console.log("Auth check response data:", data))
      .catch(err => console.error("Auth check failed:", err));
  }, []);
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <SoftphoneProvider>
              <Router />
              <WelcomeHandler />
              <Toaster />
            </SoftphoneProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return <div>Application Error. Please check console for details.</div>;
  }
}

export default App;
