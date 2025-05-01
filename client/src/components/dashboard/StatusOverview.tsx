import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { ArrowDown, ArrowUp } from "lucide-react";

type Stat = {
  label: string;
  value: string | number;
  suffix?: string;
  status?: "available" | "busy" | "offline";
  progress?: number;
  total?: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
};

export default function StatusOverview() {
  const { data: stats } = useQuery<{
    connectedAgents: number;
    totalAgents: number;
    activeCallsCount: number;
    conversionRate: string;
    avgCallTime: string;
    changes: {
      calls: number;
      conversion: number;
      avgTime: string;
    }
  }>({
    queryKey: ["/api/stats/overview"],
  });

  const statsItems: Stat[] = [
    {
      label: "Agents connectés",
      value: stats?.connectedAgents || 0,
      suffix: `/ ${stats?.totalAgents || 0} agents`,
      status: "available",
      progress: stats ? (stats.connectedAgents / stats.totalAgents) * 100 : 0,
    },
    {
      label: "Appels en cours",
      value: stats?.activeCallsCount || 0,
      suffix: "appels actifs",
      status: "busy",
      change: {
        value: `${stats?.changes?.calls || 0}% par rapport à hier`,
        isPositive: (stats?.changes?.calls || 0) > 0,
      },
    },
    {
      label: "Taux de conversion",
      value: stats?.conversionRate || "0%",
      change: {
        value: `${Math.abs(stats?.changes?.conversion || 0)}% par rapport à hier`,
        isPositive: (stats?.changes?.conversion || 0) > 0,
      },
    },
    {
      label: "Temps moyen d'appel",
      value: stats?.avgCallTime || "0:00",
      suffix: "minutes",
      change: {
        value: `${stats?.changes?.avgTime || "0:00"} par rapport à hier`,
        isPositive: true,
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between mb-1">
              <div className="text-neutral-dark text-sm">{stat.label}</div>
              {stat.status && (
                <div className={`status-badge status-badge-${stat.status}`}>
                  <span className={`h-2 w-2 bg-[${stat.status === 'available' ? '#10B981' : stat.status === 'busy' ? '#F59E0B' : '#EF4444'}] rounded-full mr-1`}></span>
                  {stat.status === "available" ? "Actif" : stat.status === "busy" ? "En cours" : "Inactif"}
                </div>
              )}
            </div>
            <div className="flex items-end">
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.suffix && <div className="text-neutral-dark text-sm ml-2">{stat.suffix}</div>}
            </div>
            {stat.progress !== undefined && (
              <div className="mt-2">
                <Progress value={stat.progress} className="h-1 bg-neutral-light" />
              </div>
            )}
            {stat.change && (
              <div className="mt-2 flex items-center text-xs text-neutral-dark">
                {stat.change.isPositive ? (
                  <ArrowUp className="h-3 w-3 text-[#10B981] mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-[#EF4444] mr-1" />
                )}
                <span>{stat.change.value}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
