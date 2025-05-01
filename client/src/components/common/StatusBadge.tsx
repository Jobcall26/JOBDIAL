import { cn } from "@/lib/utils";

type StatusType = 
  | "active" 
  | "paused" 
  | "completed" 
  | "interested" 
  | "refused" 
  | "callback" 
  | "absent"
  | "available"
  | "on_call"
  | "offline";

export default function StatusBadge({ 
  status,
  className
}: { 
  status: StatusType;
  className?: string;
}) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "active":
      case "interested":
      case "available":
        return { 
          bgColor: "bg-[#10B981]/10",
          textColor: "text-[#10B981]",
          label: status === "active" 
            ? "Active" 
            : status === "interested" 
              ? "Intéressé" 
              : "Disponible"
        };
      
      case "paused":
      case "callback":
      case "on_call":
        return { 
          bgColor: "bg-[#F59E0B]/10",
          textColor: "text-[#F59E0B]",
          label: status === "paused" 
            ? "En pause" 
            : status === "callback" 
              ? "Rappel" 
              : "En appel"
        };
      
      case "refused":
      case "offline":
        return { 
          bgColor: "bg-[#EF4444]/10",
          textColor: "text-[#EF4444]",
          label: status === "refused" ? "Refusé" : "Déconnecté" 
        };
      
      case "completed":
        return { 
          bgColor: "bg-neutral-200",
          textColor: "text-neutral-700",
          label: "Terminée" 
        };
      
      case "absent":
        return { 
          bgColor: "bg-neutral-200",
          textColor: "text-neutral-700",
          label: "Absent" 
        };
        
      default:
        return {
          bgColor: "bg-neutral-200",
          textColor: "text-neutral-700",
          label: "Inconnu"
        };
    }
  };
  
  const { bgColor, textColor, label } = getStatusConfig(status);
  
  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      bgColor,
      textColor,
      className
    )}>
      {label}
    </div>
  );
}
