import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Calendar,
  Users,
  BarChart4,
  FileText,
} from "lucide-react";
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
import CampaignForm from "@/components/campaigns/CampaignForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Campaign = {
  id: number;
  name: string;
  description: string;
  scriptId: number;
  scriptName: string;
  startDate: string;
  agentCount: number;
  progress: number;
  conversion: number;
  status: "active" | "paused" | "completed";
  leadsTotal: number;
  leadsContacted: number;
  leadsPending: number;
};

export default function CampaignsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch campaigns with pagination, search, and filtering
  const { data } = useQuery<{
    campaigns: Campaign[];
    total: number;
    limit: number;
  }>({
    queryKey: ["/api/campaigns", { page, search: searchQuery, status: statusFilter }],
  });

  const campaigns = data?.campaigns || [];
  const totalCampaigns = data?.total || 0;
  const pageSize = data?.limit || 10;
  const totalPages = Math.ceil(totalCampaigns / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleAddCampaign = () => {
    setIsDialogOpen(true);
  };

  const getProgressColor = (campaign: Campaign) => {
    if (campaign.status === "paused") return "bg-[#F59E0B]";
    if (campaign.status === "completed") return "bg-neutral-300";
    return "bg-primary";
  };

  return (
    <Layout>
      <PageHeader
        title="Campagnes"
        description="Gestion des campagnes d'appels"
        action={
          isAdmin
            ? {
                label: "Nouvelle campagne",
                onClick: handleAddCampaign,
                icon: <PlusCircle className="h-4 w-4" />,
              }
            : undefined
        }
      />

      <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full">
        <div className="bg-white rounded-t-lg border border-neutral-light border-b-0 p-4 flex justify-between items-center flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="active">Actives</TabsTrigger>
            <TabsTrigger value="paused">En pause</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSearch} className="flex">
            <Input
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button type="submit" variant="ghost" className="ml-2">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Card className="rounded-t-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-neutral-light">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      Campagne
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      Script
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      Agents
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      Progression
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-neutral-lightest">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="font-medium">{campaign.name}</div>
                            <div className="flex items-center text-xs text-neutral-dark mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                Démarré le{" "}
                                {new Date(campaign.startDate).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-neutral-dark mr-2" />
                            <span>{campaign.scriptName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-neutral-dark mr-2" />
                            <span>{campaign.agentCount}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="w-36">
                            <div className="flex justify-between text-xs mb-1">
                              <span>
                                {campaign.leadsContacted}/{campaign.leadsTotal} contacts
                              </span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <Progress
                              value={campaign.progress}
                              className="h-2"
                              indicatorClassName={getProgressColor(campaign)}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <StatusBadge status={campaign.status} />
                            <div className="flex items-center text-xs text-neutral-dark mt-1">
                              <BarChart4 className="h-3 w-3 mr-1" />
                              <span>{campaign.conversion}% de conversion</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Voir détails</DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem>Modifier</DropdownMenuItem>
                                  <DropdownMenuItem>Assigner des agents</DropdownMenuItem>
                                  {campaign.status === "active" ? (
                                    <DropdownMenuItem>Mettre en pause</DropdownMenuItem>
                                  ) : campaign.status === "paused" ? (
                                    <DropdownMenuItem>Reprendre</DropdownMenuItem>
                                  ) : null}
                                </>
                              )}
                              <DropdownMenuItem>Rapport</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-neutral-dark">
                        Aucune campagne trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalCampaigns}
                itemsPerPage={pageSize}
                itemName="campagnes"
              />
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer une campagne</DialogTitle>
          </DialogHeader>
          <CampaignForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
