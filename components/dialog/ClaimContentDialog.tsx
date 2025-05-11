import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useSphereContract } from "@/hooks/useSphereContract";
import { bidsApi } from "@/lib/api/bids";

interface ClaimContentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  auctionId: string;
  trigger?: React.ReactNode;
}

export function ClaimContentDialog({
  isOpen,
  onOpenChange,
  postId,
  auctionId,
  trigger,
}: ClaimContentDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimProgress, setClaimProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'initial' | 'claiming'>('initial');
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { claimNFT } = useSphereContract();

  // 当弹窗打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(false);
      setClaimProgress(0);
      setCurrentStep('initial');
    }
  }, [isOpen]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleClaim = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setCurrentStep('claiming');
      setClaimProgress(0);

      // First phase: Call contract
      const contractProgressInterval = setInterval(() => {
        setClaimProgress((prev) => {
          if (prev >= 50) {
            clearInterval(contractProgressInterval);
            return 50;
          }
          return prev + 2;
        });
      }, 100);

      // Call contract's claimNFT function
      const result = await claimNFT(auctionId);
      
      // Wait for transaction confirmation
      await client.waitForTransaction({
        digest: result.digest,
        options: {
          showEvents: true,
          showEffects: true,
          showObjectChanges: true,
        },
      });

      clearInterval(contractProgressInterval);
      setClaimProgress(50);

      // Second phase: Update database status
      const dbProgressInterval = setInterval(() => {
        setClaimProgress((prev) => {
          if (prev >= 100) {
            clearInterval(dbProgressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      // Call API to update status with transaction digest
      await bidsApi.claimAuction(postId, result.digest);

      clearInterval(dbProgressInterval);
      setClaimProgress(100);
      setShowConfetti(true);
      onOpenChange(false);
      toast.success("Content claimed successfully!");
    } catch (error) {
      console.error("Failed to claim content:", error);
      toast.error("Failed to claim content");
    } finally {
      setClaimProgress(0);
      setCurrentStep('initial');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Claim Content
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-center text-muted-foreground">
              You have successfully won the auction. You can now claim this content.
            </p>
          </div>

          {currentStep === 'claiming' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {claimProgress <= 50 ? 'Calling contract...' : 'Updating status...'}
                </span>
                <span className="font-medium">{claimProgress}%</span>
              </div>
              <Progress value={claimProgress} className="h-2" />
            </div>
          )}

          <Button 
            className="w-full relative overflow-hidden" 
            onClick={handleClaim}
            disabled={currentStep !== 'initial'}
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
              {currentStep === 'initial' ? 'Claim Content' : 'Claiming...'}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 