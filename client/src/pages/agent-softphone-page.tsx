import { useState, useEffect } from "react";
import AgentLayout from "@/components/layout/AgentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useSoftphone } from "@/hooks/use-softphone";
import { useQuery } from "@tanstack/react-query";
import { PhoneCall, PhoneOff, User, Clock, Calendar, SkipForward, Save, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentSoftphonePage() {
  const { user } = useAuth();
  const { status, isCallInProgress, currentCall, connect, disconnect, makeCall, endCall } = useSoftphone();
  const [callDuration, setCallDuration] = useState(0);
  const [selectedTab, setSelectedTab] = useState("auto");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [manualNumber, setManualNumber] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [callNotes, setCallNotes] = useState("");
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [isScriptVisible, setIsScriptVisible] = useState(true);
  
  // Fetch all campaigns for manual and auto-dialing
  const { data: campaigns } = useQuery<{
    id: number;
    name: string;
  }[]>({
    queryKey: ["/api/campaigns/list"],
  });
  
  // Fetch assigned campaigns with next leads
  const { data: assignedCampaigns, isLoading: isLoadingCampaigns } = useQuery<{
    id: number;
    name: string;
    leadsRemaining: number;
    nextLead?: {
      id: number;
      name: string;
      phone: string;
      company: string;
      lastContact: string | null;
    };
  }[]>({
    queryKey: ["/api/agent/campaigns"],
    refetchInterval: 10000, // Refetch every 10 seconds to get latest lead
  });
  
  // Fetch script for the current campaign if in a call
  const { data: scriptData } = useQuery<{
    id: number;
    name: string;
    content: string;
    variables: {
      name: string;
      value: string;
    }[];
  }>({
    queryKey: ["/api/agent/scripts", { campaignId: currentCall?.campaignId }],
    enabled: !!currentCall?.campaignId,
  });
  
  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isCallInProgress) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
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
  
  const startAutoDial = async (campaignId: number) => {
    if (status !== "ready") {
      await connect();
    }
    await makeCall(campaignId);
  };
  
  const startManualCall = async () => {
    if (!manualNumber) return;
    if (status !== "ready") {
      await connect();
    }
    // In a real implementation, this would dial the manual number
    // For now, simulate with a campaign call
    await makeCall(parseInt(manualNumber));
  };
  
  const handleEndCall = async (callResult: string) => {
    setResult(callResult);
    // In a real implementation, this would end the call with the result
    await endCall(callResult);
    setCallNotes("");
    setResult(null);
  };
  
  const toggleMic = () => {
    setMicMuted(!micMuted);
    // In a real implementation, this would mute/unmute the microphone
  };
  
  const toggleSpeaker = () => {
    setSpeakerMuted(!speakerMuted);
    // In a real implementation, this would mute/unmute the speaker
  };
  
  // Processing script variables
  const processScript = (script: string, variables: { name: string; value: string }[]) => {
    if (!script) return "";
    
    let processedScript = script;
    variables.forEach(variable => {
      processedScript = processedScript.replace(
        new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'),
        `<span class="font-medium text-primary">${variable.value}</span>`
      );
    });
    
    return processedScript;
  };
  
  return (
    <AgentLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Dialer */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-2 ${status === "ready" ? "bg-green-500" : "bg-red-500"}`}
                />
                <span>Status: {status === "ready" ? "Connecté" : "Déconnecté"}</span>
              </CardTitle>
              <CardDescription>
                {status === "ready" ? "Prêt à passer des appels" : "Connecté-vous pour passer des appels"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status !== "ready" ? (
                <Button onClick={connect} className="w-full">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Se connecter
                </Button>
              ) : (
                <Button onClick={disconnect} variant="outline" className="w-full">
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Composeur</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="auto" className="flex-1">Auto</TabsTrigger>
                  <TabsTrigger value="manual" className="flex-1">Manuel</TabsTrigger>
                </TabsList>
                
                <TabsContent value="auto" className="space-y-4 mt-4">
                  {isLoadingCampaigns ? (
                    <div className="text-center py-6 text-neutral-dark">
                      Chargement des campagnes...
                    </div>
                  ) : assignedCampaigns && assignedCampaigns.length > 0 ? (
                    assignedCampaigns.map(campaign => (
                      <Card key={campaign.id} className="border-primary-light">
                        <CardContent className="p-4">
                          <div className="mb-2">
                            <div className="flex justify-between">
                              <div className="font-medium">{campaign.name}</div>
                              <Badge>{campaign.leadsRemaining} leads</Badge>
                            </div>
                          </div>
                          
                          {campaign.nextLead ? (
                            <div className="mb-4">
                              <div className="text-sm text-neutral-dark mb-1">Prochain contact à appeler:</div>
                              <div className="font-medium">{campaign.nextLead.name}</div>
                              <div className="text-sm">{campaign.nextLead.phone}</div>
                              {campaign.nextLead.company && (
                                <div className="text-xs text-neutral-dark">{campaign.nextLead.company}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-dark mb-4">
                              Aucun contact disponible pour cette campagne
                            </div>
                          )}
                          
                          <Button 
                            disabled={!campaign.nextLead || isCallInProgress || status !== "ready"} 
                            className="w-full"
                            onClick={() => startAutoDial(campaign.id)}
                          >
                            <PhoneCall className="mr-2 h-4 w-4" />
                            Appeler
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-6 text-neutral-dark">
                      Aucune campagne assignée
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Numéro à appeler</label>
                      <Input 
                        placeholder="Saisir un numéro de téléphone" 
                        value={manualNumber} 
                        onChange={e => setManualNumber(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Campagne (optionnel)</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="">Aucune campagne</option>
                        {campaigns?.map(campaign => (
                          <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <Button 
                      disabled={!manualNumber || isCallInProgress || status !== "ready"} 
                      className="w-full"
                      onClick={startManualCall}
                    >
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Appeler
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Middle Column - Current Call */}
        <div>
          <AnimatePresence mode="wait">
            {isCallInProgress ? (
              <motion.div
                key="call-in-progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 border-primary relative overflow-hidden h-[calc(100vh-150px)]">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className="bg-green-500 mb-2 animate-pulse">
                          Appel en cours
                        </Badge>
                        <CardTitle className="flex flex-col">
                          <span>{currentCall?.contactName || "Contact"}</span>
                          <span className="text-sm font-normal text-neutral-dark">
                            {currentCall?.contactPhone || "Numéro inconnu"}
                          </span>
                        </CardTitle>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatTime(callDuration)}
                        </div>
                        <div className="text-xs text-neutral-dark">
                          {currentCall?.campaignName || "Appel manuel"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 flex flex-col h-[calc(100%-200px)]">
                    {/* Contact Information */}
                    {currentCall?.contactId && (
                      <Card className="bg-neutral-lightest">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-neutral-light h-12 w-12 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-neutral-dark" />
                            </div>
                            <div>
                              <div className="font-medium">{currentCall.contactName}</div>
                              <div className="text-sm">{currentCall.contactPhone}</div>
                              {currentCall.contactCompany && (
                                <div className="text-sm text-neutral-dark">{currentCall.contactCompany}</div>
                              )}
                              <div className="flex gap-2 mt-1">
                                {currentCall.contactLastCallDate && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Dernier appel: {currentCall.contactLastCallDate}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Script Section */}
                    <div className="flex-1 overflow-y-auto relative">
                      <AnimatePresence>
                        {isScriptVisible && scriptData ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-4"
                          >
                            <Card>
                              <CardHeader className="py-2 px-4">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-sm">Script: {scriptData.name}</CardTitle>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setIsScriptVisible(false)}
                                  >
                                    <SkipForward className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div 
                                  className="text-sm space-y-2" 
                                  dangerouslySetInnerHTML={{ 
                                    __html: processScript(
                                      scriptData.content, 
                                      scriptData.variables || []
                                    ) 
                                  }} 
                                />
                              </CardContent>
                            </Card>
                          </motion.div>
                        ) : !isScriptVisible && scriptData ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mb-4"
                            onClick={() => setIsScriptVisible(true)}
                          >
                            Afficher le script
                          </Button>
                        ) : null}
                      </AnimatePresence>
                      
                      {/* Call Notes */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Notes d'appel</label>
                        <Textarea 
                          placeholder="Saisir vos notes d'appel ici..." 
                          value={callNotes} 
                          onChange={e => setCallNotes(e.target.value)}
                          className="h-24"
                        />
                      </div>
                    </div>
                    
                    {/* Call Controls */}
                    <div className="pt-4 border-t grid grid-cols-2 gap-4">
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          className={`w-12 h-12 rounded-full ${micMuted ? 'bg-neutral-light' : ''}`}
                          onClick={toggleMic}
                        >
                          {micMuted ? (
                            <MicOff className="h-5 w-5 text-neutral-dark" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          className={`w-12 h-12 rounded-full ${speakerMuted ? 'bg-neutral-light' : ''}`}
                          onClick={toggleSpeaker}
                        >
                          {speakerMuted ? (
                            <VolumeX className="h-5 w-5 text-neutral-dark" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Call Result Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => handleEndCall("interested")} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Intéressé
                      </Button>
                      <Button 
                        onClick={() => handleEndCall("callback")} 
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        Rappel
                      </Button>
                      <Button 
                        onClick={() => handleEndCall("refused")} 
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Refusé
                      </Button>
                      <Button 
                        onClick={() => handleEndCall("unreachable")} 
                        variant="outline"
                      >
                        Injoignable
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="no-call"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-[calc(100vh-150px)] flex flex-col justify-center items-center text-center p-6">
                  <div className="p-6 rounded-full bg-neutral-lightest mb-4">
                    <PhoneCall className="h-10 w-10 text-neutral-dark" />
                  </div>
                  <CardTitle className="mb-2">Aucun appel en cours</CardTitle>
                  <CardDescription className="max-w-xs mb-8">
                    Sélectionnez une campagne pour commencer à passer des appels ou utilisez le mode manuel
                  </CardDescription>
                  
                  {status !== "ready" && (
                    <Button onClick={connect}>
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Se connecter
                    </Button>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right Column - Calendar and Next Appointments */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Statistiques de la journée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-neutral-lightest rounded-lg">
                  <div className="text-xs text-neutral-dark mb-1">Appels</div>
                  <div className="text-2xl font-bold">24</div>
                </div>
                <div className="text-center p-4 bg-neutral-lightest rounded-lg">
                  <div className="text-xs text-neutral-dark mb-1">Durée moy.</div>
                  <div className="text-2xl font-bold">2:45</div>
                </div>
                <div className="text-center p-4 bg-neutral-lightest rounded-lg">
                  <div className="text-xs text-neutral-dark mb-1">Intéressés</div>
                  <div className="text-2xl font-bold text-green-600">7</div>
                </div>
                <div className="text-center p-4 bg-neutral-lightest rounded-lg">
                  <div className="text-xs text-neutral-dark mb-1">Rappels</div>
                  <div className="text-2xl font-bold text-amber-600">4</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                <span>Agenda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <div className="text-sm font-medium">Rappel programmé</div>
                  <div className="font-medium">Jean Dupont</div>
                  <div className="text-sm text-neutral-dark">Aujourd'hui - 14:30</div>
                  <div className="text-xs text-neutral-dark">Intéressé par Assurance Santé</div>
                </div>
                
                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <div className="text-sm font-medium">Rappel programmé</div>
                  <div className="font-medium">Marie Martin</div>
                  <div className="text-sm text-neutral-dark">Demain - 10:15</div>
                  <div className="text-xs text-neutral-dark">Souhaitait plus d'informations</div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Planifier un rappel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AgentLayout>
  );
}
