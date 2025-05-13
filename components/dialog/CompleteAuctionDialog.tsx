import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Trophy, CheckCircle, XCircle, User, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useCompleteAuction } from "@/lib/api/hooks";
import { useSphereContract } from "@/hooks/useSphereContract";

interface CompleteAuctionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  auctionId: string;
  auctionCapId: string;
  trigger?: React.ReactNode;
  currentHighestBid?: number;
}

export function CompleteAuctionDialog({
  isOpen,
  onOpenChange,
  postId,
  auctionId,
  auctionCapId,
  trigger,
  currentHighestBid,
}: CompleteAuctionDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [completeProgress, setCompleteProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'confirm' | 'completing' | 'success' | 'failed'>('confirm');
  const account = useCurrentAccount();
  const client = useSuiClient();
  const completeAuction = useCompleteAuction();
  const { endAuction } = useSphereContract();

  // 当弹窗打开时重置状态
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowConfetti(false);
      setCompleteProgress(0);
      setCurrentStep('confirm');
    }
    onOpenChange(open);
  };

  const handleComplete = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setCurrentStep('completing');
      setCompleteProgress(0);

      // 第一阶段：调用合约
      const contractProgressInterval = setInterval(() => {
        setCompleteProgress((prev) => {
          if (prev >= 50) {
            clearInterval(contractProgressInterval);
            return 50;
          }
          return prev + 2;
        });
      }, 100);

      // 调用合约的 endAuction 函数
      const result = await endAuction(auctionId, auctionCapId);
      
      // 等待交易上链
      const txResult = await client.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      // 从交易事件中获取winner地址
      let lotteryPoolWinnerAddress = undefined;
      const events = txResult.events || [];
      for (const event of events) {
        if (event.type.includes('::copyright_nft::AuctionEnded')) {
          const parsedJson = event.parsedJson as any;
          if (parsedJson.winner) {
            lotteryPoolWinnerAddress = parsedJson.winner;
            break;
          }
        }
      }
      
      clearInterval(contractProgressInterval);
      setCompleteProgress(50);

      // 第二阶段：调用后端接口
      const apiProgressInterval = setInterval(() => {
        setCompleteProgress((prev) => {
          if (prev >= 100) {
            clearInterval(apiProgressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      // 调用后端接口完成竞拍，传入交易 digest 和 winner 地址
      await completeAuction.mutateAsync({
        postId,
        digest: result.digest,
        lotteryPoolWinnerAddress,
      });

      clearInterval(apiProgressInterval);
      setCompleteProgress(100);
      toast.success("Auction completed successfully!");
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to complete auction:", error);
      setCurrentStep('failed');
      toast.error("Failed to complete auction");
    } finally {
      setCompleteProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Complete Auction
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {currentStep === 'confirm' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to complete this auction?
              </p>
              {currentHighestBid ? (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Highest Bid: {currentHighestBid} SUI</span>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">No Bids Received</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    You can start a new auction after completing this one.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'completing' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completeProgress <= 50 ? 'Calling contract...' : 'Processing auction...'}
                  </span>
                  <span className="font-medium">{completeProgress}%</span>
                </div>
                <Progress value={completeProgress} className="h-2" />
              </div>

              {currentHighestBid ? (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Highest Bid: {currentHighestBid} SUI</span>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">No Bids Received</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    You can start a new auction after completing this one.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-full bg-green-100 p-3"
                >
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </motion.div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Auction Completed Successfully!</h3>
                {currentHighestBid ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Final Price: {currentHighestBid} SUI
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No bids were received</p>
                    <p className="text-sm text-muted-foreground">
                      You can now start a new auction if you wish.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'failed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-full bg-red-100 p-3"
                >
                  <XCircle className="h-8 w-8 text-red-500" />
                </motion.div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Failed to Complete Auction</h3>
                <p className="text-muted-foreground">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
              {currentHighestBid ? (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Highest Bid: {currentHighestBid} SUI</span>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">No Bids Received</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    You can start a new auction after completing this one.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            className="w-full relative overflow-hidden" 
            onClick={handleComplete}
            disabled={currentStep === 'completing'}
          >
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <CheckCircle className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className={showConfetti ? "invisible" : ""}>
              {currentStep === 'confirm' ? 'Complete Auction' : 
               currentStep === 'completing' ? 'Completing Auction...' :
               currentStep === 'success' ? 'Close' :
               'Retry'}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 