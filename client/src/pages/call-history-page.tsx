import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  Calendar,
  Download,
  Filter,
  Play,
  Clock,
  CalendarIcon,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import UserAvatar from "@/components/common/UserAvatar";

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
    id: number;
    name: string;
  };
  duration: string;
  timestamp: string;
  date: string;
  result: "interested" | "refused" | "callback" | "absent";
  recordingUrl?: string;
  notes?: string;
};

export default function CallHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  
  // Filter states
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [campaignFilter, setCompaignFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  // Fetch call history with pagination and filters
  const { data } = useQuery<{
    calls: CallRecord[];
    total: number;
    limit: number;
  }>({
    queryKey: [
      "/api/calls/history", 
      { 
        page, 
        search: searchQuery,
        result: resultFilter !== "all" ? resultFilter : undefined,
        campaign: campaignFilter !== "all" ? campaignFilter : undefined,
        agent: agentFilter !== "all" ? agentFilter : undefined,
        dateFrom: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        dateTo: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      }
    ],
  });

  // Fetch campaigns and agents for filters
  const { data: filterOptions } = useQuery<{
    campaigns: { id: number; name: string }[];
    agents: { id: number; username: string }[];
  }>({
    queryKey: ["/api/calls/filter-options"],
  });

  const calls = data?.calls || [];
  const totalCalls = data?.total || 0;
  const pageSize = data?.limit || 10;
  const totalPages = Math.ceil(totalCalls / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleViewDetails = (call: CallRecord) => {
    setSelectedCall(call);
    setIsCallDetailsOpen(true);
  };

  const handleExport = () => {
    // Implement export functionality
    window.alert("Export functionality would go here");
  };

  const handleApplyFilters = () => {
    setPage(1);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setResultFilter("all");
    setCompaignFilter("all");
    setAgentFilter("all");
    setDateRange({
      from: addDays(new Date(), -7),
      to: new Date(),
    });
  };

  return (
    <Layout>
      <PageHeader
        title="Historique d'appels"
        description="Consultez l'historique des appels passés"
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Liste des appels</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(true)}>
                <Filter className="h-4 w-4 mr-1" />
                Filtrer
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
              <form onSubmit={handleSearch} className="flex">
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 h-9"
                />
                <Button type="submit" variant="ghost" className="ml-2 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-light">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Campagne
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Date et heure
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Résultat
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {calls.length > 0 ? (
                  calls.map((call) => (
                    <tr key={call.id} className="hover:bg-neutral-lightest">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserAvatar
                            user={{ username: call.agent.username }}
                            className="w-8 h-8 rounded-full overflow-hidden mr-2"
                          />
                          <div>{call.agent.username}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>{call.contact.name}</div>
                        <div className="text-xs text-neutral-dark">{call.contact.phone}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>{call.campaign.name}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-neutral-dark mr-2" />
                          <span>{call.duration}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>{call.timestamp}</div>
                        <div className="text-xs text-neutral-dark">{call.date}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge status={call.result} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(call)}>
                              Voir détails
                            </DropdownMenuItem>
                            {call.recordingUrl && (
                              <DropdownMenuItem>
                                <Play className="h-4 w-4 mr-2" />
                                Écouter l&apos;enregistrement
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Rappeler le contact</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-neutral-dark">
                      Aucun appel trouvé
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
              totalItems={totalCalls}
              itemsPerPage={pageSize}
              itemName="appels"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Dialog */}
      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrer les appels</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Résultat</label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les résultats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les résultats</SelectItem>
                  <SelectItem value="interested">Intéressé</SelectItem>
                  <SelectItem value="refused">Refusé</SelectItem>
                  <SelectItem value="callback">Rappel</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Campagne</label>
              <Select value={campaignFilter} onValueChange={setCompaignFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les campagnes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les campagnes</SelectItem>
                  {filterOptions?.campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Agent</label>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les agents</SelectItem>
                  {filterOptions?.agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Période</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "d MMMM yyyy", { locale: fr })} -{" "}
                          {format(dateRange.to, "d MMMM yyyy", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "d MMMM yyyy", { locale: fr })
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleResetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={handleApplyFilters}>
                Appliquer les filtres
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Details Dialog */}
      <Dialog open={isCallDetailsOpen} onOpenChange={setIsCallDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;appel</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Contact</h3>
                  <p className="font-medium">{selectedCall.contact.name}</p>
                  <p className="text-sm">{selectedCall.contact.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Agent</h3>
                  <div className="flex items-center">
                    <UserAvatar
                      user={{ username: selectedCall.agent.username }}
                      className="w-6 h-6 mr-2"
                    />
                    <span>{selectedCall.agent.username}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Campagne</h3>
                  <p>{selectedCall.campaign.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Date et heure</h3>
                  <p>{selectedCall.timestamp}</p>
                  <p className="text-sm text-neutral-dark">{selectedCall.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Durée</h3>
                  <p>{selectedCall.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Résultat</h3>
                  <StatusBadge status={selectedCall.result} />
                </div>
              </div>

              {selectedCall.notes && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Notes</h3>
                  <div className="p-3 bg-neutral-lightest rounded border border-neutral-light">
                    <p className="text-sm whitespace-pre-wrap">{selectedCall.notes}</p>
                  </div>
                </div>
              )}

              {selectedCall.recordingUrl && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">Enregistrement</h3>
                  <div className="flex items-center justify-center p-3 bg-neutral-lightest rounded border border-neutral-light">
                    <audio controls className="w-full">
                      <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                      Votre navigateur ne prend pas en charge la lecture audio.
                    </audio>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsCallDetailsOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
