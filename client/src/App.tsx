import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
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
import { WebSocketProvider } from "@/hooks/use-websocket";
import { SoftphoneProvider } from "@/hooks/use-softphone";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/softphone" component={SoftphonePage} />
      <ProtectedRoute path="/agents" component={AgentsPage} />
      <ProtectedRoute path="/campaigns" component={CampaignsPage} />
      <ProtectedRoute path="/scripts" component={ScriptsPage} />
      <ProtectedRoute path="/supervision" component={SupervisionPage} />
      <ProtectedRoute path="/history" component={CallHistoryPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <SoftphoneProvider>
            <Router />
            <Toaster />
          </SoftphoneProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
