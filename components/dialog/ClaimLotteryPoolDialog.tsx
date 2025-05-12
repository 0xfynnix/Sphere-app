import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Coins } from "lucide-react";
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
import { useClaimLotteryPool } from "@/lib/api/hooks";

interface ClaimLotteryPoolDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  lotteryPools: Array<{
    id: string;
    postId: string;
    amount: number;
    post?: {
      title: string;
    };
    round: number;
  }>;
}

export function ClaimLotteryPoolDialog({
  isOpen,
  onOpenChange,
  trigger,
  lotteryPools,
}: ClaimLotteryPoolDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimProgress, setClaimProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'confirm' | 'claiming'>('confirm');
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { claimPrize } = useSphereContract();
  const claimLotteryPoolMutation = useClaimLotteryPool();

  // 当弹窗打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(false);
      setClaimProgress(0);
      setCurrentStep('confirm');
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

      // 第一阶段：调用合约
      const contractProgressInterval = setInterval(() => {
        setClaimProgress((prev) => {
          if (prev >= 50) {
            clearInterval(contractProgressInterval);
            return 50;
          }
          return prev + 2;
        });
      }, 100);

      // 调用合约领取奖励
      const result = await claimPrize();

      // 等待交易确认
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

      // 第二阶段：调用后端 API
      const apiProgressInterval = setInterval(() => {
        setClaimProgress((prev) => {
          if (prev >= 100) {
            clearInterval(apiProgressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      // 为每个奖池调用后端 API
      await Promise.all(
        lotteryPools.map(pool => 
          claimLotteryPoolMutation.mutateAsync({
            postId: pool.postId,
            digest: result.digest
          })
        )
      );

      clearInterval(apiProgressInterval);
      setClaimProgress(100);
      setShowConfetti(true);
      onOpenChange(false);
      toast.success("Lottery pool rewards claimed successfully!");
    } catch (error) {
      console.error("Failed to claim lottery pool rewards:", error);
      toast.error("Failed to claim lottery pool rewards");
    } finally {
      setClaimProgress(0);
      setCurrentStep('confirm');
    }
  };

  const totalAmount = lotteryPools.reduce((sum, pool) => sum + pool.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Claim Lottery Pool Rewards
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {currentStep === 'confirm' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  You are about to claim rewards from {lotteryPools.length} lottery pool{lotteryPools.length > 1 ? 's' : ''}.
                </p>
                <p className="font-medium">
                  Total amount: {totalAmount} SUI
                </p>
              </div>
              <div className="space-y-2">
                {lotteryPools.map((pool) => (
                  <div key={pool.id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span className="text-sm">{pool.post?.title || 'Untitled'} (Round {pool.round})</span>
                    <span className="font-medium">{pool.amount} SUI</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full relative overflow-hidden" 
                onClick={handleClaim}
              >
                Claim All Rewards
              </Button>
            </div>
          )}

          {currentStep === 'claiming' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {claimProgress <= 50 ? 'Calling contract...' : 'Updating records...'}
                </span>
                <span className="font-medium">{claimProgress}%</span>
              </div>
              <Progress value={claimProgress} className="h-2" />
            </div>
          )}

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
        </div>
      </DialogContent>
    </Dialog>
  );
} 
