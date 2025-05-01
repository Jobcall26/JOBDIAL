import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import StatusOverview from "@/components/dashboard/StatusOverview";
import ActiveCampaigns from "@/components/dashboard/ActiveCampaigns";
import AgentStatus from "@/components/dashboard/AgentStatus";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Layout>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble des activités et performances"
      />
      
      <StatusOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveCampaigns />
        </div>
        <div className="lg:col-span-1">
          <AgentStatus />
        </div>
      </div>
      
      <RecentActivity />
      
      <footer className="mt-8 text-center text-sm text-neutral-dark">
        <p>JOBDIAL CRM © {new Date().getFullYear()} - Tous droits réservés</p>
      </footer>
    </Layout>
  );
}
