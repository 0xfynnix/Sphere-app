"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCreateReward } from "@/lib/api/hooks";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useSphereContract } from "@/hooks/useSphereContract";
import { getRefData } from "@/lib/api/ref";

interface RewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  ref: string;
  nftObjectId: string;
}

const rewardOptions = [
  { amount: 1, label: "1 SUI", content: "1-120 audiences" },
  { amount: 3, label: "3 SUI", content: "120-360 audiences" },
  { amount: 10, label: "10 SUI", content: "360 - 1200 audiences" },
  { amount: 30, label: "30 SUI", content: "1200 - 3600 audiences" },
];

export function RewardDialog({
  isOpen,
  onClose,
  postId,
  ref,
  nftObjectId,
}: RewardDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [signProgress, setSignProgress] = useState(0);
  const [rewardProgress, setRewardProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<
    "select" | "signing" | "rewarding"
  >("select");

  const account = useCurrentAccount();
  const createReward = useCreateReward();
  const { tipNFT } = useSphereContract();

  const handleTap = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % rewardOptions.length);
    setAnimationKey((prev) => prev + 1);
  };

  const handleReward = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // 如果有 ref，先验证 ref
      let referrer = null;
      if (ref) {
        try {
          const refData = await getRefData(ref);
          // 验证 postId 是否匹配
          if (refData.postId !== postId) {
            toast.error("Invalid reference code");
            return;
          }
          referrer = refData.walletAddress;
        } catch (error) {
          console.error("Failed to validate ref:", error);
          toast.error("Invalid reference code");
          return;
        }
      }

      // 第一步：调用打赏合约
      setCurrentStep("signing");
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

      const result = await tipNFT(
        nftObjectId || "0x0",
        rewardOptions[currentIndex].amount,
        referrer || "0x0"
      );

      clearInterval(signInterval);
      setSignProgress(50);

      // 第二步：创建打赏记录
      setCurrentStep("rewarding");
      setRewardProgress(50);
      const rewardInterval = setInterval(() => {
        setRewardProgress((prev) => {
          if (prev >= 100) {
            clearInterval(rewardInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      await createReward.mutateAsync({
        ref,
        amount: rewardOptions[currentIndex].amount,
        postId,
        digest: result.digest,
      });

      clearInterval(rewardInterval);
      setRewardProgress(100);
      setShowConfetti(true);
      onClose();
      toast.success("Reward sent successfully!");
    } catch (error) {
      console.error("Failed to send reward:", error);
      toast.error("Failed to send reward");
    } finally {
      setSignProgress(0);
      setRewardProgress(0);
      setCurrentStep("select");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reward Creator</DialogTitle>
          <DialogDescription>
            Tap to cycle through reward amounts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="h-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={animationKey}
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: -50 }}
                transition={{
                  type: "spring",
                  stiffness: 1000,
                  damping: 50,
                  mass: 0.5,
                  duration: 0.1,
                }}
                className="text-4xl font-bold text-primary"
              >
                {rewardOptions[currentIndex].label}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            {rewardOptions[currentIndex].content}
          </div>
          <Button
            variant="outline"
            size="lg"
            className="h-20 w-20 rounded-full"
            onClick={handleTap}
            disabled={currentStep !== "select"}
          >
            <Hand className="h-8 w-8" />
          </Button>

          {currentStep === "signing" && (
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Sending reward to contract...
                </span>
                <span className="font-medium">{signProgress}%</span>
              </div>
              <Progress value={signProgress} className="h-2" />
            </div>
          )}

          {currentStep === "rewarding" && (
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Recording reward...
                </span>
                <span className="font-medium">{rewardProgress}%</span>
              </div>
              <Progress value={rewardProgress} className="h-2" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleReward}
            disabled={currentStep !== "select"}
            className="relative overflow-hidden"
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
              {currentStep === "select"
                ? "Confirm Reward"
                : currentStep === "signing"
                  ? "Sending to Contract..."
                  : "Recording Reward..."}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
