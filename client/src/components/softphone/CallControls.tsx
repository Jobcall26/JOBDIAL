import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, MicOff, Mic, PhoneOff, Clock, CheckCircle, XCircle, Pause, Play, VolumeX, Volume2, PhoneForwarded, UserPlus } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CallControls({ 
  callDuration, 
  onEndCall,
  onAnswer,
  onHangup,
  onHold,
  onUnhold,
  onTransfer
}: { 
  callDuration: string; 
  onEndCall: (result: string) => void;
  onAnswer: () => void;
  onHangup: () => void;
  onHold: () => void;
  onUnhold: () => void;
  onTransfer: (type:string, number:string) => void;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isHold, setIsHold] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferNumber, setTransferNumber] = useState("");
  const [transferType, setTransferType] = useState("blind");


  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Implement actual mute functionality here
  };

  const handleTransfer = () => {
    onTransfer(transferType, transferNumber);
    setIsTransferDialogOpen(false);
    setTransferNumber("");
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

          <div className="grid grid-cols-3 gap-2 mt-2">
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
              variant="outline"
              onClick={() => {setIsHold(!isHold); onHold();}}
              className={isHold ? "bg-amber-50" : ""}
            >
              {isHold ? (
                <Play className="h-4 w-4 mr-2 text-amber-500" />
              ) : (
                <Pause className="h-4 w-4 mr-2" />
              )}
              {isHold ? "Resume" : "Hold"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsTransferDialogOpen(true)}
            >
              <PhoneForwarded className="h-4 w-4 mr-2" />
              Transfer
            </Button>
          </div>
          <div className="border rounded-md p-3 bg-neutral-50 mb-4 mt-2">
            <div className="text-sm font-medium mb-2">Quick Controls</div>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-neutral-100">
                F2: Quick Note
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-neutral-100">
                F4: Transfer
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-neutral-100">
                F6: Hold
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-neutral-100">
                F8: Hangup
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="outline" onClick={onAnswer}>
              <UserPlus className="h-4 w-4 mr-2" />
              Answer
            </Button>
            <Button variant="destructive" onClick={onHangup}>
              <PhoneOff className="h-4 w-4 mr-2" />
              Raccrocher
            </Button>
          </div>


          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Call</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Transfer Type</Label>
                  <select className="w-full mt-1 p-2 border rounded-md" value={transferType} onChange={(e)=>setTransferType(e.target.value)}>
                    <option value="blind">Blind Transfer</option>
                    <option value="warm">Warm Transfer</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>
                <div>
                  <Label>Transfer To</Label>
                  <Input 
                    type="text" 
                    placeholder="Enter number or extension"
                    value={transferNumber}
                    onChange={(e) => setTransferNumber(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleTransfer}>
                    Transfer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}