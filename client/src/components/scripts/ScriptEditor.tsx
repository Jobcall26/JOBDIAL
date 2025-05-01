import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Defining the schema for the script form
const scriptFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  content: z.string().min(50, "Le script doit contenir au moins 50 caractères"),
});

type ScriptFormData = z.infer<typeof scriptFormSchema>;

export default function ScriptEditor({ 
  scriptId,
  onSuccess
}: { 
  scriptId?: number; 
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("edit");
  
  // Fetch script data if editing an existing script
  const { data: scriptData, isLoading } = useQuery<ScriptFormData>({
    queryKey: ["/api/scripts", scriptId],
    enabled: !!scriptId,
  });
  
  const form = useForm<ScriptFormData>({
    resolver: zodResolver(scriptFormSchema),
    defaultValues: {
      name: scriptData?.name || "",
      content: scriptData?.content || "",
    },
    values: scriptData,
  });
  
  // Watch for content changes to preview
  const contentValue = form.watch("content");
  
  const mutation = useMutation({
    mutationFn: async (data: ScriptFormData) => {
      if (scriptId) {
        // Update existing script
        const res = await apiRequest("PUT", `/api/scripts/${scriptId}`, data);
        return res.json();
      } else {
        // Create new script
        const res = await apiRequest("POST", "/api/scripts", data);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: scriptId ? "Script mis à jour" : "Script créé",
        description: scriptId 
          ? "Le script a été mis à jour avec succès"
          : "Le script a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
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
  
  const onSubmit = (data: ScriptFormData) => {
    mutation.mutate(data);
  };
  
  if (isLoading && scriptId) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Éditer</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du script</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Script Assurance Santé" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu du script</FormLabel>
                    <FormControl>
                      <textarea
                        className="min-h-[300px] w-full p-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Bonjour, je m'appelle [Agent]. Je vous appelle au sujet de..."
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-neutral-dark mt-1">
                      Utilisez [Agent] pour le nom de l&apos;agent, [Client] pour le nom du client, et [Entreprise] pour le nom de l&apos;entreprise.
                    </p>
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
                  {mutation.isPending 
                    ? (scriptId ? "Mise à jour..." : "Création...")
                    : (scriptId ? "Mettre à jour" : "Créer le script")
                  }
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Aperçu du script</h3>
              <div className="bg-neutral-lightest p-4 rounded-lg border border-neutral-light">
                {contentValue ? (
                  <div className="whitespace-pre-wrap">
                    {contentValue
                      .replace(/\[Agent\]/g, "Jean Dupont")
                      .replace(/\[Client\]/g, "Marie Martin")
                      .replace(/\[Entreprise\]/g, "ACME Inc.")}
                  </div>
                ) : (
                  <p className="text-neutral-dark italic">
                    Le contenu du script s&apos;affichera ici...
                  </p>
                )}
              </div>
              <p className="text-xs text-neutral-dark mt-4">
                Ceci est un aperçu. Le script réel utilisera les vraies informations du contact et de l&apos;agent.
              </p>
              
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("edit")}
                >
                  Retour à l&apos;édition
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
