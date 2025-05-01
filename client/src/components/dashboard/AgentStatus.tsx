import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuth } from "@/hooks/use-auth";
import { Phone, PhoneCall, Clock, Power, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import AgentForm from "@/components/agents/AgentForm";

type AgentStatus = "available" | "on_call" | "paused" | "offline";

type Agent = {
  id: number;
  username: string;
  status: AgentStatus;
  statusDuration: string;
  currentCall?: {
    contactName: string;
  };
};

export default function AgentStatus() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data } = useQuery<{
    agents: Agent[];
    counts: {
      available: number;
      on_call: number;
      offline: number;
    }
  }>({
    queryKey: ["/api/agents/status"],
  });

  const agents = data?.agents || [];
  const counts = data?.counts || { available: 0, on_call: 0, offline: 0 };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case "available":
        return <Phone className="h-4 w-4 text-[#10B981] mr-1" />;
      case "on_call":
        return <PhoneCall className="h-4 w-4 text-[#F59E0B] mr-1" />;
      case "paused":
        return <Clock className="h-4 w-4 text-[#F59E0B] mr-1" />;
      case "offline":
        return <Power className="h-4 w-4 text-[#EF4444] mr-1" />;
    }
  };

  const getStatusText = (agent: Agent) => {
    switch (agent.status) {
      case "available":
        return "Disponible";
      case "on_call":
        return `En appel avec ${agent.currentCall?.contactName || "..."}`;
      case "paused":
        return "En pause";
      case "offline":
        return "Déconnecté(e)";
    }
  };

  const getStatusColor = (status: AgentStatus) => {
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

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg font-semibold">Statut des agents</CardTitle>
        <Button variant="link" size="sm" asChild>
          <Link href="/agents">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
            <span>Disponibles</span>
            <span className="font-medium">{counts.available}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
            <span>En appel</span>
            <span className="font-medium">{counts.on_call}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
            <span>Déconnectés</span>
            <span className="font-medium">{counts.offline}</span>
          </div>
        </div>
        
        <div className="space-y-3 overflow-y-auto max-h-72">
          {agents.length > 0 ? (
            agents.map((agent) => (
              <div key={agent.id} className="flex items-center p-2 border border-neutral-light rounded-lg hover:bg-neutral-lightest">
                <div className="relative mr-3">
                  <UserAvatar
                    user={{ username: agent.username }}
                    className="w-10 h-10 bg-neutral-light rounded-full overflow-hidden"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(agent.status)} border-2 border-white`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{agent.username}</div>
                    <div className="text-xs text-neutral-dark">{agent.statusDuration}</div>
                  </div>
                  <div className="text-sm text-neutral-dark flex items-center">
                    {getStatusIcon(agent.status)}
                    <span>{getStatusText(agent)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-dark">
              Aucun agent connecté pour le moment
            </div>
          )}
        </div>
        
        {isAdmin && (
          <div className="mt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-primary hover:bg-primary-dark">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel agent</DialogTitle>
                </DialogHeader>
                <AgentForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
