import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, MicOff, Mic, PhoneOff, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function CallControls({ 
  callDuration, 
  onEndCall 
}: { 
  callDuration: string; 
  onEndCall: (result: string) => void;
}) {
  const [isMuted, setIsMuted] = useState(false);
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Implement actual mute functionality here
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-neutral-dark">
            <Clock className="h-4 w-4 mr-1" />
            <span>{callDuration}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Transférer l&apos;appel</DropdownMenuItem>
              <DropdownMenuItem>Mettre en attente</DropdownMenuItem>
              <DropdownMenuItem>Ajouter une note</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => onEndCall("refusal")}
              className="flex flex-col items-center py-3 text-[#EF4444]"
            >
              <XCircle className="h-6 w-6 mb-1" />
              <span className="text-xs">Refusé</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onEndCall("interested")}
              className="flex flex-col items-center py-3 text-[#10B981]"
            >
              <CheckCircle className="h-6 w-6 mb-1" />
              <span className="text-xs">Intéressé</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onEndCall("callback")}
              className="flex flex-col items-center py-3 text-[#F59E0B]"
            >
              <Clock className="h-6 w-6 mb-1" />
              <span className="text-xs">Rappel</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              variant="outline"
              onClick={handleToggleMute}
              className={isMuted ? "text-[#F59E0B]" : ""}
            >
              {isMuted ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Mute
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => onEndCall("absent")}
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Raccrocher
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
