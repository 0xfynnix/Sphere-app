import { Button } from "@/components/ui/button";
import { AuctionConfigDialog } from "@/components/dialog/AuctionConfigDialog";
import { FlowDialog, Step } from "@/components/dialog/FlowDialog";
import { useSphereContract } from "@/hooks/useSphereContract";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdatePostAuction } from "@/lib/api/hooks";

interface StartAuctionButtonProps {
  nftObjectId: string;
  postId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function StartAuctionButton({
  nftObjectId,
  postId,
  onSuccess,
  trigger,
}: StartAuctionButtonProps) {
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [showAuctionFlow, setShowAuctionFlow] = useState(false);
  const [auctionConfig, setAuctionConfig] = useState<{ 
    durationHours: number; 
    durationMinutes: number; 
    startPrice: number; 
  } | null>(null);
  
  const { createAuction } = useSphereContract();
  const updatePostAuction = useUpdatePostAuction();

  const handleStartAuction = () => {
    setShowAuctionDialog(true);
  };

  const handleAuctionConfig = async (config: { 
    durationHours: number; 
    durationMinutes: number; 
    startPrice: number; 
  }) => {
    setAuctionConfig(config);
    setShowAuctionDialog(false);
    setShowAuctionFlow(true);
  };

  const auctionSteps: Step[] = [
    {
      title: "Create Auction",
      description: "Creating auction on blockchain...",
      action: async () => {
        if (!nftObjectId) {
          throw new Error("NFT object ID not found");
        }

        if (!auctionConfig) {
          throw new Error("Auction configuration not found");
        }

        // 计算拍卖持续时间（毫秒）
        const duration = (auctionConfig.durationHours * 60 * 60 + auctionConfig.durationMinutes * 60) * 1000;

        const result = await createAuction(
          nftObjectId,
          auctionConfig.startPrice,
          duration
        );

        return {
          digest: result.digest,
          startPrice: auctionConfig.startPrice,
          durationHours: auctionConfig.durationHours,
          durationMinutes: auctionConfig.durationMinutes,
        };
      },
    },
    {
      title: "Update Post",
      description: "Updating post auction status...",
      action: async (data) => {
        const { digest, startPrice, durationHours, durationMinutes } = data as {
          digest: string;
          startPrice: number;
          durationHours: number;
          durationMinutes: number;
        };


        const result = await updatePostAuction.mutateAsync({
          postId,
          auctionInfo: {
            startPrice,
            auctionDigest: digest,
            durationHours,
            durationMinutes,
          },
        });

        return result;
      },
    },
  ];

  return (
    <>
      {trigger ? (
        <div onClick={handleStartAuction}>{trigger}</div>
      ) : (
        <Button onClick={handleStartAuction}>
          Start Auction
        </Button>
      )}

      <AuctionConfigDialog
        isOpen={showAuctionDialog}
        onClose={() => setShowAuctionDialog(false)}
        onConfirm={handleAuctionConfig}
      />

      <FlowDialog
        open={showAuctionFlow}
        onClose={() => setShowAuctionFlow(false)}
        steps={auctionSteps}
        onSuccess={() => {
          toast.success("Auction started successfully!");
          setShowAuctionFlow(false);
          onSuccess?.();
        }}
        onError={(error) => {
          toast.error(error.message);
          setShowAuctionFlow(false);
        }}
      />
    </>
  );
} 