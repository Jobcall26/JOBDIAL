import { useState, useEffect } from "react";
import AgentLayout from "@/components/layout/AgentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useSoftphone } from "@/hooks/use-softphone";
import { useSounds } from "@/hooks/use-sounds";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Phone, PhoneCall, PhoneOff, PhoneForwarded, User, UserPlus, Clock, Calendar, 
  SkipForward, Save, Mic, MicOff, Volume2, VolumeX, Coffee, PlayCircle, Pause, 
  Settings, BookOpen, DoorOpen, LogOut, MessageSquare, MessageCircle, Headphones, 
  CheckCircle, XCircle, MoreHorizontal, ChevronDown, ChevronUp, RefreshCw, 
  BarChart, AlertCircle, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AgentSoftphonePage() {
  const { user } = useAuth();
  const { status, isCallInProgress, currentCall, connect, disconnect, makeCall, endCall } = useSoftphone();
  const { toast } = useToast();
  const [callDuration, setCallDuration] = useState(0);
  const [selectedTab, setSelectedTab] = useState("auto");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [manualNumber, setManualNumber] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [callNotes, setCallNotes] = useState("");
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [isScriptVisible, setIsScriptVisible] = useState(true);
  
  // États pour le mode prédictif
  const [predictiveActive, setPredictiveActive] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [aggressivenessLevel, setAggressivenessLevel] = useState<string>("1");
  const [predictiveStats, setPredictiveStats] = useState({
    callsPlaced: 0,
    callsAnswered: 0,
    contactRate: "0%",
    avgWaitTime: "0s"
  });
  
  // États pour les files d'attente
  const [queueActive, setQueueActive] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<string>("all");
  const [queueStatus, setQueueStatus] = useState<"available" | "paused" | "offline">("available");
  const [showQueueSettings, setShowQueueSettings] = useState(false);
  const [showMyQueues, setShowMyQueues] = useState(false);
  
  // États pour les fonctionnalités ViciDial
  const [pauseCode, setPauseCode] = useState<string>("BREAK");
  const [dispositionCode, setDispositionCode] = useState<string>("CALLBACK");
  const [showDialpad, setShowDialpad] = useState(false);
  const [showScriptTab, setShowScriptTab] = useState(true);
  const [showCustomerTab, setShowCustomerTab] = useState(false);
  const [showFormTab, setShowFormTab] = useState(false);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [showEmailTab, setShowEmailTab] = useState(false);
  const [showChatTab, setShowChatTab] = useState(false);
  const [manualDialSpeed, setManualDialSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [activeTab, setActiveTab] = useState<string>("script");
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(75);
  const [parkCall, setParkCall] = useState(false);
  const [callLog, setCallLog] = useState<string[]>([]);
  const [webFormUrl, setWebFormUrl] = useState<string>("");
  const [leadScore, setLeadScore] = useState<number | null>(null);
  const [callbackTime, setCallbackTime] = useState<string>("");
  const [callbackDate, setCallbackDate] = useState<string>("");
  const [hotkeysEnabled, setHotkeysEnabled] = useState<boolean>(true);
  const [autoDialNext, setAutoDialNext] = useState<boolean>(false);
  const [dialAttempts, setDialAttempts] = useState<number>(0);
  const [showCallComments, setShowCallComments] = useState<boolean>(false);
  const [callTags, setCallTags] = useState<string[]>([]);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [transferOptions, setTransferOptions] = useState<{id: number, name: string, type: string}[]>([
    {id: 1, name: "Service client", type: "interne"},
    {id: 2, name: "Support technique", type: "interne"},
    {id: 3, name: "Superviseur", type: "interne"}
  ]);
  const [alertType, setAlertType] = useState<"none" | "success" | "warning" | "error">("none");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [hangupReason, setHangupReason] = useState<string>("");
  const [agentScript, setAgentScript] = useState<{sections: {title: string, content: string}[]}>({
    sections: []
  });
  
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
  
  // Fonction pour activer/désactiver le mode prédictif
  const togglePredictiveMode = () => {
    if (predictiveActive) {
      setPredictiveActive(false);
      // Arrêter le composeur prédictif
      setPredictiveStats({
        callsPlaced: 0,
        callsAnswered: 0,
        contactRate: "0%",
        avgWaitTime: "0s"
      });
      
      // Afficher un toast de confirmation
      toast({
        title: "Mode prédictif désactivé",
        description: "Le composeur prédictif a été arrêté avec succès.",
      });
    } else {
      // Vérifier si une campagne est sélectionnée
      if (!selectedCampaign) {
        toast({
          title: "Sélection requise",
          description: "Veuillez sélectionner une campagne pour le mode prédictif.",
          variant: "destructive",
        });
        return;
      }
      
      setPredictiveActive(true);
      
      // Simuler des statistiques qui évoluent
      const simulateActivity = () => {
        const callsPlaced = Math.floor(Math.random() * 20) + 5;
        const callsAnswered = Math.floor(callsPlaced * (Math.random() * 0.4 + 0.3)); // 30-70% de réponse
        const contactRate = Math.round((callsAnswered / callsPlaced) * 100) + "%";
        const avgWaitTimeSeconds = Math.floor(Math.random() * 30) + 3;
        const avgWaitTime = `${avgWaitTimeSeconds}s`;
        
        setPredictiveStats({
          callsPlaced,
          callsAnswered,
          contactRate,
          avgWaitTime
        });
      };
      
      simulateActivity();
      
      // Afficher un toast de confirmation
      toast({
        title: "Mode prédictif activé",
        description: "Le composeur prédictif est maintenant actif pour la campagne sélectionnée.",
      });
    }
  };
  
  // Fonctions pour le mode file d'attente
  const joinQueue = () => {
    setQueueActive(true);
    setQueueStatus("available");
    
    toast({
      title: "File d'attente rejoint",
      description: `Vous avez rejoint la file d'attente ${selectedQueue === 'all' ? 'globale' : selectedQueue}`,
    });
  };
  
  const leaveQueue = () => {
    setQueueActive(false);
    
    toast({
      title: "File d'attente quittée",
      description: "Vous avez quitté la file d'attente avec succès.",
    });
  };
  
  const toggleQueueSettings = () => {
    setShowQueueSettings(!showQueueSettings);
    if (showMyQueues) setShowMyQueues(false);
  };
  
  const toggleMyQueues = () => {
    setShowMyQueues(!showMyQueues);
    if (showQueueSettings) setShowQueueSettings(false);
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
                  <TabsTrigger value="predictive" className="flex-1">Prédictif</TabsTrigger>
                  <TabsTrigger value="queue" className="flex-1">File</TabsTrigger>
                  <TabsTrigger value="vicidial" className="flex-1">ViciDial</TabsTrigger>
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
                
                <TabsContent value="predictive" className="space-y-4 mt-4">
                  <Card className={`border-2 ${predictiveActive ? 'border-green-500' : 'border-amber-500'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Mode Composeur Prédictif</span>
                        {predictiveActive && (
                          <Badge className="bg-green-500 animate-pulse">Actif</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Le composeur prédictif appelle automatiquement plusieurs contacts en même temps, optimisant le temps des agents.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Campagne</label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            disabled={predictiveActive}
                          >
                            <option value="">Sélectionnez une campagne</option>
                            {campaigns?.map(campaign => (
                              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Niveau d'agressivité</label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={aggressivenessLevel}
                            onChange={(e) => setAggressivenessLevel(e.target.value)}
                            disabled={predictiveActive}
                          >
                            <option value="1">Bas (1.0 - appels par agent)</option>
                            <option value="1.3">Moyen (1.3 - appels par agent)</option>
                            <option value="1.5">Elevé (1.5 - appels par agent)</option>
                            <option value="2">Maximum (2.0 - appels par agent)</option>
                          </select>
                        </div>
                        
                        {!predictiveActive && (
                          <div className="border rounded-md p-3 bg-yellow-50">
                            <div className="flex items-center text-sm text-amber-800 font-medium">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              Attention: Mode prédictif
                            </div>
                            <div className="text-xs text-amber-700 mt-1">
                              En mode prédictif, le système appellera automatiquement plusieurs contacts pour maximiser votre temps de conversation. Vous recevrez un appel dès qu'un contact répond.
                            </div>
                          </div>
                        )}
                        
                        {predictiveActive && (
                          <div className="border rounded-md p-3 bg-green-50">
                            <div className="flex items-center text-sm text-green-800 font-medium">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                              Mode prédictif actif
                            </div>
                            <div className="text-xs text-green-700 mt-1">
                              Le composeur prédictif est en cours d'exécution pour la campagne sélectionnée. Vous recevrez automatiquement des appels lorsque des contacts répondront.
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Button 
                            className={`w-full ${predictiveActive 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-amber-600 hover:bg-amber-700'}`}
                            onClick={togglePredictiveMode}
                            disabled={!status || status !== "ready" || (!selectedCampaign && !predictiveActive)}
                          >
                            {predictiveActive ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                                  <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
                                </svg>
                                Désactiver le mode prédictif
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                                  <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
                                </svg>
                                Activer le mode prédictif
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="p-4 bg-neutral-lightest rounded-lg">
                    <div className="font-medium mb-2">Statistiques du composeur</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-neutral-dark">Appels lancés</div>
                        <div className="font-bold">{predictiveStats.callsPlaced}</div>
                      </div>
                      <div>
                        <div className="text-neutral-dark">Appels répondus</div>
                        <div className="font-bold">{predictiveStats.callsAnswered}</div>
                      </div>
                      <div>
                        <div className="text-neutral-dark">Taux de contact</div>
                        <div className="font-bold">{predictiveStats.contactRate}</div>
                      </div>
                      <div>
                        <div className="text-neutral-dark">Attente moyenne</div>
                        <div className="font-bold">{predictiveStats.avgWaitTime}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="queue" className="space-y-4 mt-4">
                  <Card className={`border-2 ${queueActive ? 'border-green-500' : 'border-purple-500'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>File d'Attente Intelligente</span>
                        {queueActive && (
                          <Badge className="bg-green-500 animate-pulse">Actif</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Reçoit et traite les appels entrants et les transferts selon des règles de routage intelligentes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-3 bg-purple-50">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-sm font-medium text-purple-800">Mon statut dans la file</div>
                            <Badge variant="outline" className={`
                              ${queueActive 
                                ? queueStatus === "available" 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : queueStatus === "paused" 
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            `}>
                              {queueActive 
                                ? queueStatus === "available" 
                                  ? "Disponible" 
                                  : queueStatus === "paused" 
                                    ? "En pause"
                                    : "Hors ligne"
                                : "Inactif"
                              }
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="text-xs font-medium text-purple-800 mb-1 block">File d'attente</label>
                              <select 
                                className="w-full p-2 border border-purple-200 rounded-md text-sm"
                                value={selectedQueue}
                                onChange={(e) => setSelectedQueue(e.target.value)}
                                disabled={queueActive}
                              >
                                <option value="all">Toutes les files</option>
                                <option value="1">Service client</option>
                                <option value="2">Support technique</option>
                                <option value="3">Commercial</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-purple-800 mb-1 block">Compétences</label>
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Français</Badge>
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Santé</Badge>
                              </div>
                            </div>
                          </div>
                          
                          {!showQueueSettings && !showMyQueues && (
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-purple-800 mb-1 block">Position dans les files</label>
                              <div className="border rounded-md bg-white p-2">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <div className="font-medium">Service client</div>
                                    <div>Position: {queueActive ? 3 : "-"}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Support technique</div>
                                    <div>Position: {queueActive ? 2 : "-"}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Commercial</div>
                                    <div>Position: {queueActive ? 1 : "-"}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {showQueueSettings && (
                            <div className="space-y-3 border rounded-md bg-white p-3">
                              <h4 className="font-medium text-sm">Paramètres de file d'attente</h4>
                              
                              <div>
                                <label className="text-xs font-medium mb-1 block">Temps maximal entre appels</label>
                                <select className="w-full p-2 border rounded-md text-xs">
                                  <option value="0">Aucun temps d'attente</option>
                                  <option value="10">10 secondes</option>
                                  <option value="30">30 secondes</option>
                                  <option value="60">1 minute</option>
                                  <option value="120">2 minutes</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium mb-1 block">Mode de distribution</label>
                                <select className="w-full p-2 border rounded-md text-xs">
                                  <option value="roundrobin">Répartition équitable</option>
                                  <option value="leastrecent">Attente la plus longue</option>
                                  <option value="fewestcalls">Moins d'appels reçus</option>
                                  <option value="random">Aléatoire</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium mb-1 block">Priorité de l'agent</label>
                                <select className="w-full p-2 border rounded-md text-xs">
                                  <option value="1">Basse (1)</option>
                                  <option value="2">Normale (2)</option>
                                  <option value="3">Haute (3)</option>
                                  <option value="4">Urgente (4)</option>
                                </select>
                              </div>
                              
                              <div className="pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-xs"
                                  onClick={toggleQueueSettings}
                                >
                                  Fermer les paramètres
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {showMyQueues && (
                            <div className="space-y-3 border rounded-md bg-white p-3">
                              <h4 className="font-medium text-sm">Mes files d'attente</h4>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs p-2 border rounded-md">
                                  <span className="font-medium">Service client</span>
                                  <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">Actif</Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs p-2 border rounded-md">
                                  <span className="font-medium">Support technique</span>
                                  <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">Actif</Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs p-2 border rounded-md">
                                  <span className="font-medium">Commercial</span>
                                  <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Inactif</Badge>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-xs"
                                  onClick={toggleMyQueues}
                                >
                                  Fermer
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {!showQueueSettings && !showMyQueues && (
                            <div className="pt-3 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-8 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
                                onClick={toggleMyQueues}
                              >
                                <BookOpen className="w-4 h-4 mr-1" />
                                Mes files
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-8 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
                                onClick={toggleQueueSettings}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Paramètres
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium mb-2">Statistiques de file d'attente</div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-neutral-dark">Temps moyen d'attente</div>
                              <div className="font-bold">{queueActive ? "1m 45s" : "-"}</div>
                            </div>
                            <div>
                              <div className="text-neutral-dark">Appels en attente</div>
                              <div className="font-bold">{queueActive ? "4" : "-"}</div>
                            </div>
                            <div>
                              <div className="text-neutral-dark">Agents disponibles</div>
                              <div className="font-bold">{queueActive ? "3" : "-"}</div>
                            </div>
                            <div>
                              <div className="text-neutral-dark">Ma durée moyenne</div>
                              <div className="font-bold">{queueActive ? "3m 12s" : "-"}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 grid grid-cols-2 gap-2">
                          {!queueActive ? (
                            <Button 
                              className="w-full bg-purple-600 hover:bg-purple-700"
                              onClick={joinQueue}
                              disabled={!status || status !== "ready"}
                            >
                              <DoorOpen className="h-4 w-4 mr-2" />
                              Rejoindre la file
                            </Button>
                          ) : (
                            <Button 
                              className="w-full bg-red-600 hover:bg-red-700"
                              onClick={leaveQueue}
                              disabled={isCallInProgress}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Quitter la file
                            </Button>
                          )}
                          
                          {queueActive && (
                            <Button 
                              variant="outline"
                              className={queueStatus === "paused" 
                                ? "border-green-300 text-green-700" 
                                : "border-yellow-300 text-yellow-700"}
                              onClick={() => setQueueStatus(queueStatus === "paused" ? "available" : "paused")}
                              disabled={isCallInProgress}
                            >
                              {queueStatus === "paused" ? (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Reprendre
                                </>
                              ) : (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Mettre en pause
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="vicidial" className="space-y-4 mt-4">
                  <Card className="border-2 border-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Interface ViciDial</span>
                        <Badge className="bg-blue-500">Pro</Badge>
                      </CardTitle>
                      <CardDescription>
                        Interface complète avec toutes les fonctionnalités ViciDial pour les opérateurs de centre d'appels.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {/* Barre d'état ViciDial */}
                      <div className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${status === "ready" ? "bg-green-500" : "bg-red-500"}`}></div>
                          <span className="text-sm font-medium">{status === "ready" ? "En ligne" : "Hors ligne"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">Agent ID: {user?.id}</span>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {isCallInProgress ? "En appel" : "Disponible"}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Options de pause avec codes */}
                      <div className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Statut de pause</h4>
                          <Badge variant={pauseCode ? "destructive" : "outline"} className="text-xs">
                            {pauseCode ? "En pause" : "Actif"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <select 
                              className="w-2/3 p-2 text-xs border rounded-md" 
                              value={pauseCode}
                              onChange={(e) => setPauseCode(e.target.value)}
                              disabled={isCallInProgress}
                            >
                              <option value="">Pas en pause</option>
                              <option value="BREAK">Pause café</option>
                              <option value="LUNCH">Déjeuner</option>
                              <option value="MEETING">Réunion</option>
                              <option value="TRAINING">Formation</option>
                              <option value="PERSONAL">Personnel</option>
                            </select>
                            <Button 
                              size="sm"
                              variant={pauseCode ? "default" : "destructive"}
                              className="text-xs"
                              onClick={() => setPauseCode(pauseCode ? "" : "BREAK")}
                              disabled={isCallInProgress}
                            >
                              {pauseCode ? "Reprendre" : "Pause"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pavé numérique */}
                      <div className={`border rounded-md p-3 ${showDialpad ? "block" : "hidden"}`}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Pavé numérique</h4>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={() => setShowDialpad(false)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </Button>
                        </div>
                        
                        <Input
                          type="text"
                          value={manualNumber}
                          onChange={(e) => setManualNumber(e.target.value)}
                          className="mb-2 text-center"
                          placeholder="Entrez un numéro"
                        />
                        
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                            <Button
                              key={digit}
                              variant="outline"
                              size="sm"
                              className="h-10 text-lg"
                              onClick={() => setManualNumber(prev => prev + digit)}
                            >
                              {digit}
                            </Button>
                          ))}
                        </div>
                        
                        <div className="flex justify-between mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setManualNumber('')}
                          >
                            Effacer
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={startManualCall}
                            disabled={!manualNumber || !status || status !== "ready"}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Appeler
                          </Button>
                        </div>
                      </div>
                      
                      {/* Menu des boutons de contrôle rapide */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="flex items-center justify-start text-xs h-9 bg-blue-50 hover:bg-blue-100 border-blue-200"
                          onClick={() => setShowDialpad(!showDialpad)}
                        >
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          <span>{showDialpad ? "Cacher pavé" : "Pavé num."}</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className={`flex items-center justify-start text-xs h-9 ${recordingEnabled ? 'bg-green-50 hover:bg-green-100 border-green-200' : 'bg-red-50 hover:bg-red-100 border-red-200'}`}
                          onClick={() => setRecordingEnabled(!recordingEnabled)}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          <span>{recordingEnabled ? "Enreg. On" : "Enreg. Off"}</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex items-center justify-start text-xs h-9 bg-purple-50 hover:bg-purple-100 border-purple-200"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          <span>Scripts</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex items-center justify-start text-xs h-9 bg-orange-50 hover:bg-orange-100 border-orange-200"
                        >
                          <Headphones className="h-3.5 w-3.5 mr-1" />
                          <span>Aide Supervisor</span>
                        </Button>
                      </div>
                      
                      {/* Panneau des dispositions */}
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm font-medium mb-2">Disposition de l'appel</h4>
                        <select 
                          className="w-full p-2 text-xs border rounded-md mb-2" 
                          value={dispositionCode}
                          onChange={(e) => setDispositionCode(e.target.value)}
                        >
                          <option value="SALE">Vente</option>
                          <option value="CALLBACK">Rappel demandé</option>
                          <option value="NOANSWER">Pas de réponse</option>
                          <option value="BUSY">Occupé</option>
                          <option value="DISCONNECT">Raccrochement</option>
                          <option value="REJECTION">Refus</option>
                          <option value="DONOTCALL">Ne pas rappeler</option>
                          <option value="QUALIFIED">Qualifié</option>
                          <option value="UNQUALIFIED">Non qualifié</option>
                        </select>
                        
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="text-xs"
                            disabled={!isCallInProgress}
                            onClick={() => handleEndCall(dispositionCode)}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Soumettre
                          </Button>
                        </div>
                      </div>
                      
                      {/* Contrôles du volume */}
                      <div className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Volume</h4>
                          <span className="text-xs font-medium">{volumeLevel}%</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <VolumeX className="h-4 w-4 text-neutral-dark" />
                          <Slider
                            value={[volumeLevel]}
                            min={0}
                            max={100}
                            step={1}
                            className="flex-1"
                            onValueChange={(values) => setVolumeLevel(values[0])}
                          />
                          <Volume2 className="h-4 w-4 text-neutral-dark" />
                        </div>
                      </div>
                      
                      {/* Panneau de commandes avancées */}
                      <div className="space-y-2">
                        <div className="flex justify-between space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 text-xs h-9"
                            onClick={() => setParkCall(!parkCall)}
                            disabled={!isCallInProgress}
                          >
                            {parkCall ? "Déparker" : "Parker l'appel"}
                          </Button>
                          
                          <Button
                            variant="outline" 
                            size="sm"
                            className="flex-1 text-xs h-9"
                          >
                            Conférence
                          </Button>
                        </div>
                        
                        <div className="flex justify-between space-x-2">
                          <Button
                            variant="outline" 
                            size="sm"
                            className="flex-1 text-xs h-9"
                          >
                            Transférer
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 text-xs h-9"
                            onClick={() => handleEndCall("HANGUP")}
                            disabled={!isCallInProgress}
                          >
                            <PhoneOff className="h-3.5 w-3.5 mr-1" />
                            Raccrocher
                          </Button>
                        </div>
                      </div>
                      
                      {/* Panneau d'informations sur l'état du système */}
                      <div className="border-t pt-3 mt-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center text-neutral-dark">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Temps d'appel: {formatTime(callDuration)}</span>
                          </div>
                          <div className="flex items-center justify-end text-neutral-dark">
                            <span>Campagne: {currentCall?.campaignName || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                    {/* Contact Information - Style ViciDial complet */}
                    {currentCall?.contactId && (
                      <Card className="bg-neutral-lightest border-blue-200">
                        <CardHeader className="pb-2 border-b bg-blue-50 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-700" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{currentCall.contactName}</CardTitle>
                              <div className="text-sm text-blue-700">
                                {currentCall.contactPhone} - {currentCall.campaignName || "Campagne inconnue"}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-blue-200 bg-white">
                            ID: {currentCall.contactId}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            {/* Informations personnelles */}
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Nom complet</div>
                              <div className="font-medium">{currentCall.contactName}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Téléphone</div>
                              <div className="font-medium">{currentCall.contactPhone}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Email</div>
                              <div className="font-medium">{currentCall.contactEmail || "Non renseigné"}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Entreprise</div>
                              <div className="font-medium">{currentCall.contactCompany || "Non renseigné"}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Fonction</div>
                              <div className="font-medium">{currentCall.contactJobTitle || "Non renseigné"}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Date de naissance</div>
                              <div className="font-medium">{currentCall.contactBirthdate || "Non renseigné"}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Adresse</div>
                              <div className="font-medium">{currentCall.contactAddress || "Non renseigné"}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Ville</div>
                              <div className="font-medium">{currentCall.contactCity || "Non renseigné"}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-dark mb-1">Code postal</div>
                              <div className="font-medium">{currentCall.contactZipCode || "Non renseigné"}</div>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-2">
                            <div className="text-xs font-medium text-neutral-dark mb-1">Historique de contact</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="border rounded-md p-2 bg-gray-50">
                                <div className="text-xs font-medium">Dernier contact</div>
                                <div className="text-sm">{currentCall.contactLastCallDate || "Aucun"}</div>
                              </div>
                              <div className="border rounded-md p-2 bg-gray-50">
                                <div className="text-xs font-medium">Résultat précédent</div>
                                <div className="text-sm">{currentCall.contactLastCallResult || "Aucun"}</div>
                              </div>
                              <div className="border rounded-md p-2 bg-gray-50">
                                <div className="text-xs font-medium">Nombre d'appels</div>
                                <div className="text-sm">{currentCall.contactCallCount || "0"}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-2">
                            <div className="text-xs font-medium text-neutral-dark mb-1">Informations supplémentaires</div>
                            <div className="border rounded-md p-2 bg-white text-sm">
                              {currentCall.contactNotes || "Aucune note supplémentaire"}
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                              </svg>
                              Modifier
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                              </svg>
                              Plus d'infos
                            </Button>
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
                      
                      {/* Formulaires personnalisés par campagne - style ViciDial */}
                      <div className="space-y-4">
                        <div className="border rounded-lg p-3 bg-green-50">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-sm font-medium text-green-800">Formulaire de campagne</div>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Assurance Santé</Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium mb-1 block">Situation actuelle</label>
                                <select className="w-full p-2 border rounded-md text-sm">
                                  <option value="">Sélectionner...</option>
                                  <option value="has_insurance">Déjà assuré</option>
                                  <option value="no_insurance">Non assuré</option>
                                  <option value="looking">En recherche</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block">Intérêt produit</label>
                                <select className="w-full p-2 border rounded-md text-sm">
                                  <option value="">Sélectionner...</option>
                                  <option value="basic">Formule Basic</option>
                                  <option value="comfort">Formule Confort</option>
                                  <option value="premium">Formule Premium</option>
                                  <option value="no_interest">Pas intéressé</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium mb-1 block">Budget mensuel</label>
                                <input type="number" className="w-full p-2 border rounded-md text-sm" placeholder="Ex: 50" />
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block">Nombre de personnes</label>
                                <input type="number" className="w-full p-2 border rounded-md text-sm" placeholder="Ex: 2" />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium mb-1 block">Pathologies déclarées</label>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-white border cursor-pointer hover:bg-gray-50">Aucune</Badge>
                                <Badge className="bg-white border cursor-pointer hover:bg-gray-50">Diabète</Badge>
                                <Badge className="bg-white border cursor-pointer hover:bg-gray-50">Hypertension</Badge>
                                <Badge className="bg-white border cursor-pointer hover:bg-gray-50">Asthme</Badge>
                                <Badge className="bg-white border cursor-pointer hover:bg-gray-50">Autre</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      
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
                    </div>
                    
                    {/* Call Controls - style ViciDial */}
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <Button 
                          variant="outline" 
                          className={`h-12 ${micMuted ? 'bg-neutral-light' : ''}`}
                          onClick={toggleMic}
                        >
                          {micMuted ? (
                            <MicOff className="h-5 w-5 mr-1 text-neutral-dark" />
                          ) : (
                            <Mic className="h-5 w-5 mr-1" />
                          )}
                          Micro
                        </Button>
                        <Button 
                          variant="outline" 
                          className={`h-12 ${speakerMuted ? 'bg-neutral-light' : ''}`}
                          onClick={toggleSpeaker}
                        >
                          {speakerMuted ? (
                            <VolumeX className="h-5 w-5 mr-1 text-neutral-dark" />
                          ) : (
                            <Volume2 className="h-5 w-5 mr-1" />
                          )}
                          Audio
                        </Button>
                        <Button variant="outline" className="h-12">
                          <Clock className="h-5 w-5 mr-1" />
                          Pause
                        </Button>
                        <Button variant="outline" className="h-12">
                          <Mic className="h-5 w-5 mr-1" />
                          Enreg.
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mb-3">
                        <div className="border rounded-lg p-3 bg-blue-50">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-blue-800">Transfert & Conférence</div>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">ViciDial</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <label className="text-xs font-medium text-blue-800 mb-1 block">Type</label>
                              <select className="w-full p-2 border border-blue-200 rounded-md text-sm">
                                <option value="warm">Transfert chaud</option>
                                <option value="cold">Transfert froid</option>
                                <option value="conference">Conférence à 3</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-blue-800 mb-1 block">Destination</label>
                              <select className="w-full p-2 border border-blue-200 rounded-md text-sm">
                                <option value="internal">Agent interne</option>
                                <option value="external">Numéro externe</option>
                                <option value="ivr">IVR / File d'attente</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="text-xs h-8 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100">
                              Transférer
                            </Button>
                            <Button variant="outline" className="text-xs h-8 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100">
                              Conférence
                            </Button>
                            <Button variant="outline" className="text-xs h-8 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100">
                              Attente
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded-md mb-3">
                        <div className="text-xs font-medium mb-1">Raccourcis clavier</div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div><span className="font-bold">F1</span>: Aide</div>
                          <div><span className="font-bold">F2</span>: Réponse rapide</div>
                          <div><span className="font-bold">F3</span>: Script</div>
                          <div><span className="font-bold">F4</span>: Pause</div>
                          <div><span className="font-bold">F5</span>: Transfert</div>
                          <div><span className="font-bold">F6</span>: Raccrocher</div>
                        </div>
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

      {/* Conseils d'utilisation */}
      <div className="mt-6 bg-white rounded-lg p-4 border border-neutral-light">
        <h3 className="text-lg font-medium mb-3">Conseils d&apos;utilisation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-neutral-light rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <Phone className="h-5 w-5 mr-2" />
              <span className="font-medium">Avant l&apos;appel</span>
            </div>
            <p className="text-sm text-neutral-dark">
              Vérifiez votre connexion internet et le volume de votre micro. Connectez-vous au softphone et sélectionnez une campagne avant de commencer.
            </p>
          </div>
          
          <div className="p-3 border border-neutral-light rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-medium">Pendant l&apos;appel</span>
            </div>
            <p className="text-sm text-neutral-dark">
              Restez professionnel et suivez le script. Écoutez attentivement le client et prenez des notes si nécessaire. Utilisez les raccourcis clavier pour plus d&apos;efficacité.
            </p>
          </div>

          <div className="p-3 border border-neutral-light rounded-lg">
            <div className="flex items-center text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="font-medium">Après l&apos;appel</span>
            </div>
            <p className="text-sm text-neutral-dark">
              Complétez vos notes et qualifiez l&apos;appel correctement. Prenez une courte pause si nécessaire avant le prochain appel. Vérifiez vos rappels programmés.
            </p>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
