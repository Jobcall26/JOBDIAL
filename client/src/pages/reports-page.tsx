import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { addDays, format, isAfter, isBefore, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/common/UserAvatar";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("activity");
  const [period, setPeriod] = useState("month");
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  
  // Fetch activity report data
  const { data: activityData } = useQuery<{
    dateRange: { from: string; to: string; days: number };
    activities: {
      id: number;
      username: string;
      totalCalls: number;
      totalDuration: string;
      avgCallDuration: string;
      statuses: {
        available: string;
        on_call: string;
        paused: string;
        offline: string;
      };
      callResults: {
        interested: number;
        callback: number;
        refused: number;
      };
      conversions: string;
    }[];
    summary: {
      totalAgents: number;
      totalCalls: number;
      avgCallsPerAgent: string;
      avgConversion: string;
    } | null;
  }>({
    queryKey: [
      "/api/reports/activity", 
      { 
        dateFrom: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        dateTo: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        agentId
      }
    ],
    enabled: !!dateRange.from && !!dateRange.to,
  });
  
  // Calculate total activity time percentages
  const getStatusWidth = (statusValue: string) => {
    if (!statusValue) return 0;
    const percentage = parseInt(statusValue.replace("%", ""));
    return isNaN(percentage) ? 0 : percentage;
  };
  
  const getResultColors = (result: string) => {
    switch (result) {
      case "interested":
        return "bg-emerald-500";
      case "callback":
        return "bg-amber-500";
      case "refused":
        return "bg-red-500";
      default:
        return "bg-neutral-500";
    }
  };
  
  return (
    <Layout>
      <PageHeader
        title="Rapports"
        description="Générer et visualiser les rapports d'activité"
      />
      
      <Tabs defaultValue="activity" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
        
        <TabsContent value="activity">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Agent</label>
                  <Select
                    value={agentId || "all"}
                    onValueChange={(value) => setAgentId(value === "all" ? undefined : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tous les agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les agents</SelectItem>
                      <SelectItem value="2">Emilie Laurent</SelectItem>
                      <SelectItem value="3">Thomas Moreau</SelectItem>
                      <SelectItem value="4">Sophie Martin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Période</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
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
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange as any}
                        numberOfMonths={2}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {activityData?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-dark">Total agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityData.summary.totalAgents}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-dark">Total appels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityData.summary.totalCalls}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-dark">Moyenne appels/agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityData.summary.avgCallsPerAgent}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-dark">Taux de conversion moyen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityData.summary.avgConversion}</div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Détail d'activité des agents</CardTitle>
            </CardHeader>
            <CardContent>
              {activityData?.activities && activityData.activities.length > 0 ? (
                <div className="space-y-8">
                  {activityData.activities.map((agent) => (
                    <div key={agent.id} className="border border-neutral-light rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                        <div className="flex items-center">
                          <UserAvatar user={{ username: agent.username }} className="h-10 w-10 mr-3" />
                          <div>
                            <h3 className="font-medium">{agent.username}</h3>
                            <div className="text-sm text-neutral-dark">Agent</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                          <div className="text-center">
                            <div className="text-sm text-neutral-dark">Appels</div>
                            <div className="font-medium">{agent.totalCalls}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-neutral-dark">Durée totale</div>
                            <div className="font-medium">{agent.totalDuration}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-neutral-dark">Durée moyenne</div>
                            <div className="font-medium">{agent.avgCallDuration}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-neutral-dark">Conversion</div>
                            <div className="font-medium">{agent.conversions}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Répartition du temps</div>
                          <div className="h-2.5 w-full bg-neutral-lightest rounded-full">
                            <div className="flex h-full rounded-full overflow-hidden">
                              <div className="bg-green-500" style={{ width: `${getStatusWidth(agent.statuses.available)}%` }}></div>
                              <div className="bg-blue-500" style={{ width: `${getStatusWidth(agent.statuses.on_call)}%` }}></div>
                              <div className="bg-amber-500" style={{ width: `${getStatusWidth(agent.statuses.paused)}%` }}></div>
                              <div className="bg-neutral-dark" style={{ width: `${getStatusWidth(agent.statuses.offline)}%` }}></div>
                            </div>
                          </div>
                          <div className="flex text-xs text-neutral-dark mt-1 flex-wrap gap-x-4">
                            <div><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Disponible ({agent.statuses.available})</div>
                            <div><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span> En appel ({agent.statuses.on_call})</div>
                            <div><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span> En pause ({agent.statuses.paused})</div>
                            <div><span className="inline-block w-2 h-2 rounded-full bg-neutral-dark mr-1"></span> Déconnecté ({agent.statuses.offline})</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Résultats des appels</div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Intéressés</span>
                                <span className="font-medium">{agent.callResults.interested}</span>
                              </div>
                              <Progress value={(agent.callResults.interested / agent.totalCalls) * 100} className="bg-neutral-lightest h-2 [&>div]:bg-emerald-500" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Rappels</span>
                                <span className="font-medium">{agent.callResults.callback}</span>
                              </div>
                              <Progress value={(agent.callResults.callback / agent.totalCalls) * 100} className="bg-neutral-lightest h-2 [&>div]:bg-amber-500" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Refus</span>
                                <span className="font-medium">{agent.callResults.refused}</span>
                              </div>
                              <Progress value={(agent.callResults.refused / agent.totalCalls) * 100} className="bg-neutral-lightest h-2 [&>div]:bg-red-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-dark">
                  Aucune donnée disponible pour la période sélectionnée.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Rapports de performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button className="flex flex-col items-center justify-center h-auto py-6 gap-2" variant="outline">
                  <FileText className="h-8 w-8 text-neutral-dark" />
                  <div className="text-base font-medium">Rapport d’agents</div>
                  <div className="text-xs text-neutral-dark">Performance des agents</div>
                </Button>
                
                <Button className="flex flex-col items-center justify-center h-auto py-6 gap-2" variant="outline">
                  <FileText className="h-8 w-8 text-neutral-dark" />
                  <div className="text-base font-medium">Rapport de campagnes</div>
                  <div className="text-xs text-neutral-dark">Performance des campagnes</div>
                </Button>
                
                <Button className="flex flex-col items-center justify-center h-auto py-6 gap-2" variant="outline">
                  <FileText className="h-8 w-8 text-neutral-dark" />
                  <div className="text-base font-medium">Rapport de conversion</div>
                  <div className="text-xs text-neutral-dark">Taux de conversion par agent</div>
                </Button>
                
                <Button className="flex flex-col items-center justify-center h-auto py-6 gap-2" variant="outline">
                  <FileText className="h-8 w-8 text-neutral-dark" />
                  <div className="text-base font-medium">Rapport horaire</div>
                  <div className="text-xs text-neutral-dark">Performance par heure</div>
                </Button>
                
                <Button className="flex flex-col items-center justify-center h-auto py-6 gap-2" variant="outline">
                  <FileText className="h-8 w-8 text-neutral-dark" />
                  <div className="text-base font-medium">Rapport de suivi</div>
                  <div className="text-xs text-neutral-dark">Progression des objectives</div>
                </Button>
                
                <Button className="flex flex-col items-center justify-center h-auto py-6 gap-2" variant="outline">
                  <FileText className="h-8 w-8 text-neutral-dark" />
                  <div className="text-base font-medium">Rapport personnalisé</div>
                  <div className="text-xs text-neutral-dark">Générer un rapport sur mesure</div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Rapports de campagnes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-dark mb-4">
                Sélectionnez une campagne pour générer un rapport détaillé de performance, conversion, et activité.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Campagne</label>
                  <Select value={campaignId || "all"}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Sélectionner une campagne" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Assurance Santé Q3</SelectItem>
                      <SelectItem value="2">Renouvellement Internet</SelectItem>
                      <SelectItem value="3">Étude de marché</SelectItem>
                      <SelectItem value="4">Lancement Mobile 5G</SelectItem>
                      <SelectItem value="5">Satisfaction Client Q2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Période</label>
                  <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Semaine</SelectItem>
                        <SelectItem value="month">Mois</SelectItem>
                        <SelectItem value="quarter">Trimestre</SelectItem>
                        <SelectItem value="custom">Personnalisée</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button className="w-40" disabled={!campaignId}>Générer</Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-lightest border border-neutral-light rounded-md p-4 mt-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-neutral-dark mb-2" />
                <p className="text-neutral-dark">
                  Sélectionnez une campagne et une période, puis cliquez sur Générer pour créer un rapport.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
    </Layout>
  );
}
