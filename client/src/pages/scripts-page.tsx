import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Calendar,
  FileText,
  Copy,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ScriptEditor from "@/components/scripts/ScriptEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type Script = {
  id: number;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  campaignsCount: number;
  wordCount: number;
};

export default function ScriptsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch scripts with pagination and search
  const { data } = useQuery<{
    scripts: Script[];
    total: number;
    limit: number;
  }>({
    queryKey: ["/api/scripts", { page, search: searchQuery }],
  });

  const scripts = data?.scripts || [];
  const totalScripts = data?.total || 0;
  const pageSize = data?.limit || 10;
  const totalPages = Math.ceil(totalScripts / pageSize);

  const deleteScriptMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      await apiRequest("DELETE", `/api/scripts/${scriptId}`);
    },
    onSuccess: () => {
      toast({
        title: "Script supprimé",
        description: "Le script a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleAddScript = () => {
    setSelectedScriptId(null);
    setIsEditorOpen(true);
  };

  const handleEditScript = (scriptId: number) => {
    setSelectedScriptId(scriptId);
    setIsEditorOpen(true);
  };

  const handlePreviewScript = (script: Script) => {
    setSelectedScript(script);
    setIsPreviewOpen(true);
  };

  const handleDeleteClick = (scriptId: number) => {
    setSelectedScriptId(scriptId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedScriptId) {
      deleteScriptMutation.mutate(selectedScriptId);
    }
  };

  const duplicateScript = async (scriptId: number) => {
    try {
      await apiRequest("POST", `/api/scripts/${scriptId}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Script dupliqué",
        description: "Le script a été dupliqué avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le script",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Scripts d'appel"
        description="Gérez les scripts utilisés lors des appels"
        action={
          isAdmin
            ? {
                label: "Nouveau script",
                onClick: handleAddScript,
                icon: <PlusCircle className="h-4 w-4" />,
              }
            : undefined
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Liste des scripts</CardTitle>
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
              <Input
                placeholder="Rechercher un script..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:w-64"
              />
              <Button type="submit" variant="ghost" className="ml-2">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-light">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Dernière modification
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Campagnes
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {scripts.length > 0 ? (
                  scripts.map((script) => (
                    <tr key={script.id} className="hover:bg-neutral-lightest">
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-neutral-dark mr-2" />
                          <div className="font-medium">{script.name}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-neutral-dark">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(script.updatedAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                        {script.campaignsCount}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        {script.wordCount} mots
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreviewScript(script)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Aperçu
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditScript(script.id)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateScript(script.id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(script.id)}
                                  className="text-[#EF4444]"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-neutral-dark">
                      Aucun script trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalScripts}
              itemsPerPage={pageSize}
              itemName="scripts"
            />
          </div>
        </CardContent>
      </Card>

      {/* Script Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedScriptId ? "Modifier le script" : "Créer un script"}
            </DialogTitle>
          </DialogHeader>
          <ScriptEditor
            scriptId={selectedScriptId || undefined}
            onSuccess={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Script Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Aperçu du script</DialogTitle>
          </DialogHeader>
          <div className="mt-4 bg-neutral-lightest p-4 rounded-lg border border-neutral-light">
            <h3 className="font-medium text-lg mb-4">{selectedScript?.name}</h3>
            <div className="whitespace-pre-wrap">
              {selectedScript?.content
                .replace(/\[Agent\]/g, "Jean Dupont")
                .replace(/\[Client\]/g, "Marie Martin")
                .replace(/\[Entreprise\]/g, "ACME Inc.")}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Fermer
            </Button>
            {isAdmin && selectedScript && (
              <Button onClick={() => {
                setIsPreviewOpen(false);
                handleEditScript(selectedScript.id);
              }}>
                Modifier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce script ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteScriptMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteScriptMutation.isPending}
            >
              {deleteScriptMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
