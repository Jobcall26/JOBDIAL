import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import Softphone from "@/components/softphone/Softphone";
import { Phone } from "lucide-react";


export default function AgentSoftphonePage() {
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
              Restez professionnel et suivez le script. Écoutez attentivement le client et prenez des notes si nécessaire.
            </p>
          </div>

          <div className="p-3 border border-neutral-light rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <i className="ri-customer-service-2-line text-lg mr-2"></i>
              <span className="font-medium">Après l&apos;appel</span>
            </div>
            <p className="text-sm text-neutral-dark">
              Complétez vos notes et qualifiez l&apos;appel correctement. Prenez une courte pause si nécessaire avant le prochain appel.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}