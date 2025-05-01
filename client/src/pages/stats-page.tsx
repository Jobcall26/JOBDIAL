import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StatsPage() {
  const [period, setPeriod] = useState("week");
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  
  // Fetch performance report data
  const { data: performanceData } = useQuery<{
    period: string;
    dates: string[];
    calls: number[];
    conversions: number[];
    summary: {
      totalCalls: number;
      totalConversions: number;
      avgCallsPerDay: string;
      conversionRate: string;
    };
  }>({
    queryKey: [
      "/api/reports/performance", 
      { 
        period,
        agentId,
        campaignId
      }
    ],
  });
  
  // Fetch campaign report data
  const { data: campaignData } = useQuery<{
    campaigns: {
      id: number;
      name: string;
      total: number;
      interested: number;
      callback: number;
      refused: number;
      conversionRate: string;
    }[];
    summary: {
      totalCalls: number;
      totalConversions: number;
      avgConversionRate: string;
    };
  }>({
    queryKey: ["/api/reports/campaigns", { period }],
  });
  
  // Fetch conversion report data
  const { data: conversionData } = useQuery<{
    pieChart: { name: string; value: number; color: string }[];
    conversionTrend: {
      labels: string[];
      data: { name: string; values: number[] }[];
    };
    summary: {
      totalCalls: number;
      interested: number;
      callback: number;
      refused: number;
      interestedPercentage: string;
      callbackPercentage: string;
      refusedPercentage: string;
    };
  }>({
    queryKey: [
      "/api/reports/conversion", 
      { 
        period,
        agentId,
        campaignId
      }
    ],
  });
  
  const getPerformanceChartData = () => {
    if (!performanceData) return [];
    
    return performanceData.dates.map((date, index) => ({
      date,
      appels: performanceData.calls[index],
      conversions: performanceData.conversions[index],
    }));
  };
  
  const getCampaignChartData = () => {
    if (!campaignData) return [];
    
    return campaignData.campaigns.map(campaign => ({
      name: campaign.name,
      intéressé: campaign.interested,
      rappel: campaign.callback,
      refusé: campaign.refused,
    }));
  };
  
  return (
    <Layout>
      <PageHeader
        title="Statistiques"
        description="Analyse des performances et tendances"
      />
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Période</label>
          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Agent</label>
          <Select
            value={agentId || "all"}
            onValueChange={(value) => setAgentId(value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[200px]">
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
          <label className="text-sm font-medium mb-1 block">Campagne</label>
          <Select
            value={campaignId || "all"}
            onValueChange={(value) => setCampaignId(value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Toutes les campagnes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les campagnes</SelectItem>
              <SelectItem value="1">Assurance Santé Q3</SelectItem>
              <SelectItem value="2">Renouvellement Internet</SelectItem>
              <SelectItem value="3">Étude de marché</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="performance">
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Total appels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.summary.totalCalls || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Total conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.summary.totalConversions || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Moyenne d'appels par jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.summary.avgCallsPerDay || "0"}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Taux de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.summary.conversionRate || "0%"}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Évolution des appels et conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getPerformanceChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="appels" stroke="#3f83f8" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Total appels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaignData?.summary.totalCalls || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Total conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaignData?.summary.totalConversions || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Taux de conversion moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaignData?.summary.avgConversionRate || "0%"}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance par campagne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getCampaignChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="intéressé" fill="#10b981" />
                    <Bar dataKey="rappel" fill="#eab308" />
                    <Bar dataKey="refusé" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversion">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Total appels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionData?.summary.totalCalls || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Intéressés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {conversionData?.summary.interested || 0} 
                  <span className="text-sm ml-1 font-normal">({conversionData?.summary.interestedPercentage || "0%"})</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Rappels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {conversionData?.summary.callback || 0}
                  <span className="text-sm ml-1 font-normal">({conversionData?.summary.callbackPercentage || "0%"})</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-dark">Refus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {conversionData?.summary.refused || 0}
                  <span className="text-sm ml-1 font-normal">({conversionData?.summary.refusedPercentage || "0%"})</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des résultats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conversionData?.pieChart || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {conversionData?.pieChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendance de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={conversionData?.conversionTrend.labels.map((label, index) => ({
                        jour: label,
                        taux: conversionData.conversionTrend.data[0].values[index]
                      })) || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="jour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="taux" name="Taux de conversion" stroke="#3f83f8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
    </Layout>
  );
}
