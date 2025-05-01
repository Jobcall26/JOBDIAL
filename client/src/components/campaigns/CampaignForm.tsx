import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadImport from "./LeadImport";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  scriptId: z.coerce.number().int().positive("Veuillez sélectionner un script"),
});

type FormData = z.infer<typeof formSchema>;

export default function CampaignForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [campaignId, setCampaignId] = useState<number | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      scriptId: undefined,
    },
  });

  const { data: scripts } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/scripts/list"],
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/campaigns", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Campagne créée",
        description: "La campagne a été créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setCampaignId(data.id);
      setActiveTab("leads");
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Détails</TabsTrigger>
        <TabsTrigger value="leads" disabled={!campaignId}>
          Importer des contacts
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la campagne</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Campagne Assurance Q3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description de la campagne..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scriptId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script d&apos;appel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un script" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scripts?.map((script) => (
                        <SelectItem key={script.id} value={script.id.toString()}>
                          {script.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {mutation.isPending ? "Création..." : "Créer la campagne"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="leads">
        {campaignId && (
          <LeadImport 
            campaignId={campaignId} 
            onSuccess={onSuccess} 
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
