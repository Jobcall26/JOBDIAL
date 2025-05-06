import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import Softphone from "@/components/softphone/Softphone";
import { Phone } from "lucide-react";

export default function SoftphonePage() {
  const { user } = useAuth();

  return (
    <Layout>
      <PageHeader
        title="Softphone"
        description="Interface d'appel pour contacter vos prospects"
      />

      <div className="grid grid-cols-1 gap-6">
        <Softphone />
      </div>
    </Layout>
  );
}