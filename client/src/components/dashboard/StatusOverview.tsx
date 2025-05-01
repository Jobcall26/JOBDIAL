import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { ArrowDown, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

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

  // Animation variants for the cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Progress animation
  const progressVariants = {
    hidden: { width: 0 },
    show: (value: number) => ({
      width: `${value}%`,
      transition: { duration: 1, ease: "easeOut" }
    })
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {statsItems.map((stat, index) => (
        <motion.div key={index} variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex justify-between mb-1">
                <div className="text-neutral-dark text-sm">{stat.label}</div>
                {stat.status && (
                  <motion.div 
                    className={`status-badge status-badge-${stat.status}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="h-2 w-2 bg-[#10B981] rounded-full mr-1"></span>
                    {stat.status === "available" ? "Actif" : stat.status === "busy" ? "En cours" : "Inactif"}
                  </motion.div>
                )}
              </div>
              <motion.div 
                className="flex items-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.suffix && <div className="text-neutral-dark text-sm ml-2">{stat.suffix}</div>}
              </motion.div>
              {stat.progress !== undefined && (
                <div className="mt-2 h-1 bg-neutral-light rounded overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    custom={stat.progress} 
                    variants={progressVariants} 
                    initial="hidden" 
                    animate="show"
                  />
                </div>
              )}
              {stat.change && (
                <motion.div 
                  className="mt-2 flex items-center text-xs text-neutral-dark"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {stat.change.isPositive ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 20, 0] }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <ArrowUp className="h-3 w-3 text-[#10B981] mr-1" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -20, 0] }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <ArrowDown className="h-3 w-3 text-[#EF4444] mr-1" />
                    </motion.div>
                  )}
                  <span>{stat.change.value}</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
