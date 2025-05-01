import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Define form schema with Zod
const agentFormSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  email: z.string().email("Email invalide"),
  campaigns: z.array(z.number()).optional(),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

export default function AgentForm({ 
  agentId,
  onSuccess 
}: { 
  agentId?: number;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  
  // Fetch agent data if editing
  const { data: agentData, isLoading: isLoadingAgent } = useQuery<AgentFormData & { campaigns: number[] }>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });
  
  // Fetch campaigns for assignment
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/campaigns/list"],
  });
  
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      campaigns: [],
    },
    values: agentData,
  });
  
  const mutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      if (agentId) {
        // Update existing agent
        const res = await apiRequest("PUT", `/api/agents/${agentId}`, data);
        return res.json();
      } else {
        // Create new agent
        const res = await apiRequest("POST", "/api/agents", data);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: agentId ? "Agent mis à jour" : "Agent créé",
        description: agentId 
          ? "L'agent a été mis à jour avec succès"
          : "L'agent a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: AgentFormData) => {
    mutation.mutate(data);
  };
  
  if ((agentId && isLoadingAgent) || isLoadingCampaigns) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom d&apos;utilisateur</FormLabel>
              <FormControl>
                <Input placeholder="john.doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@exemple.fr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{agentId ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe"}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={agentId ? "••••••••" : "Mot de passe"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {campaigns && campaigns.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Campagnes assignées</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3">
              {campaigns.map((campaign) => (
                <FormField
                  key={campaign.id}
                  control={form.control}
                  name="campaigns"
                  render={({ field }) => {
                    const isChecked = field.value?.includes(campaign.id) || false;
                    return (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, campaign.id]);
                              } else {
                                field.onChange(
                                  currentValue.filter((id) => id !== campaign.id)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <span className="text-sm">{campaign.name}</span>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending 
              ? (agentId ? "Mise à jour..." : "Création...")
              : (agentId ? "Mettre à jour" : "Créer l'agent")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
