
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

      {user?.role === 'admin' && (
        <div className="mt-6 bg-white rounded-lg p-4 border border-neutral-light">
          <h3 className="text-lg font-medium mb-3">Conseils d&apos;utilisation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border border-neutral-light rounded-lg">
              <div className="flex items-center text-primary mb-2">
                <Phone className="h-5 w-5 mr-2" />
                <span className="font-medium">Configuration</span>
              </div>
              <p className="text-sm text-neutral-dark">
                Gérez les paramètres de connexion et les configurations des agents pour le softphone.
              </p>
            </div>
            
            <div className="p-3 border border-neutral-light rounded-lg">
              <div className="flex items-center text-primary mb-2">
                <i className="ri-user-voice-line text-lg mr-2"></i>
                <span className="font-medium">Supervision</span>
              </div>
              <p className="text-sm text-neutral-dark">
                Surveillez les performances et l'activité des agents en temps réel.
              </p>
            </div>

            <div className="p-3 border border-neutral-light rounded-lg">
              <div className="flex items-center text-primary mb-2">
                <i className="ri-settings-line text-lg mr-2"></i>
                <span className="font-medium">Administration</span>
              </div>
              <p className="text-sm text-neutral-dark">
                Gérez les campagnes, les scripts et les paramètres du système de téléphonie.
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
