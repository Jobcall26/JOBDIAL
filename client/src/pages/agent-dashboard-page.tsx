import { useState, useEffect } from "react";
import AgentLayout from "@/components/layout/AgentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useSoftphone } from "@/hooks/use-softphone";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, Phone, Users, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentDashboardPage() {
  const { user } = useAuth();
  const { status: softphoneStatus, connect, isCallInProgress, currentCall } = useSoftphone();
  const [sessionTime, setSessionTime] = useState(0);
  const [callTime, setCallTime] = useState(0);
  
  // Fetch agent stats
  const { data: agentStats } = useQuery<{
    dailyCalls: number;
    totalCalls: number;
    avgCallDuration: string;
    conversionRate: string;
    callsRemaining: number;
    upcomingCallbacks: { contactName: string; time: string; phone: string }[];
    campaigns: { id: number; name: string; leads: number; progress: number }[];
  }>({
    queryKey: ["/api/agent/stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Timer for session time
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isCallInProgress) {
      timer = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
      setCallTime(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallInProgress]);
  
  // Format time (seconds) to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format time (seconds) to hh:mm:ss
  const formatLongTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <AgentLayout>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-blue-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Phone className="mr-2 h-4 w-4 text-blue-500" />
              <span>Status Softphone</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge
                    className={`${softphoneStatus === "ready" ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {softphoneStatus === "ready" ? "Connecté" : "Déconnecté"}
                  </Badge>
                  {softphoneStatus !== "ready" && (
                    <Button
                      onClick={connect}
                      size="sm"
                      className="mt-2"
                    >
                      Se connecter
                    </Button>
                  )}
                </div>
                {isCallInProgress && (
                  <div className="text-right">
                    <div className="text-xs text-neutral-dark">Appel en cours</div>
                    <div className="text-lg font-bold text-primary animate-pulse">
                      {formatTime(callTime)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Statut de l'agent comme dans ViciDial */}
              <div>
                <div className="text-xs font-medium mb-2">Statut agent</div>
                <select 
                  className="w-full p-2 text-sm rounded-md border border-neutral-200"
                  defaultValue="available"
                >
                  <option value="available">Disponible</option>
                  <option value="lunch">Pause déjeuner</option>
                  <option value="break">Pause café</option>
                  <option value="training">Formation</option>
                  <option value="meeting">Réunion</option>
                  <option value="admin">Tâches administratives</option>
                </select>
              </div>
              
              {/* Qualité de l'appel */}
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium">Qualité du signal</div>
                <div className="flex gap-1">
                  <div className="h-2 w-1 bg-green-500 rounded-sm"></div>
                  <div className="h-3 w-1 bg-green-500 rounded-sm"></div>
                  <div className="h-4 w-1 bg-green-500 rounded-sm"></div>
                  <div className="h-5 w-1 bg-green-500 rounded-sm"></div>
                  <div className="h-6 w-1 bg-green-400 rounded-sm"></div>
                </div>
              </div>
              
              {/* Latence */}
              <div className="flex justify-between text-xs">
                <span>Latence</span>
                <span className="font-medium">45ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-green-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-green-500" />
              <span>Objectifs Journaliers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Appels réalisés</span>
                <span className="font-bold">{agentStats?.dailyCalls || 0} / {agentStats?.callsRemaining ? agentStats.dailyCalls + agentStats.callsRemaining : 50}</span>
              </div>
              <Progress 
                value={agentStats?.dailyCalls ? (agentStats.dailyCalls / (agentStats.dailyCalls + (agentStats.callsRemaining || 0)) * 100) : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-amber-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Timer className="mr-2 h-4 w-4 text-amber-500" />
              <span>Temps de Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLongTime(sessionTime)}</div>
            <div className="text-xs text-neutral-dark">Depuis votre connexion</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-purple-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-purple-500" />
              <span>Taux de Conversion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats?.conversionRate || "0%"}</div>
            <div className="text-xs text-neutral-dark">Basé sur {agentStats?.totalCalls || 0} appels</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Campaigns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes Assignées</CardTitle>
            </CardHeader>
            <CardContent>
              {agentStats?.campaigns && agentStats.campaigns.length > 0 ? (
                <div className="space-y-4">
                  {agentStats.campaigns.map(campaign => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{campaign.name}</div>
                        <Badge variant="outline">{campaign.leads} contacts</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span>{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-dark">
                  Aucune campagne assignée pour le moment
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming Callbacks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5" />
                <span>Rappels Programmés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentStats?.upcomingCallbacks && agentStats.upcomingCallbacks.length > 0 ? (
                <div className="space-y-3">
                  {agentStats.upcomingCallbacks.map((callback, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{callback.contactName}</div>
                          <div className="text-sm text-neutral-dark">{callback.phone}</div>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {callback.time}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-dark">
                  Aucun rappel programmé
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AgentLayout>
  );
}
