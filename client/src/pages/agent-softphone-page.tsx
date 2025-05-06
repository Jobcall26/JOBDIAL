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
import { useQuery, useMutation } from "@tanstack/react-query";
import { Phone, PhoneCall, PhoneOff, User, Clock, Calendar, SkipForward, Save, Mic, MicOff, Volume2, VolumeX, Coffee, PlayCircle, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
                  <TabsTrigger value="predictive" className="flex-1">Prédictif</TabsTrigger>
                  <TabsTrigger value="queue" className="flex-1">File d'attente</TabsTrigger>
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
                  <Card className="border-2 border-amber-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Mode Composeur Prédictif</CardTitle>
                      <CardDescription>
                        Le composeur prédictif appelle automatiquement plusieurs contacts en même temps, optimisant le temps des agents.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Campagne</label>
                          <select className="w-full p-2 border rounded-md">
                            {campaigns?.map(campaign => (
                              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Niveau d'agressivité</label>
                          <select className="w-full p-2 border rounded-md">
                            <option value="1">Bas (1.0 - appels par agent)</option>
                            <option value="1.3">Moyen (1.3 - appels par agent)</option>
                            <option value="1.5">Elevé (1.5 - appels par agent)</option>
                            <option value="2">Maximum (2.0 - appels par agent)</option>
                          </select>
                        </div>
                        
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
                        
                        <div className="pt-2">
                          <Button 
                            className="w-full bg-amber-600 hover:bg-amber-700"
                            onClick={() => alert('Mode prédictif activé ! Cette fonctionnalité n\'est pas encore complètement implémentée.')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                              <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
                            </svg>
                            Activer le mode prédictif
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
                        <div className="font-bold">0</div>
                      </div>
                      <div>
                        <div className="text-neutral-dark">Appels répondus</div>
                        <div className="font-bold">0</div>
                      </div>
                      <div>
                        <div className="text-neutral-dark">Taux de contact</div>
                        <div className="font-bold">0%</div>
                      </div>
                      <div>
                        <div className="text-neutral-dark">Attente moyenne</div>
                        <div className="font-bold">0s</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="queue" className="space-y-4 mt-4">
                  <Card className="border-2 border-purple-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">File d'Attente Intelligente</CardTitle>
                      <CardDescription>
                        Reçoit et traite les appels entrants et les transferts selon des règles de routage intelligentes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-3 bg-purple-50">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-sm font-medium text-purple-800">Mon statut dans la file</div>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Disponible
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="text-xs font-medium text-purple-800 mb-1 block">File d'attente</label>
                              <select className="w-full p-2 border border-purple-200 rounded-md text-sm">
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
                          
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-purple-800 mb-1 block">Position dans les files</label>
                            <div className="border rounded-md bg-white p-2">
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <div className="font-medium">Service client</div>
                                  <div>Position: 3</div>
                                </div>
                                <div>
                                  <div className="font-medium">Support technique</div>
                                  <div>Position: 2</div>
                                </div>
                                <div>
                                  <div className="font-medium">Commercial</div>
                                  <div>Position: 1</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-3 flex justify-between">
                            <Button variant="outline" size="sm" className="text-xs h-8 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                                <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                              </svg>
                              Mes files
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-8 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                              </svg>
                              Paramètres
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium mb-2">Statistiques de file d'attente</div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-neutral-dark">Temps moyen d'attente</div>
                              <div className="font-bold">1m 45s</div>
                            </div>
                            <div>
                              <div className="text-neutral-dark">Appels en attente</div>
                              <div className="font-bold">4</div>
                            </div>
                            <div>
                              <div className="text-neutral-dark">Agents disponibles</div>
                              <div className="font-bold">3</div>
                            </div>
                            <div>
                              <div className="text-neutral-dark">Ma durée moyenne</div>
                              <div className="font-bold">3m 12s</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 grid grid-cols-2 gap-2">
                          <Button 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => alert('Rejoindre la file ! Cette fonctionnalité sera bientôt implémentée.')}
                          >
                            Rejoindre la file
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-red-300 text-red-700"
                            onClick={() => alert('Quitter la file ! Cette fonctionnalité sera bientôt implémentée.')}
                          >
                            Quitter la file
                          </Button>
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
