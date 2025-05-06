import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, User, Clock, AlertCircle, Headphones, HeadphoneOff, Volume2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type AgentStatus = {
  id: number;
  username: string;
  status: "available" | "on_call" | "paused" | "offline";
  statusDuration: string;
  currentCall?: {
    id: string;
    contactName: string;
    duration: string;
    campaignName: string;
  };
};

type QueueStatus = {
  name: string;
  waitingCalls: number;
  avgWaitTime: string;
  serviceLevelPercent: number;
};

type CampaignStatus = {
  id: number;
  name: string;
  progress: number;
  leadsTotal: number;
  leadsContacted: number;
  leadsPending: number;
  activeAgents: number;
};

type Alert = {
  id: number;
  type: "info" | "warning" | "error";
  message: string;
  timestamp: string;
};

export default function SupervisionPage() {
  const { isConnected, lastMessage } = useWebSocket();
  const [activeTab, setActiveTab] = useState<string>("agents");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeSpyCallId, setActiveSpyCallId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Mutation pour démarrer l'écoute d'un appel
  const startSpyMutation = useMutation({
    mutationFn: async (callId: string) => {
      const res = await apiRequest("POST", `/api/calls/${callId}/spy`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Écoute en cours",
        description: "Vous êtes maintenant en écoute sur cet appel",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer l'écoute de l'appel",
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour arrêter l'écoute d'un appel
  const stopSpyMutation = useMutation({
    mutationFn: async (callId: string) => {
      const res = await apiRequest("POST", `/api/calls/${callId}/spy/stop`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Écoute terminée",
        description: "Vous avez arrêté l'écoute de l'appel",
      });
      setActiveSpyCallId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'arrêter l'écoute de l'appel",
        variant: "destructive",
      });
    },
  });
  
  // Fonction pour démarrer l'écoute
  const startSpying = (callId: string) => {
    if (activeSpyCallId) {
      toast({
        title: "Écoute déjà en cours",
        description: "Veuillez d'abord arrêter l'écoute en cours",
        variant: "destructive",
      });
      return;
    }
    
    startSpyMutation.mutate(callId);
    setActiveSpyCallId(callId);
  };
  
  // Fonction pour arrêter l'écoute
  const stopSpying = () => {
    if (!activeSpyCallId) return;
    stopSpyMutation.mutate(activeSpyCallId);
  };

  // Fetch initial supervision data
  const { data: supervisionData, refetch } = useQuery<{
    agents: AgentStatus[];
    queues: QueueStatus[];
    campaigns: CampaignStatus[];
    alerts: Alert[];
  }>({
    queryKey: ["/api/supervision"],
  });

  // Update alerts when receiving new websocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === "supervision_alert") {
      setAlerts((prevAlerts) => [lastMessage.data.alert, ...prevAlerts.slice(0, 9)]);
    }

    // Auto-refresh data every 15 seconds
    const intervalId = setInterval(() => {
      refetch();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [lastMessage, refetch]);

  const agents = supervisionData?.agents || [];
  const queues = supervisionData?.queues || [];
  const campaigns = supervisionData?.campaigns || [];
  const initialAlerts = supervisionData?.alerts || [];

  // Combine initial alerts with new ones from WebSocket
  useEffect(() => {
    if (initialAlerts.length > 0 && alerts.length === 0) {
      setAlerts(initialAlerts);
    }
  }, [initialAlerts, alerts.length]);

  // Stats calculations
  const availableAgents = agents.filter((a) => a.status === "available").length;
  const onCallAgents = agents.filter((a) => a.status === "on_call").length;
  const totalAgents = agents.length;
  const activeAgentsPercent = Math.round(
    ((availableAgents + onCallAgents) / (totalAgents || 1)) * 100
  );

  return (
    <Layout>
      <PageHeader
        title="Supervision en temps réel"
        description="Suivez l'activité de vos agents en temps réel"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="text-sm text-neutral-dark mb-1">Agents connectés</div>
              <div className="flex items-end">
                <div className="text-2xl font-bold">
                  {availableAgents + onCallAgents}/{totalAgents}
                </div>
              </div>
              <Progress value={activeAgentsPercent} className="h-1 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="text-sm text-neutral-dark mb-1">Agents disponibles</div>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{availableAgents}</div>
                <StatusBadge status="available" className="ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="text-sm text-neutral-dark mb-1">Appels en cours</div>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{onCallAgents}</div>
                <StatusBadge status="on_call" className="ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm flex flex-col">
                Statut supervision :{" "}
                <span className={isConnected ? "text-[#10B981]" : "text-[#EF4444]"}>
                  {isConnected ? "Connecté" : "Déconnecté"}
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => refetch()}
                className="text-xs"
              >
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Supervision</CardTitle>
                  <TabsList>
                    <TabsTrigger value="agents" className="text-sm">
                      <User className="h-4 w-4 mr-1" />
                      Agents
                    </TabsTrigger>
                    <TabsTrigger value="queues" className="text-sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Files d&apos;attente
                    </TabsTrigger>
                    <TabsTrigger value="campaigns" className="text-sm">
                      <i className="ri-megaphone-line mr-1 text-base"></i>
                      Campagnes
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="agents" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-neutral-light">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Agent
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Durée
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Appel en cours
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        {agents.length > 0 ? (
                          agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-neutral-lightest">
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <UserAvatar
                                    user={{ username: agent.username }}
                                    className="w-8 h-8 mr-2"
                                  />
                                  <div className="font-medium">{agent.username}</div>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <StatusBadge status={agent.status} />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {agent.statusDuration}
                              </td>
                              <td className="px-3 py-2">
                                {agent.status === "on_call" && agent.currentCall ? (
                                  <div>
                                    <div className="font-medium">{agent.currentCall.contactName}</div>
                                    <div className="text-xs text-neutral-dark flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{agent.currentCall.duration}</span>
                                      <Badge
                                        variant="outline"
                                        className="ml-2 text-[10px] h-4"
                                      >
                                        {agent.currentCall.campaignName}
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-neutral-dark text-sm">-</span>
                                )}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right">
                                {agent.status === "on_call" && agent.currentCall ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        {activeSpyCallId === agent.currentCall.id ? (
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => stopSpying()}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-100"
                                          >
                                            <HeadphoneOff className="h-4 w-4" />
                                          </Button>
                                        ) : (
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => startSpying(agent.currentCall.id)}
                                            className="text-primary hover:text-primary-dark hover:bg-primary-lightest"
                                            disabled={!!activeSpyCallId}
                                          >
                                            <Headphones className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {activeSpyCallId === agent.currentCall.id 
                                          ? "Arrêter l'écoute" 
                                          : "Écouter l'appel"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-neutral-dark text-sm">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-neutral-dark">
                              Aucun agent connecté
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="queues" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-neutral-light">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            File d&apos;attente
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Appels en attente
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Temps moyen
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Niveau de service
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        {queues.length > 0 ? (
                          queues.map((queue, index) => (
                            <tr key={index} className="hover:bg-neutral-lightest">
                              <td className="px-3 py-2 whitespace-nowrap font-medium">
                                {queue.name}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs inline-flex items-center font-medium ${
                                    queue.waitingCalls > 5
                                      ? "bg-[#EF4444]/10 text-[#EF4444]"
                                      : queue.waitingCalls > 0
                                      ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                      : "bg-[#10B981]/10 text-[#10B981]"
                                  }`}
                                >
                                  {queue.waitingCalls}
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {queue.avgWaitTime}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-neutral-light rounded-full mr-2">
                                    <div
                                      className={`h-full rounded-full ${
                                        queue.serviceLevelPercent >= 90
                                          ? "bg-[#10B981]"
                                          : queue.serviceLevelPercent >= 70
                                          ? "bg-[#F59E0B]"
                                          : "bg-[#EF4444]"
                                      }`}
                                      style={{ width: `${queue.serviceLevelPercent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">{queue.serviceLevelPercent}%</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-neutral-dark">
                              Aucune file d&apos;attente active
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="campaigns" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-neutral-light">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Campagne
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Progression
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Agents actifs
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                            Contacts restants
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-light">
                        {campaigns.length > 0 ? (
                          campaigns.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-neutral-lightest">
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="font-medium">{campaign.name}</div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-neutral-light rounded-full mr-2">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${campaign.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">
                                    {campaign.progress}% ({campaign.leadsContacted}/
                                    {campaign.leadsTotal})
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-neutral-dark mr-2" />
                                  <span>{campaign.activeAgents}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-neutral-dark mr-2" />
                                  <span>{campaign.leadsPending}</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-neutral-dark">
                              Aucune campagne active
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Alertes & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3 overflow-y-auto max-h-96">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.type === "error"
                          ? "border-[#EF4444]/30 bg-[#EF4444]/5"
                          : alert.type === "warning"
                          ? "border-[#F59E0B]/30 bg-[#F59E0B]/5"
                          : "border-[#5170FF]/30 bg-[#5170FF]/5"
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`p-1 rounded-full mr-3 ${
                            alert.type === "error"
                              ? "text-[#EF4444]"
                              : alert.type === "warning"
                              ? "text-[#F59E0B]"
                              : "text-[#5170FF]"
                          }`}
                        >
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm ${
                              alert.type === "error"
                                ? "text-[#EF4444]"
                                : alert.type === "warning"
                                ? "text-[#F59E0B]"
                                : "text-[#5170FF]"
                            }`}
                          >
                            {alert.message}
                          </div>
                          <div className="text-xs text-neutral-dark mt-1">{alert.timestamp}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-dark">
                    Aucune alerte pour le moment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
