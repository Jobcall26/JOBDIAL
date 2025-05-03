import AgentLayout from "@/components/layout/AgentLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Star, ChevronsDown, ChevronsUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function AgentScriptsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Fetch scripts assigned to the agent
  const { data: scripts, isLoading } = useQuery<{
    assigned: {
      id: number;
      name: string;
      campaignName: string;
      lastUsed: string | null;
      isFavorite: boolean;
    }[];
    all: {
      id: number;
      name: string;
      campaignName: string;
      lastUsed: string | null;
      isFavorite: boolean;
    }[];
  }>({
    queryKey: ["/api/agent/scripts/list"],
  });
  
  // Fetch the selected script content
  const { data: scriptContent } = useQuery<{
    id: number;
    name: string;
    content: string;
    sections: {
      title: string;
      content: string;
    }[];
    objections: {
      objection: string;
      response: string;
    }[];
  }>({
    queryKey: ["/api/agent/scripts", { scriptId: selectedScriptId }],
    enabled: !!selectedScriptId,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <AgentLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Script List */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scripts</CardTitle>
              <form onSubmit={handleSearch} className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-dark" />
                  <Input
                    placeholder="Rechercher un script..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="assigned">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="assigned" className="flex-1">Assignés</TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">Tous</TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1">Favoris</TabsTrigger>
                </TabsList>
                
                <TabsContent value="assigned" className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-4 text-neutral-dark">
                      Chargement des scripts...
                    </div>
                  ) : scripts?.assigned && scripts.assigned.length > 0 ? (
                    scripts.assigned.map(script => (
                      <div 
                        key={script.id} 
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-lightest ${selectedScriptId === script.id ? 'bg-primary-lightest border-primary' : ''}`}
                        onClick={() => setSelectedScriptId(script.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{script.name}</div>
                            <div className="text-sm text-neutral-dark">{script.campaignName}</div>
                          </div>
                          {script.isFavorite && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        {script.lastUsed && (
                          <div className="text-xs text-neutral-dark mt-1">
                            Dernier utilisation: {script.lastUsed}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-neutral-dark">
                      Aucun script assigné
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="all" className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-4 text-neutral-dark">
                      Chargement des scripts...
                    </div>
                  ) : scripts?.all && scripts.all.length > 0 ? (
                    scripts.all.map(script => (
                      <div 
                        key={script.id} 
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-lightest ${selectedScriptId === script.id ? 'bg-primary-lightest border-primary' : ''}`}
                        onClick={() => setSelectedScriptId(script.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{script.name}</div>
                            <div className="text-sm text-neutral-dark">{script.campaignName}</div>
                          </div>
                          {script.isFavorite && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-neutral-dark">
                      Aucun script disponible
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="favorites" className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-4 text-neutral-dark">
                      Chargement des scripts...
                    </div>
                  ) : scripts?.all.filter(s => s.isFavorite).length > 0 ? (
                    scripts.all.filter(s => s.isFavorite).map(script => (
                      <div 
                        key={script.id} 
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-lightest ${selectedScriptId === script.id ? 'bg-primary-lightest border-primary' : ''}`}
                        onClick={() => setSelectedScriptId(script.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{script.name}</div>
                            <div className="text-sm text-neutral-dark">{script.campaignName}</div>
                          </div>
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-neutral-dark">
                      Aucun script en favoris
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Middle + Right Columns - Script Content */}
        <div className="lg:col-span-2">
          {selectedScriptId && scriptContent ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2">{scriptContent.name}</Badge>
                    <CardTitle>Guide de conversation</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Star className={`h-4 w-4 mr-1 ${true ? 'text-amber-500 fill-amber-500' : ''}`} />
                      Favoris
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Introduction */}
                <div className="space-y-2">
                  <div className="font-medium text-lg">Introduction</div>
                  <div className="border rounded-lg p-4 bg-neutral-lightest">
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: scriptContent.content }} />
                  </div>
                </div>
                
                {/* Script Sections */}
                {scriptContent.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div 
                      className="font-medium text-lg flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(section.title)}
                    >
                      <span>{section.title}</span>
                      {expandedSection === section.title ? (
                        <ChevronsUp className="h-5 w-5 text-neutral-dark" />
                      ) : (
                        <ChevronsDown className="h-5 w-5 text-neutral-dark" />
                      )}
                    </div>
                    {expandedSection === section.title && (
                      <div className="border rounded-lg p-4 bg-neutral-lightest">
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Objection Handling */}
                <div className="space-y-4">
                  <div className="font-medium text-lg">Réponses aux objections</div>
                  {scriptContent.objections.map((obj, index) => (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base font-medium">
                          <span className="text-primary font-semibold">Objection:</span> {obj.objection}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="prose prose-sm max-w-none">
                          <p><span className="font-semibold">Réponse:</span> {obj.response}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <FileText className="h-12 w-12 text-neutral-light mx-auto mb-4" />
                <CardTitle className="mb-2">Aucun script sélectionné</CardTitle>
                <CardDescription>
                  Sélectionnez un script dans la liste pour afficher son contenu
                </CardDescription>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
