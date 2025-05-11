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
import { useClaimReward, useClaimBid } from "@/lib/api/hooks";

interface ClaimRewardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'recipient' | 'referrer' | 'creator' | 'referrer_bid';
  trigger?: React.ReactNode;
  creatorTipPoolId?: string;
  referenceTipPoolId?: string;
  auctionId?: string;
}

export function ClaimRewardDialog({
  isOpen,
  onOpenChange,
  type,
  trigger,
  creatorTipPoolId,
  referenceTipPoolId,
  auctionId,
}: ClaimRewardDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimProgress, setClaimProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'confirm' | 'claiming'>('confirm');
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { claimCreatorTip, claimReferenceTip, claimReward } = useSphereContract();
  const claimRewardApi = useClaimReward();
  const claimBidApi = useClaimBid();

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

      let result;
      // 根据不同类型调用不同的合约方法
      switch (type) {
        case 'recipient':
          if (!creatorTipPoolId) throw new Error('Creator tip pool ID is required');
          result = await claimCreatorTip(creatorTipPoolId);
          break;
        case 'referrer':
          if (!referenceTipPoolId) throw new Error('Reference tip pool ID is required');
          result = await claimReferenceTip(referenceTipPoolId);
          break;
        case 'creator':
        case 'referrer_bid':
          if (!auctionId) throw new Error('Auction ID is required');
          result = await claimReward(auctionId);
          break;
        default:
          throw new Error('Invalid claim type');
      }

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

      // 根据不同类型调用不同的 API
      if (type === 'recipient' || type === 'referrer') {
        await claimRewardApi.mutateAsync({ type, digest: result.digest });
      } else {
        await claimBidApi.mutateAsync({ type: type === 'creator' ? 'creator' : 'referrer', digest: result.digest });
      }

      clearInterval(apiProgressInterval);
      setClaimProgress(100);
      setShowConfetti(true);
      onOpenChange(false);
      toast.success("Reward claimed successfully!");
    } catch (error) {
      console.error("Failed to claim reward:", error);
      toast.error("Failed to claim reward");
    } finally {
      setClaimProgress(0);
      setCurrentStep('confirm');
    }
  };

  const getDialogTitle = () => {
    switch (type) {
      case 'recipient':
        return "Claim Creator Reward";
      case 'referrer':
        return "Claim Referrer Reward";
      case 'creator':
        return "Claim Creator Bid Reward";
      case 'referrer_bid':
        return "Claim Referrer Bid Reward";
      default:
        return "Claim Reward";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {currentStep === 'confirm' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You are about to claim your rewards. This action will process all your unclaimed rewards at once.
              </p>
              <Button 
                className="w-full relative overflow-hidden" 
                onClick={handleClaim}
              >
                Claim Rewards
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