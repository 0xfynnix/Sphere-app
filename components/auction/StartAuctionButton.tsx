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
            showObjectChanges: true,
          },
        });

        // Extract auction_id and AuctionCapId from objectChanges
        const auctionObject = txResponse.objectChanges?.find(
          (change) => change.type === 'created' && change.objectType.endsWith('::copyright_nft::Auction')
        ) as { objectId: string } | undefined;
        const auctionCapObject = txResponse.objectChanges?.find(
          (change) => change.type === 'created' && change.objectType.endsWith('::copyright_nft::AuctionCap')
        ) as { objectId: string } | undefined;

        if (!auctionObject || !auctionCapObject) {
          throw new Error('Failed to get auction or auction cap ID');
        }

        const auctionId = auctionObject.objectId;
        const auctionCapId = auctionCapObject.objectId;

        return {
          digest: result.digest,
          auctionId,
          auctionCapId,
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
        const { digest, auctionId, startPrice, durationHours, durationMinutes, auctionCapId } = data as {
          digest: string;
          auctionId: string;
          startPrice: number;
          durationHours: number;
          durationMinutes: number;
          auctionCapId: string;
        };

        const result = await updatePostAuction.mutateAsync({
          postId,
          auctionInfo: {
            startPrice,
            auctionDigest: digest,
            auctionId,
            auctionCapId,
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
        <Button 
          onClick={handleStartAuction}
          className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 border-none"
        >
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