import { Button } from "@/components/ui/button";
import { AuctionConfigDialog } from "@/components/dialog/AuctionConfigDialog";
import { FlowDialog, Step } from "@/components/dialog/FlowDialog";
import { useSphereContract } from "@/hooks/useSphereContract";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdatePostAuction } from "@/lib/api/hooks";
import { useSuiClient } from "@mysten/dapp-kit";

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
  const client = useSuiClient();

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

        // 等待交易确认
        const txResponse = await client.waitForTransaction({
          digest: result.digest,
          options: {
            showEvents: true,
            showEffects: true,
          },
        });

        // 查找 AuctionCreated 事件
        const auctionCreatedEvent = txResponse.events?.find((event) =>
          event.type.includes("::copyright_nft::AuctionCreated")
        );

        if (!auctionCreatedEvent) {
          throw new Error("Failed to find AuctionCreated event");
        }

        const auctionId = (auctionCreatedEvent.parsedJson as { auction_id: string })
          ?.auction_id;
        if (!auctionId) {
          throw new Error("Failed to get auction ID from event");
        }

        return {
          digest: result.digest,
          auctionId,
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
        const { digest, auctionId, startPrice, durationHours, durationMinutes } = data as {
          digest: string;
          auctionId: string;
          startPrice: number;
          durationHours: number;
          durationMinutes: number;
        };

        const result = await updatePostAuction.mutateAsync({
          postId,
          auctionInfo: {
            startPrice,
            auctionDigest: digest,
            auctionId,
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