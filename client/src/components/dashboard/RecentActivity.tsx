import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import { useState } from "react";
import { Download, Filter, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/common/UserAvatar";

type CallResult = "interested" | "refused" | "callback" | "absent";

type CallRecord = {
  id: number;
  agent: {
    id: number;
    username: string;
  };
  contact: {
    name: string;
    phone: string;
  };
  campaign: {
    name: string;
  };
  duration: string;
  timestamp: string;
  date: string;
  result: CallResult;
};

export default function RecentActivity() {
  const [page, setPage] = useState(1);
  
  const { data } = useQuery<{
    calls: CallRecord[];
    total: number;
    limit: number;
  }>({
    queryKey: ["/api/calls/recent", { page, limit: 10 }],
  });

  const calls = data?.calls || [];
  const totalCalls = data?.total || 0;
  const pageSize = data?.limit || 10;
  const totalPages = Math.ceil(totalCalls / pageSize);

  const handleExport = () => {
    // Implement export functionality
    window.alert("Export functionality would go here");
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="px-2 py-1 h-8">
            <Filter className="h-4 w-4 mr-1" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm" className="px-2 py-1 h-8" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-neutral-light">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Campagne
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Heure
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Résultat
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {calls.length > 0 ? (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-neutral-lightest">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserAvatar
                          user={{ username: call.agent.username }}
                          className="w-8 h-8 rounded-full bg-neutral-light overflow-hidden mr-2"
                        />
                        <div>{call.agent.username}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>{call.contact.name}</div>
                      <div className="text-xs text-neutral-dark">{call.contact.phone}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>{call.campaign.name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>{call.duration}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>{call.timestamp}</div>
                      <div className="text-xs text-neutral-dark">{call.date}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StatusBadge status={call.result} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Voir détails</DropdownMenuItem>
                          <DropdownMenuItem>Rappeler</DropdownMenuItem>
                          <DropdownMenuItem>Historique</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-dark">
                    Aucun appel récent à afficher
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
            totalItems={totalCalls}
            itemsPerPage={pageSize}
            itemName="appels"
          />
        </div>
      </CardContent>
    </Card>
  );
}
