import { useState } from "react";
import AgentLayout from "@/components/layout/AgentLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  Calendar,
  Filter,
  Phone,
  Clock,
  User,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CallRecord = {
  id: number;
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
  time: string;
  result: "interested" | "refused" | "callback" | "absent";
  recordingUrl?: string;
  notes?: string;
};

export default function AgentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);
  
  // Filter states
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("today");
  
  // Fetch agent call history
  const { data: callHistory, isLoading } = useQuery<{
    calls: CallRecord[];
    summary: {
      total: number;
      interested: number;
      refused: number;
      callback: number;
      absent: number;
      avgDuration: string;
    };
  }>({
    queryKey: [
      "/api/agent/calls/history", 
      { 
        period: activeTab,
        result: resultFilter !== "all" ? resultFilter : undefined,
        campaign: campaignFilter !== "all" ? campaignFilter : undefined,
        search: searchQuery || undefined,
      }
    ],
  });
  
  // Fetch filter options
  const { data: filterOptions } = useQuery<{
    results: { value: string; label: string }[];
    campaigns: { value: string; label: string }[];
  }>({
    queryKey: ["/api/agent/calls/filter-options"],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };
  
  const handleApplyFilters = () => {
    setIsFiltersOpen(false);
  };
  
  const handleResetFilters = () => {
    setResultFilter("all");
    setCampaignFilter("all");
    setDateFilter("all");
  };
  
  const viewCallDetails = (call: CallRecord) => {
    setSelectedCall(call);
    setIsCallDetailsOpen(true);
  };
  
  const getResultBadge = (result: string) => {
    switch (result) {
      case "interested":
        return <Badge className="bg-green-500">Intéressé</Badge>;
      case "refused":
        return <Badge className="bg-red-500">Refusé</Badge>;
      case "callback":
        return <Badge className="bg-amber-500">Rappel</Badge>;
      case "absent":
        return <Badge className="bg-neutral-500">Absent</Badge>;
      default:
        return <Badge>{result}</Badge>;
    }
  };
  
  return (
    <AgentLayout>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-lg">Historique des appels</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(true)}>
                <Filter className="h-4 w-4 mr-1" />
                Filtrer
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
          {/* Stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-neutral-dark">Total appels</div>
                <div className="text-2xl font-bold">{callHistory?.summary.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-neutral-dark">Intéressés</div>
                <div className="text-2xl font-bold text-green-600">{callHistory?.summary.interested || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-neutral-dark">Rappels</div>
                <div className="text-2xl font-bold text-amber-600">{callHistory?.summary.callback || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-neutral-dark">Refusés</div>
                <div className="text-2xl font-bold text-red-600">{callHistory?.summary.refused || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-neutral-dark">Durée moy.</div>
                <div className="text-2xl font-bold">{callHistory?.summary.avgDuration || "0:00"}</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
              <TabsTrigger value="week">Cette semaine</TabsTrigger>
              <TabsTrigger value="month">Ce mois</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-light">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Date & Heure
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
                    Résultat
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center">
                      Chargement de l'historique...
                    </td>
                  </tr>
                ) : callHistory?.calls && callHistory.calls.length > 0 ? (
                  callHistory.calls.map((call) => (
                    <tr key={call.id} className="hover:bg-neutral-lightest">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-medium">{call.date}</div>
                        <div className="text-sm text-neutral-dark">{call.time}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-medium">{call.contact.name}</div>
                        <div className="text-sm text-neutral-dark">{call.contact.phone}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>{call.campaign.name}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-medium">{call.duration}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {getResultBadge(call.result)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewCallDetails(call)}>
                              Voir détails
                            </DropdownMenuItem>
                            {call.recordingUrl && (
                              <DropdownMenuItem>
                                Écouter l'enregistrement
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-neutral-dark">
                      Aucun appel trouvé pour cette période
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                  {filterOptions?.results.map((result) => (
                    <SelectItem key={result.value} value={result.value}>
                      {result.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Campagne</label>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les campagnes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les campagnes</SelectItem>
                  {filterOptions?.campaigns.map((campaign) => (
                    <SelectItem key={campaign.value} value={campaign.value}>
                      {campaign.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="yesterday">Hier</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'appel</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-2">Contact</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedCall.contact.name}</div>
                          <div className="text-sm text-neutral-dark">{selectedCall.contact.phone}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-2">Informations</h3>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-dark">Date:</span>
                        <span className="font-medium">{selectedCall.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-dark">Heure:</span>
                        <span className="font-medium">{selectedCall.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-dark">Durée:</span>
                        <span className="font-medium">{selectedCall.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-dark">Campagne:</span>
                        <span className="font-medium">{selectedCall.campaign.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-dark">Résultat:</span>
                        <span>{getResultBadge(selectedCall.result)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {selectedCall.notes && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-2">Notes</h3>
                  <Card>
                    <CardContent className="p-4">
                      <p>{selectedCall.notes}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {selectedCall.recordingUrl && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-2">Enregistrement</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-neutral-dark" />
                        <div className="flex-1">
                          <audio controls className="w-full">
                            <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                            Votre navigateur ne supporte pas la lecture audio
                          </audio>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsCallDetailsOpen(false)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AgentLayout>
  );
}
