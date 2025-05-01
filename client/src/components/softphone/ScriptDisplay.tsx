import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Contact = {
  name: string;
  phone: string;
  email?: string;
  company?: string;
};

type Script = {
  id: number;
  name: string;
  content: string;
};

type CallNote = {
  text: string;
  timestamp: string;
};

export default function ScriptDisplay({ 
  script, 
  contact, 
  user,
  notes = []
}: { 
  script?: Script;
  contact?: Contact;
  user?: User | null;
  notes?: CallNote[];
}) {
  if (!script || !contact) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-neutral-dark">
          Chargement du script...
        </CardContent>
      </Card>
    );
  }

  // Replace placeholders in script text
  const formatScript = (text: string) => {
    return text
      .replace(/\[Agent\]/g, user?.username || "Agent")
      .replace(/\[Client\]/g, contact.name || "Client")
      .replace(/\[Entreprise\]/g, contact.company || "l'entreprise");
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg font-semibold">{script.name}</CardTitle>
      </CardHeader>
      <Tabs defaultValue="script">
        <CardContent className="p-0">
          <TabsList className="w-full justify-start rounded-none border-b p-0">
            <TabsTrigger 
              value="script" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Script
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Historique
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="script" className="p-4">
            <div className="bg-neutral-lightest p-4 rounded-lg border border-neutral-light text-base leading-6 whitespace-pre-wrap">
              {formatScript(script.content)}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="p-4">
            <textarea
              className="w-full p-3 border border-input rounded-md min-h-[200px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Saisissez vos notes pendant l'appel ici..."
            />
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Notes précédentes</h4>
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note, i) => (
                    <div key={i} className="border-l-2 border-neutral-light pl-3">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-neutral-dark mt-1">{note.timestamp}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-dark italic">
                  Aucune note précédente pour ce contact.
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="p-4">
            <div className="text-sm text-neutral-dark italic">
              L&apos;historique des interactions avec ce contact apparaîtra ici.
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
