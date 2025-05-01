import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  timezone: z.string(),
  dateFormat: z.string(),
  language: z.string(),
});

const voipSettingsSchema = z.object({
  twilioAccountSid: z.string().min(1, "Le SID du compte Twilio est requis"),
  twilioAuthToken: z.string().min(1, "Le token d'authentification Twilio est requis"),
  twilioPhoneNumber: z.string().min(1, "Le numéro de téléphone Twilio est requis"),
  useWebRTC: z.boolean().optional(),
  outboundPrefix: z.string().optional(),
  recordCalls: z.boolean().optional(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  desktopNotifications: z.boolean().optional(),
  emailAddress: z.string().email("Email invalide").optional(),
  notifyOnQueueThreshold: z.boolean().optional(),
  queueThreshold: z.coerce.number().int().min(1).optional(),
  notifyOnAgentInactive: z.boolean().optional(),
  inactivityThreshold: z.coerce.number().int().min(1).optional(),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
type VoipSettingsFormData = z.infer<typeof voipSettingsSchema>;
type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accès restreint</CardTitle>
              <CardDescription>
                Vous n&apos;avez pas les permissions nécessaires pour accéder aux paramètres.
                Seuls les administrateurs peuvent modifier les paramètres du système.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.history.back()}>Retour</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Paramètres"
        description="Configuration de l'application JOBDIAL"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="voip">Téléphonie</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="voip">
          <VoipSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function GeneralSettings() {
  const { toast } = useToast();
  
  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      companyName: "JOBDIAL",
      timezone: "Europe/Paris",
      dateFormat: "DD/MM/YYYY",
      language: "fr",
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: GeneralSettingsFormData) => {
      const res = await apiRequest("PUT", "/api/settings/general", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres généraux ont été enregistrés avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: GeneralSettingsFormData) => {
    mutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres généraux</CardTitle>
        <CardDescription>
          Configurez les informations de base de votre application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;entreprise</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Ce nom sera affiché dans l&apos;application et les emails.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuseau horaire</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fuseau horaire" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (UTC+1/+2)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (UTC+0/+1)</SelectItem>
                      <SelectItem value="America/New_York">America/New York (UTC-5/-4)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los Angeles (UTC-8/-7)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Fuseau horaire utilisé pour les dates et heures.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format de date</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un format de date" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Format utilisé pour l&apos;affichage des dates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Langue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Langue par défaut de l&apos;application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function VoipSettings() {
  const { toast } = useToast();
  
  const form = useForm<VoipSettingsFormData>({
    resolver: zodResolver(voipSettingsSchema),
    defaultValues: {
      twilioAccountSid: "",
      twilioAuthToken: "",
      twilioPhoneNumber: "",
      useWebRTC: true,
      outboundPrefix: "",
      recordCalls: false,
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: VoipSettingsFormData) => {
      const res = await apiRequest("PUT", "/api/settings/voip", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres de téléphonie ont été enregistrés avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: VoipSettingsFormData) => {
    mutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de téléphonie</CardTitle>
        <CardDescription>
          Configurez les options pour les appels VoIP via Twilio ou WebRTC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="useWebRTC"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Utiliser WebRTC</FormLabel>
                    <FormDescription>
                      Utiliser WebRTC au lieu de Twilio pour les appels (moins cher mais moins fiable)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">Configuration Twilio</h3>
              
              <FormField
                control={form.control}
                name="twilioAccountSid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twilio Account SID</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="twilioAuthToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twilio Auth Token</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="twilioPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone Twilio</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+33123456789" />
                    </FormControl>
                    <FormDescription>
                      Le numéro de téléphone qui sera affiché pour les appelés
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">Options avancées</h3>
              
              <FormField
                control={form.control}
                name="outboundPrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Préfixe pour les appels sortants</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="9" />
                    </FormControl>
                    <FormDescription>
                      Préfixe à composer avant le numéro (si nécessaire)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recordCalls"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Enregistrer les appels
                      </FormLabel>
                      <FormDescription>
                        Activer l&apos;enregistrement des appels via Twilio
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const { toast } = useToast();
  
  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: false,
      desktopNotifications: true,
      emailAddress: "",
      notifyOnQueueThreshold: true,
      queueThreshold: 5,
      notifyOnAgentInactive: true,
      inactivityThreshold: 15,
    },
  });
  
  const emailNotifications = form.watch("emailNotifications");
  const notifyOnQueueThreshold = form.watch("notifyOnQueueThreshold");
  const notifyOnAgentInactive = form.watch("notifyOnAgentInactive");
  
  const mutation = useMutation({
    mutationFn: async (data: NotificationSettingsFormData) => {
      const res = await apiRequest("PUT", "/api/settings/notifications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres de notification ont été enregistrés avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: NotificationSettingsFormData) => {
    mutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de notification</CardTitle>
        <CardDescription>
          Configurez comment et quand vous souhaitez être notifié
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="desktopNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Notifications de bureau
                      </FormLabel>
                      <FormDescription>
                        Recevoir des notifications dans le navigateur
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Notifications par email
                      </FormLabel>
                      <FormDescription>
                        Recevoir des notifications par email
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {emailNotifications && (
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem className="ml-7">
                      <FormLabel>Adresse email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="admin@exemple.fr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Alertes</h3>
              
              <FormField
                control={form.control}
                name="notifyOnQueueThreshold"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        File d&apos;attente trop longue
                      </FormLabel>
                      <FormDescription>
                        Recevoir une alerte lorsque la file d&apos;attente dépasse un seuil
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {notifyOnQueueThreshold && (
                <FormField
                  control={form.control}
                  name="queueThreshold"
                  render={({ field }) => (
                    <FormItem className="ml-7">
                      <FormLabel>Seuil d&apos;alerte</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormDescription>
                        Nombre d&apos;appels en attente qui déclenche l&apos;alerte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="notifyOnAgentInactive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Agent inactif
                      </FormLabel>
                      <FormDescription>
                        Recevoir une alerte lorsqu&apos;un agent est inactif pendant trop longtemps
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {notifyOnAgentInactive && (
                <FormField
                  control={form.control}
                  name="inactivityThreshold"
                  render={({ field }) => (
                    <FormItem className="ml-7">
                      <FormLabel>Seuil d&apos;inactivité (minutes)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormDescription>
                        Durée d&apos;inactivité qui déclenche l&apos;alerte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
