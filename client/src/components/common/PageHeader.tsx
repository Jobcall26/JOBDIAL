import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        {description && <p className="text-neutral-dark">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="sm:ml-auto mt-3 sm:mt-0">
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}
