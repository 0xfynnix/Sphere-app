import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Trophy, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { useCreateBid } from "@/lib/api/hooks";

interface Bid {
  id: string;
  amount: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface BidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  startPrice: number;
  currentBids: Bid[];
  postId: string;
  currentHighestBid?: number | null;
  trigger?: React.ReactNode;
}

export function BidDialog({
  isOpen,
  onOpenChange,
  startPrice,
  currentBids,
  postId,
  currentHighestBid,
  trigger,
}: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [signProgress, setSignProgress] = useState(0);
  const [bidProgress, setBidProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'input' | 'signing' | 'bidding'>('input');
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const createBid = useCreateBid();

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleBid = async () => {
    if (!bidAmount) {
      toast.error("Please enter a bid amount");
      return;
    }
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }
    const amount = parseFloat(bidAmount);
    const minimumBid = currentHighestBid || currentBids[0]?.amount || startPrice || 0;
    if (amount <= minimumBid) {
      toast.error("Bid amount must be higher than current highest bid");
      return;
    }

    try {
      // 第一步：获取签名
      setCurrentStep('signing');
      setSignProgress(0);
      const signInterval = setInterval(() => {
        setSignProgress((prev) => {
          if (prev >= 50) {
            clearInterval(signInterval);
            return 50;
          }
          return prev + 5;
        });
      }, 100);

      const { signature } = await signPersonalMessage({
        message: new TextEncoder().encode(`Bid on post: ${amount} SUI`),
      });

      clearInterval(signInterval);
      setSignProgress(50);

      // 第二步：创建竞拍
      setCurrentStep('bidding');
      setBidProgress(50);
      const bidInterval = setInterval(() => {
        setBidProgress((prev) => {
          if (prev >= 100) {
            clearInterval(bidInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      await createBid.mutateAsync({
        postId,
        amount,
        signature,
      });

      clearInterval(bidInterval);
      setBidProgress(100);
      setBidAmount("");
      setShowConfetti(true);
      onOpenChange(false);
      toast.success("Bid placed successfully!");
    } catch (error) {
      console.error("Failed to place bid:", error);
      toast.error("Failed to place bid");
    } finally {
      setSignProgress(0);
      setBidProgress(0);
      setCurrentStep('input');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Place a Bid
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-muted-foreground">Current Highest Bid</Label>
              <Coins className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold flex items-center gap-2">
              {currentBids[0]?.amount || startPrice} SUI
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </p>
          </div>

          {currentStep === 'input' && (
            <div className="space-y-2">
              <Label htmlFor="bidAmount" className="flex items-center gap-2">
                Your Bid (SUI)
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </Label>
              <Input
                id="bidAmount"
                type="number"
                min={currentBids[0]?.amount || startPrice}
                step="0.1"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {currentStep === 'signing' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signing with wallet...</span>
                <span className="font-medium">{signProgress}%</span>
              </div>
              <Progress value={signProgress} className="h-2" />
            </div>
          )}

          {currentStep === 'bidding' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Creating bid...</span>
                <span className="font-medium">{bidProgress}%</span>
              </div>
              <Progress value={bidProgress} className="h-2" />
            </div>
          )}

          <Button 
            className="w-full relative overflow-hidden" 
            onClick={handleBid}
            disabled={currentStep !== 'input'}
          >
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className={showConfetti ? "invisible" : ""}>
              {currentStep === 'input' ? 'Place Bid' : 
               currentStep === 'signing' ? 'Signing...' : 
               'Creating Bid...'}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 