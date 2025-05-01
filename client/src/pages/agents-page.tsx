import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, MoreHorizontal, User, Phone, Clock } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AgentForm from "@/components/agents/AgentForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Agent = {
  id: number;
  username: string;
  email: string;
  role: string;
  status: "available" | "on_call" | "paused" | "offline";
  statusDuration: string;
  lastActivity: string;
  campaignsCount: number;
  callsToday: number;
};

export default function AgentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  // Fetch agents with pagination and search
  const { data } = useQuery<{
    agents: Agent[];
    total: number;
    limit: number;
  }>({
    queryKey: ["/api/agents", { page, search: searchQuery }],
  });

  const agents = data?.agents || [];
  const totalAgents = data?.total || 0;
  const pageSize = data?.limit || 10;
  const totalPages = Math.ceil(totalAgents / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleEditAgent = (agentId: number) => {
    setSelectedAgentId(agentId);
    setIsDialogOpen(true);
  };

  const handleAddAgent = () => {
    setSelectedAgentId(null);
    setIsDialogOpen(true);
  };

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "available":
        return <Phone className="h-4 w-4 text-[#10B981] mr-2" />;
      case "on_call":
        return <Phone className="h-4 w-4 text-[#F59E0B] mr-2" />;
      case "paused":
        return <Clock className="h-4 w-4 text-[#F59E0B] mr-2" />;
      case "offline":
        return <User className="h-4 w-4 text-[#EF4444] mr-2" />;
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Agents"
        description="Gestion des agents du centre d'appel"
        action={
          isAdmin
            ? {
                label: "Ajouter un agent",
                onClick: handleAddAgent,
                icon: <UserPlus className="h-4 w-4" />,
              }
            : undefined
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Liste des agents</CardTitle>
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
              <Input
                placeholder="Rechercher un agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:w-64"
              />
              <Button type="submit" variant="ghost" className="ml-2">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
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
                    Dernière activité
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Campagnes
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Appels aujourd&apos;hui
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"></th>
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
                            className="w-8 h-8 mr-3"
                          />
                          <div>
                            <div className="font-medium">{agent.username}</div>
                            <div className="text-xs text-neutral-dark">{agent.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(agent.status)}
                          <StatusBadge status={agent.status} />
                          <span className="text-xs text-neutral-dark ml-2">
                            {agent.statusDuration}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {agent.lastActivity}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                        {agent.campaignsCount}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                        {agent.callsToday}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditAgent(agent.id)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem>Voir les statistiques</DropdownMenuItem>
                              <DropdownMenuItem>Assigner des campagnes</DropdownMenuItem>
                              <DropdownMenuItem className="text-[#EF4444]">
                                Désactiver
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-neutral-dark">
                      Aucun agent trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalAgents}
              itemsPerPage={pageSize}
              itemName="agents"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAgentId ? "Modifier l'agent" : "Ajouter un nouvel agent"}
            </DialogTitle>
          </DialogHeader>
          <AgentForm
            agentId={selectedAgentId || undefined}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
