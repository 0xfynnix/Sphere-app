"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";
import { ImageUpload } from "@/components/common/ImageUpload";
import { toast } from "sonner";
import { useCreateContent, useUploadImage } from "@/lib/api/hooks";
import { FlowDialog, Step } from "@/components/dialog/FlowDialog";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Post } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

import { GenerateImageDialog } from "@/components/dialog/GenerateImageDialog";
import Image from "next/image";
import { useSphereContract } from "@/hooks/useSphereContract";
import { useSuiClient } from "@mysten/dapp-kit";

export default function CreatePage() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [allowBidding, setAllowBidding] = useState(false);
  const [durationHours, setDurationHours] = useState<string>("24");
  const [durationMinutes, setDurationMinutes] = useState<string>("0");
  const [startPrice, setStartPrice] = useState<string>("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const router = useRouter();
  const createContent = useCreateContent();
  const uploadImage = useUploadImage();
  const account = useCurrentAccount();
  // const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mintCopyrightNFT, createAuction } = useSphereContract();
  const client = useSuiClient();

  // 定义 biddingInfo 类型
  type BiddingInfo = {
    durationHours: number;
    durationMinutes: number;
    startPrice: number;
    auctionDigest?: string;
    auctionCapObjectId?: string;
    auctionId?: string;
    auctionCapId?: string;
  };

  const handleImageChange = (file: File | null) => {
    setImage(file);
    setImageUrl(file?.name || "");
  };

  const handlePublish = async () => {
    if (!text || !image || !title) {
      toast.error("Please fill in the title, content and select an image");
      return;
    }
    if (allowBidding && (!durationHours || !durationMinutes || !startPrice)) {
      toast.error("Please select duration and start price");
      return;
    }
    setShowFlowDialog(true);
  };

  const createSteps: Step[] = [
    {
      title: "Upload Image",
      description: "Uploading image to server...",
      action: async () => {
        if (!image) throw new Error("Please select an image");
        const result = await uploadImage.mutateAsync(image);
        return {
          address: account?.address || "",
          signature: "",
          imageInfo: result,
          biddingInfo: allowBidding
            ? {
                durationHours: parseInt(durationHours),
                durationMinutes: parseInt(durationMinutes),
                startPrice: parseFloat(startPrice),
              }
            : null,
        };
      },
    },
    {
      title: "Mint NFT",
      description: "Please confirm the signature in your wallet...",
      action: async (data) => {
        if (!account?.address) {
          throw new Error("No wallet connected");
        }
        const { imageInfo, biddingInfo } = data as {
          imageInfo: { url: string; cid: string };
          biddingInfo?: BiddingInfo;
        };

        // 调用合约 mint 函数
        const result = await mintCopyrightNFT(
          process.env.NEXT_PUBLIC_COPY_RIGHT_MINT_RECORD || "",
          process.env.NEXT_PUBLIC_COPY_RIGHT_CREATOR_RECORD || "",
          title,
          text,
          imageInfo.url,
          imageInfo.url,
          imageInfo.url,
          imageInfo.url,
          account.address
        );

        // 等待交易确认并查询事件
        const txResponse = await client.waitForTransaction({
          digest: result.digest,
          options: {
            showEvents: true,
            showEffects: true,
          },
        });

        // 查找 NFTMinted 事件
        const nftMintedEvent = txResponse.events?.find((event) =>
          event.type.includes("::copyright_nft::NFTMinted")
        );

        if (!nftMintedEvent) {
          throw new Error("Failed to find NFTMinted event");
        }

        const nftObjectId = (nftMintedEvent.parsedJson as { object_id: string })
          ?.object_id;
        if (!nftObjectId) {
          throw new Error("Failed to get NFT object ID from event");
        }

        // 如果有 biddingInfo，创建拍卖
        if (biddingInfo) {
          // 计算拍卖持续时间（毫秒）
          const duration =
            (biddingInfo.durationHours * 60 * 60 +
              biddingInfo.durationMinutes * 60) *
            1000;

          // 创建拍卖
          const auctionResult = await createAuction(
            nftObjectId,
            biddingInfo.startPrice,
            duration
          );

          // 等待拍卖创建交易确认
          const auctionTxResponse = await client.waitForTransaction({
            digest: auctionResult.digest,
            options: {
              showEvents: true,
              showEffects: true,
              showObjectChanges: true,
            },
          });

          // Extract auction_id and AuctionCapId from objectChanges
          const auctionObject = auctionTxResponse.objectChanges?.find(
            (change) => change.type === 'created' && change.objectType.endsWith('::copyright_nft::Auction')
          ) as { objectId: string } | undefined;
          const auctionCapObject = auctionTxResponse.objectChanges?.find(
            (change) => change.type === 'created' && change.objectType.endsWith('::copyright_nft::AuctionCap')
          ) as { objectId: string } | undefined;

          if (!auctionObject || !auctionCapObject) {
            throw new Error('Failed to get auction or auction cap ID');
          }

          const auctionId = auctionObject.objectId;
          const auctionCapId = auctionCapObject.objectId;

          // 更新 biddingInfo，添加拍卖交易 digest 和 auction_id
          biddingInfo.auctionDigest = auctionResult.digest;
          biddingInfo.auctionId = auctionId;
          biddingInfo.auctionCapId = auctionCapId;
        }

        return {
          address: account.address,
          signature: result.digest,
          imageInfo,
          biddingInfo,
          nftObjectId,
        } as unknown;
      },
    },
    {
      title: "Create Content",
      description: "Creating content...",
      action: async (data) => {
        if (!data) throw new Error("Missing data");
        const { signature, imageInfo, biddingInfo, nftObjectId } = data as {
          address: string;
          signature: string;
          imageInfo: { url: string; cid: string };
          biddingInfo: {
            durationHours: number;
            durationMinutes: number;
            startPrice: number;
            auctionDigest?: string;
            auctionCapId?: string;
            auctionId?: string;
          };
          nftObjectId: string;
        };
        const result = await createContent.mutateAsync({
          text,
          title,
          digest: signature,
          imageInfo,
          biddingInfo,
          nftObjectId,
        });
        return (result as { post: Post }).post;
      },
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Create Content
        </h1>
        <p className="text-muted-foreground">
          Create and share your content with the community
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Textarea
              id="title"
              placeholder="Enter a title for your content"
              maxLength={25}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {title.length}/25 characters
            </p>
          </div>

          <div>
            <Label htmlFor="text">Content</Label>
            <Textarea
              id="text"
              placeholder="Write your content here (max 250 characters)"
              maxLength={250}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {text.length}/250 characters
            </p>
          </div>

          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allowBidding">Allow Bidding</Label>
              <Switch
                id="allowBidding"
                checked={allowBidding}
                onCheckedChange={setAllowBidding}
              />
            </div>

            {allowBidding && (
              <>
                <div>
                  <Label className="mb-0.5">
                    Auction Duration (max 30 days)
                  </Label>
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
                            if (
                              value === "" ||
                              (parseInt(value) >= 0 && parseInt(value) <= 720)
                            ) {
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
                            if (
                              value === "" ||
                              (parseInt(value) >= 0 && parseInt(value) <= 59)
                            ) {
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
                    {durationHours === "" ? "0" : durationHours} hours{" "}
                    {durationMinutes === "" ? "0" : durationMinutes} minutes
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
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="image">Image (Required)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenerateDialog(true)}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </div>
            <div className="space-y-4">
              <ImageUpload
                onImageChange={handleImageChange}
                disabled={createContent.isPending}
                showPreview={false}
              />
              {image && (
                <div className="relative aspect-square w-full max-w-[512px] mx-auto rounded-lg overflow-hidden border">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Content image preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              {imageUrl && !image && (
                <p className="text-sm text-muted-foreground text-center">
                  Selected image: {imageUrl}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePublish} disabled={createContent.isPending}>
              {createContent.isPending ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </Card>

      <FlowDialog
        open={showFlowDialog}
        onClose={() => setShowFlowDialog(false)}
        steps={createSteps as Step<unknown, Post>[]}
        onSuccess={(post: Post) => {
          toast.success("Content published successfully!");
          setText("");
          setTitle("");
          setImage(null);
          setImageUrl("");
          router.push(`/post/${post.id}`);
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
      />

      <GenerateImageDialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        onImageGenerated={handleImageChange}
      />

      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          Note: All content will be registered on-chain with a unique ID and
          timestamp.
        </p>
        <p>
          Copyright information will be permanently stored on the blockchain.
        </p>
      </div>
    </div>
  );
}
