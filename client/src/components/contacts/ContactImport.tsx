import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Check, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContactImport({ 
  onSuccess 
}: { 
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [campaignId, setCampaignId] = useState<string>("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errorSamples: string[];
  } | null>(null);

  // Get campaigns list
  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns/list"],
  });

  const validateMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/leads/validate", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors de la validation");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      setValidationResult(data);
    },
    onError: (error) => {
      toast({
        title: "Erreur de validation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !campaignId) {
        throw new Error("Fichier ou campagne manquant");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + 5;
          return next > 90 ? 90 : next;
        });
      }, 200);
      
      try {
        const res = await fetch("/api/leads/import", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        clearInterval(interval);
        setUploadProgress(100);
        
        if (!res.ok) {
          throw new Error("Erreur lors de l'import");
        }
        
        return await res.json();
      } catch (error) {
        clearInterval(interval);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Import réussi",
        description: "Les contacts ont été importés avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      if (onSuccess) {
        onSuccess();
      }
      // Reset the form
      setFile(null);
      setValidationResult(null);
      setUploadProgress(0);
      setCampaignId("");
      setIsOpen(false);
    },
    onError: (error) => {
      setUploadProgress(0);
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      validateMutation.mutate(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file && campaignId) {
      uploadMutation.mutate();
    } else {
      toast({
        title: "Information manquante",
        description: "Veuillez sélectionner un fichier et une campagne",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
      >
        <Upload className="h-4 w-4 mr-1" />
        Importer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer des contacts</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campagne</label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une campagne" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns?.map((campaign: { id: number; name: string }) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fichier CSV de contacts</label>
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                disabled={validateMutation.isPending || uploadMutation.isPending}
              />
              <p className="text-xs text-neutral-dark">
                Format attendu: nom,prénom,téléphone,email
              </p>
            </div>
            
            {validateMutation.isPending && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Validation du fichier...</span>
              </div>
            )}
            
            {validationResult && (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {validationResult.valid ? (
                      <Check className="h-6 w-6 text-[#10B981]" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-[#F59E0B]" />
                    )}
                    <h3 className="text-lg font-medium ml-2">
                      {validationResult.valid 
                        ? "Fichier valide" 
                        : "Fichier partiellement valide"}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de lignes</span>
                      <span className="font-medium">{validationResult.totalRows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lignes valides</span>
                      <span className="font-medium text-[#10B981]">{validationResult.validRows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lignes invalides</span>
                      <span className="font-medium text-[#F59E0B]">{validationResult.invalidRows}</span>
                    </div>
                    
                    {validationResult.invalidRows > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-1">Exemples d'erreurs:</h4>
                        <ul className="text-sm list-disc pl-5 text-neutral-dark">
                          {validationResult.errorSamples.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression de l'import</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploadMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              disabled={!file || !validationResult?.valid || !campaignId || uploadMutation.isPending}
              onClick={handleUpload}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importation...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer les contacts
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}