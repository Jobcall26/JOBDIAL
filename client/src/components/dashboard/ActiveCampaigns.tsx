import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CampaignForm from "@/components/campaigns/CampaignForm";

type Campaign = {
  id: number;
  name: string;
  startDate: string;
  agentCount: number;
  progress: number;
  conversion: number;
  status: "active" | "paused" | "completed";
};

export default function ActiveCampaigns() {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data } = useQuery<{
    campaigns: Campaign[];
    total: number;
    limit: number;
  }>({
    queryKey: ["/api/campaigns", { page, limit: 5 }],
  });

  const campaigns = data?.campaigns || [];
  const totalCampaigns = data?.total || 0;
  const pageSize = data?.limit || 5;
  const totalPages = Math.ceil(totalCampaigns / pageSize);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg font-semibold">Campagnes actives</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="px-2 py-1 h-8 text-sm flex items-center">
              <PlusIcon className="h-4 w-4 mr-1" />
              Nouvelle campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer une campagne</DialogTitle>
            </DialogHeader>
            <CampaignForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-neutral-light">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Campagne
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Agents
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Progression
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-neutral-lightest">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-neutral-dark">
                        Démarré le {new Date(campaign.startDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-light flex items-center justify-center text-xs">
                          {campaign.agentCount}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full h-2 bg-neutral-light rounded-full mr-2">
                          <div
                            className={`h-full rounded-full ${
                              campaign.status === "paused" ? "bg-[#F59E0B]" : "bg-primary"
                            }`}
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{campaign.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm">{campaign.conversion}%</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-neutral-dark">
                    Aucune campagne n&apos;est actuellement active
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3">
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
  );
}
