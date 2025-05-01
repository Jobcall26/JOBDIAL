import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Check, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function LeadImport({ 
  campaignId, 
  onSuccess 
}: { 
  campaignId: number;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errorSamples: string[];
  } | null>(null);

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
        throw new Error("Erreur lors de la validation du fichier");
      }
      
      return res.json();
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
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId.toString());
      
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
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      if (onSuccess) {
        onSuccess();
      }
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
      setValidationResult(null);
      setUploadProgress(0);
      
      // Auto-validate on file selection
      validateMutation.mutate(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file && validationResult?.valid) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-4">
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
                <span>Total de lignes:</span>
                <span className="font-medium">{validationResult.totalRows}</span>
              </div>
              <div className="flex justify-between">
                <span>Lignes valides:</span>
                <span className="font-medium text-[#10B981]">{validationResult.validRows}</span>
              </div>
              {validationResult.invalidRows > 0 && (
                <div className="flex justify-between">
                  <span>Lignes invalides:</span>
                  <span className="font-medium text-[#EF4444]">{validationResult.invalidRows}</span>
                </div>
              )}
            </div>
            
            {validationResult.invalidRows > 0 && validationResult.errorSamples.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Exemples d&apos;erreurs:</h4>
                <ul className="text-xs text-neutral-dark space-y-1">
                  {validationResult.errorSamples.map((error, i) => (
                    <li key={i} className="ml-4 list-disc">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {uploadMutation.isPending && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression de l&apos;import</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={onSuccess}
        >
          Annuler
        </Button>
        <Button
          disabled={!file || !validationResult?.valid || uploadMutation.isPending}
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
      </div>
    </div>
  );
}
