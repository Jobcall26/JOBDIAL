import { createContext, ReactNode, useContext, useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "./use-websocket";
import { useToast } from "./use-toast";
import { useSounds } from "./use-sounds";

type SoftphoneStatus = "disconnected" | "connecting" | "ready" | "on-call";

type Call = {
  id: string;
  contactId: number;
  campaignId: number;
  startTime: string;

  // Propriétés du contact
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactCompany?: string;
  contactJobTitle?: string;
  contactBirthdate?: string;
  contactAddress?: string;
  contactCity?: string;
  contactZipCode?: string;
  contactLastCallDate?: string;
  contactLastCallResult?: string;
  contactCallCount?: number;
  contactNotes?: string;

  // Propriétés de la campagne
  campaignName?: string;
};

type SoftphoneContextType = {
  status: SoftphoneStatus;
  isConnecting: boolean;
  isCallInProgress: boolean;
  error: string | null;
  currentCall: Call | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  makeCall: (campaignId: number) => Promise<void>;
  endCall: (result: string) => Promise<void>;
};

const SoftphoneContext = createContext<SoftphoneContextType | null>(null);

export function SoftphoneProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { sendMessage, lastMessage, isConnected } = useWebSocket();
  const { playSound } = useSounds();
  const [status, setStatus] = useState<SoftphoneStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);

  // Effet pour jouer des sons lors des changements de statut
  useEffect(() => {
    if (status === "ready") {
      playSound('statusChanged');
    } else if (status === "on-call") {
      playSound('incomingCall');
    }
  }, [status, playSound]);

  // Mutation to connect the softphone
  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/calls/connect", {});
      return res.json();
    },
    onSuccess: (data) => {
      setStatus("ready");
      sendMessage({
        type: "agent_status",
        data: { status: "available" },
      });
    },
    onError: (error) => {
      setStatus("disconnected");
      setError(error.message);
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to disconnect the softphone
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/calls/disconnect", {});
      return res.json();
    },
    onSuccess: () => {
      setStatus("disconnected");
      sendMessage({
        type: "agent_status",
        data: { status: "offline" },
      });
    },
    onError: (error) => {
      setError(error.message);
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to make a call
  const makeCallMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const res = await apiRequest("POST", "/api/calls/make", { campaignId });
      return res.json();
    },
    onSuccess: (data) => {
      setStatus("on-call");
      setCurrentCall(data.call);
      sendMessage({
        type: "agent_status",
        data: { status: "on_call" },
      });
    },
    onError: (error) => {
      setError(error.message);
      toast({
        title: "Erreur d'appel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to end a call
  const endCallMutation = useMutation({
    mutationFn: async ({ callId, result }: { callId: string; result: string }) => {
      const res = await apiRequest("POST", `/api/calls/${callId}/end`, { result });
      return res.json();
    },
    onSuccess: () => {
      setStatus("ready");
      setCurrentCall(null);
      sendMessage({
        type: "agent_status",
        data: { status: "available" },
      });

      // Jouer le son de fin d'appel
      playSound('callEnded');

      // Refresh calls list
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
    },
    onError: (error) => {
      setError(error.message);
      playSound('error');
      toast({
        title: "Erreur de fin d'appel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler for WebSocket messages related to calls
  if (lastMessage && lastMessage.type === "call_event") {
    const { event, call } = lastMessage.data;

    switch (event) {
      case "incoming":
        setStatus("on-call");
        setCurrentCall(call);
        playSound('incomingCall');
        toast({
          title: "Appel entrant",
          description: `Appel de ${call.contactName}`,
        });
        break;

      case "ended":
        setStatus("ready");
        setCurrentCall(null);
        playSound('callEnded');
        break;

      default:
        break;
    }
  }

  // Wrapped functions to expose in the context
  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    await connectMutation.mutateAsync();
  }, [connectMutation]);

  const disconnect = useCallback(async () => {
    if (currentCall) {
      throw new Error("Impossible de se déconnecter pendant un appel");
    }
    await disconnectMutation.mutateAsync();
  }, [disconnectMutation, currentCall]);

  const makeCall = useCallback(async (campaignId: number) => {
    if (status !== "ready") {
      throw new Error("Le softphone n'est pas prêt à passer des appels");
    }
    await makeCallMutation.mutateAsync(campaignId);
  }, [makeCallMutation, status]);

  const endCall = useCallback(async (result: string) => {
    if (!currentCall) {
      throw new Error("Aucun appel en cours");
    }
    await endCallMutation.mutateAsync({
      callId: currentCall.id,
      result,
    });
  }, [endCallMutation, currentCall]);

  return (
    <SoftphoneContext.Provider
      value={{
        status,
        isConnecting: connectMutation.isPending,
        isCallInProgress: status === "on-call",
        error,
        currentCall,
        connect,
        disconnect,
        makeCall,
        endCall,
      }}
    >
      {children}
    </SoftphoneContext.Provider>
  );
}

export function useSoftphone() {
  const context = useContext(SoftphoneContext);
  if (!context) {
    throw new Error("useSoftphone must be used within a SoftphoneProvider");
  }
  const [dialMode, setDialMode] = useState<"manual" | "auto" | "predictive" | "power">("manual");
  const [isRecording, setIsRecording] = useState(false);
  const [callQuality, setCallQuality] = useState<number>(100);
  const [networkLatency, setNetworkLatency] = useState<number>(0);
  const [autoDialLevel, setAutoDialLevel] = useState<number>(1);
  const [autoDialMode, setAutoDialMode] = useState<"progressive" | "predictive" | "power">("progressive");
  const [autoDialActive, setAutoDialActive] = useState<boolean>(false);
  const [hopper, setHopper] = useState<{loaded: number, total: number}>({loaded: 0, total: 0});
  const [viciDialStats, setViciDialStats] = useState({
    callsAttempted: 0,
    callsAnswered: 0,
    contactRate: 0,
    avgWaitTime: 0,
    dropRate: 0
  });
  
  return {
    ...context, 
    dialMode, 
    setDialMode, 
    isRecording, 
    setIsRecording, 
    callQuality, 
    setCallQuality, 
    networkLatency, 
    setNetworkLatency,
    autoDialLevel,
    setAutoDialLevel,
    autoDialMode,
    setAutoDialMode,
    autoDialActive,
    setAutoDialActive,
    hopper,
    setHopper,
    viciDialStats,
    setViciDialStats
  };
}