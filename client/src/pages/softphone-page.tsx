import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import Softphone from "@/components/softphone/Softphone";
import { Phone } from "lucide-react";

export default function SoftphonePage() {
  return (
    <Layout>
      <PageHeader
        title="Softphone"
        description="Interface d'appel pour contacter vos prospects"
      />
      
      <div className="grid grid-cols-1 gap-6">
        <Softphone />
      </div>
      
      <div className="mt-6 bg-white rounded-lg p-4 border border-neutral-light">
        <h3 className="text-lg font-medium mb-3">Conseils d&apos;utilisation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-neutral-light rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <Phone className="h-5 w-5 mr-2" />
              <span className="font-medium">Avant l&apos;appel</span>
            </div>
            <p className="text-sm text-neutral-dark">
              Vérifiez votre connection internet et le volume de votre micro. Connectez-vous au softphone et sélectionnez une campagne avant de commencer.
            </p>
          </div>
          
          <div className="p-3 border border-neutral-light rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <i className="ri-user-voice-line text-lg mr-2"></i>
              <span className="font-medium">Pendant l&apos;appel</span>
            </div>
            <p className="text-sm text-neutral-dark">
              Suivez le script affiché à l&apos;écran. Prenez des notes importantes pendant la conversation. Vous pouvez mettre en sourdine si nécessaire.
            </p>
          </div>
          
          <div className="p-3 border border-neutral-light rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <i className="ri-phone-line text-lg mr-2"></i>
              <span className="font-medium">Fin d&apos;appel</span>
            </div>
            <p className="text-sm text-neutral-dark">
              Terminez l&apos;appel en sélectionnant le résultat approprié : Intéressé, Rappel, Refusé ou Absent. Cela permettra de suivre les performances.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
