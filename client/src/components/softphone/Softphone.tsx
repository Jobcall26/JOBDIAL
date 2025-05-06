import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSoftphone } from "@/hooks/use-softphone";
import { useState } from "react";
import CallControls from "./CallControls";
import ScriptDisplay from "./ScriptDisplay";
import UserAvatar from "@/components/common/UserAvatar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Loader2, PhoneOff, Phone } from "lucide-react";
import { User } from "lucide-react"; // Added import for User icon


type AgentStatus = "available" | "on_call" | "paused" | "offline";

type Campaign = {
  id: number;
  name: string;
  scriptId: number;
};

type CampaignField = {
  label: string;
  type: 'text' | 'select' | 'number';
  placeholder?: string;
  options?: { label: string; value: string }[];
};


export default function Softphone() {
  const { user } = useAuth();
  const { 
    status: softphoneStatus, 
    connect,
    disconnect,
    makeCall,
    endCall,
    currentCall,
    isConnecting,
    isCallInProgress,
    error
  } = useSoftphone();

  const [agentStatus, setAgentStatus] = useState<AgentStatus>("offline");
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  // Fetch agent's assigned campaigns
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/agents/campaigns", user?.id],
    enabled: !!user?.id,
  });

  // Fetch current call info including contact and script
  const { data: callData } = useQuery({
    queryKey: ["/api/calls/current", currentCall?.id],
    enabled: !!currentCall?.id,
  });

  const handleStatusChange = async (newStatus: AgentStatus) => {
    try {
      if (newStatus === "available") {
        // Connect to Twilio/WebRTC when agent becomes available
        await connect();
        setAgentStatus("available");
      } else if (newStatus === "offline") {
        // Disconnect when agent goes offline
        await disconnect();
        setAgentStatus("offline");
      } else {
        setAgentStatus(newStatus);
      }
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };

  const handleCampaignSelect = (campaignId: number) => {
    setSelectedCampaign(campaignId);
  };

  const handleMakeCall = async () => {
    if (!selectedCampaign) {
      return;
    }

    try {
      await makeCall(selectedCampaign);
      setAgentStatus("on_call");
    } catch (err) {
      console.error("Error making call:", err);
    }
  };

  const handleEndCall = async (result: string) => {
    try {
      await endCall(result);
      setAgentStatus("available");
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  // Placeholder for campaign fields -  Replace with actual data fetching
  const campaignFields: CampaignField[] = [
    { label: "Nom", type: "text", placeholder: "Entrez le nom" },
    { label: "Email", type: "text", placeholder: "Entrez l'email" },
    { label: "Téléphone", type: "text", placeholder: "Entrez le numéro de téléphone" },
    {
      label: "Statut",
      type: "select",
      options: [
        { label: "Prospect", value: "prospect" },
        { label: "Client", value: "client" },
      ],
    },
  ];


  // Render different UI based on agent status
  const renderContent = () => {
    // Not connected yet
    if (agentStatus === "offline") {
      return (
        <div className="text-center py-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-neutral-light flex items-center justify-center">
              <PhoneOff className="h-8 w-8 text-neutral-dark" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Softphone déconnecté</h3>
          <p className="text-neutral-dark mb-6">
            Connectez-vous pour commencer à passer des appels
          </p>
          <Button
            onClick={() => handleStatusChange("available")}
            disabled={isConnecting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </div>
      );
    }

    // Connected but not on a call
    if (agentStatus === "available") {
      return (
        <div className="py-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Sélectionner une campagne</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {campaigns?.map((campaign) => (
                <Button
                  key={campaign.id}
                  variant={selectedCampaign === campaign.id ? "default" : "outline"}
                  className={
                    selectedCampaign === campaign.id
                      ? "border-2 border-primary"
                      : ""
                  }
                  onClick={() => handleCampaignSelect(campaign.id)}
                >
                  {campaign.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={handleMakeCall}
              disabled={!selectedCampaign}
              className="bg-[#10B981] hover:bg-[#0D9668] px-8 py-6 rounded-full"
            >
              <Phone className="mr-2 h-6 w-6" />
              Lancer un appel
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => handleStatusChange("offline")}
              className="text-[#EF4444]"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      );
    }

    // On a call
    if (agentStatus === "on_call" && callData) {
      return (
        <div className="py-2">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Informations Client */}
            <div className="w-full md:w-1/3">
              <Card className="bg-white shadow-lg border-blue-200 hover:border-blue-300 transition-all">
                <CardHeader className="pb-2 border-b bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{callData.contact?.name || "Inconnu"}</CardTitle>
                        <div className="text-sm text-blue-700">
                          ID: {callData.contact?.id || "Inconnu"} - {callData.campaign?.name || "Inconnu"}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      {new Date(callData.startTime || Date.now()).toLocaleTimeString()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Informations de contact */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-neutral-dark mb-1">Contact</div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-neutral-dark">Téléphone:</span>
                          <span className="ml-2 font-medium">{callData.contact?.phone || "Inconnu"}</span>
                        </div>
                        <div>
                          <span className="text-neutral-dark">Email:</span>
                          <span className="ml-2 font-medium">{callData.contact?.email || "Inconnu"}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-dark mb-1">Adresse</div>
                      <div className="space-y-2">
                        <div>{callData.contact?.address || "Inconnu"}</div>
                        <div>{callData.contact?.city || "Inconnu"}, {callData.contact?.zipCode || "Inconnu"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Historique des appels */}
                  <div>
                    <div className="font-medium text-neutral-dark mb-2">Historique des appels</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>Dernier contact: {callData.contact?.lastCallDate || 'Premier appel'}</span>
                        <span>Résultat: {callData.contact?.lastCallResult || '-'}</span>
                      </div>
                      <div className="text-sm text-neutral-dark">
                        Total des appels: {callData.contact?.callCount || 0}
                      </div>
                    </div>
                  </div>

                  {/* Formulaire dynamique selon la campagne */}
                  <div className="border rounded-lg p-3 bg-green-50">
                    <div className="font-medium text-green-800 mb-3">Formulaire {callData.campaign?.name || "Inconnu"}</div>
                    <div className="space-y-3">
                      {campaignFields.map((field, index) => (
                        <div key={index}>
                          <label className="text-sm font-medium mb-1 block">{field.label}</label>
                          {field.type === 'select' ? (
                            <select className="w-full p-2 border rounded-md text-sm">
                              {field.options?.map((opt, i) => (
                                <option key={i} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type={field.type} 
                              className="w-full p-2 border rounded-md text-sm"
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4">
                <CallControls 
                  callDuration={callData.duration || "00:00"}
                  onEndCall={handleEndCall}
                />
              </div>
            </div>

            {/* Script display */}
            <div className="w-full md:w-2/3">
              <ScriptDisplay 
                script={callData.script}
                contact={callData.contact}
                user={user}
              />
            </div>
          </div>
        </div>
      );
    }

    // Paused
    if (agentStatus === "paused") {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-4">En pause</h3>
          <Button onClick={() => handleStatusChange("available")}>
            Reprendre les appels
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-lg font-semibold">Softphone</CardTitle>
        <div className="flex space-x-2">
          <StatusIndicator status={agentStatus} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">
            Erreur: {error}
          </div>
        )}
        {renderContent()}
      </CardContent>
    </Card>
  );
}

// Status indicator component
function StatusIndicator({ status }: { status: AgentStatus }) {
  const getStatusColor = () => {
    switch (status) {
      case "available":
        return "bg-[#10B981]";
      case "on_call":
      case "paused":
        return "bg-[#F59E0B]";
      case "offline":
        return "bg-[#EF4444]";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "available":
        return "Disponible";
      case "on_call":
        return "En appel";
      case "paused":
        return "En pause";
      case "offline":
        return "Déconnecté";
    }
  };

  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></div>
      <span className="text-sm">{getStatusText()}</span>
    </div>
  );
}