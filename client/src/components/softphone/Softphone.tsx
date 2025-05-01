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

type AgentStatus = "available" | "on_call" | "paused" | "offline";

type Campaign = {
  id: number;
  name: string;
  scriptId: number;
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
            className="bg-[#10B981] hover:bg-[#0D9668]"
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
            {/* Contact info */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <UserAvatar
                      className="w-12 h-12 mr-3"
                      user={{ username: callData.contact?.name || "Inconnu" }}
                    />
                    <div>
                      <div className="font-medium">{callData.contact?.name || "Inconnu"}</div>
                      <div className="text-sm text-neutral-dark">{callData.contact?.phone || ""}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {callData.contact?.email && (
                      <div className="flex justify-between">
                        <span className="text-neutral-dark">Email:</span>
                        <span>{callData.contact.email}</span>
                      </div>
                    )}
                    {callData.contact?.company && (
                      <div className="flex justify-between">
                        <span className="text-neutral-dark">Entreprise:</span>
                        <span>{callData.contact.company}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-dark">Campagne:</span>
                      <span>{callData.campaign?.name || ""}</span>
                    </div>
                    <div className="pt-2">
                      <Badge variant="outline" className="mr-1">
                        {callData.contact?.tags?.[0] || "Nouveau contact"}
                      </Badge>
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
    <Card className="h-full">
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
