import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AuctionConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: { 
    durationHours: number; 
    durationMinutes: number; 
    startPrice: number; 
  }) => void;
}

export function AuctionConfigDialog({
  isOpen,
  onClose,
  onConfirm,
}: AuctionConfigDialogProps) {
  const [durationHours, setDurationHours] = useState<string>("24");
  const [durationMinutes, setDurationMinutes] = useState<string>("0");
  const [startPrice, setStartPrice] = useState<string>("0.1");

  const handleConfirm = () => {
    onConfirm({
      durationHours: parseInt(durationHours) || 0,
      durationMinutes: parseInt(durationMinutes) || 0,
      startPrice: parseFloat(startPrice),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Auction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-0.5">Auction Duration (max 30 days)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="720"
                    value={durationHours}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 720)) {
                        setDurationHours(value);
                      }
                    }}
                    placeholder="Hours"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={durationMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        setDurationMinutes(value);
                      }
                    }}
                    placeholder="Minutes"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {durationHours === "" ? "0" : durationHours} hours {durationMinutes === "" ? "0" : durationMinutes} minutes
            </p>
          </div>

          <div>
            <Label htmlFor="startPrice">Start Price (SUI)</Label>
            <Input
              id="startPrice"
              type="number"
              min="0.1"
              step="0.1"
              value={startPrice}
              onChange={(e) => setStartPrice(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Start Auction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 