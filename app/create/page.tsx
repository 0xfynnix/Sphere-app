"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageIcon, Wand2, CalendarIcon } from "lucide-react";
import { ImageUpload } from "@/components/common/ImageUpload";
import { toast } from "sonner";
import { useCreateContent, useUploadImage } from "@/lib/api/hooks";
import { FlowDialog, Step } from "@/components/dialog/FlowDialog";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { Post } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function CreatePage() {
  const [, setActiveTab] = useState("traditional");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [allowBidding, setAllowBidding] = useState(false);
  const [biddingDueDate, setBiddingDueDate] = useState<Date>();
  const [startPrice, setStartPrice] = useState<string>("");
  const router = useRouter();
  const createContent = useCreateContent();
  const uploadImage = useUploadImage();
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const handleImageChange = (file: File | null) => {
    setImage(file);
    setImageUrl(file?.name || "");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGeneratedContent(
      "This is a sample generated content based on your prompt. You can edit it before publishing."
    );
    setIsGenerating(false);
    setImage(null);
    setImageUrl("");
  };

  const handlePublish = async () => {
    if (!text || !image || !title) {
      toast.error("Please fill in the title, content and select an image");
      return;
    }
    if (allowBidding && (!biddingDueDate || !startPrice)) {
      toast.error("Please select bidding end date and start price");
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
          biddingInfo: allowBidding ? {
            dueDate: biddingDueDate,
            startPrice: parseFloat(startPrice)
          } : null
        };
      },
    },
    {
      title: "Wallet Signature",
      description: "Please confirm the signature in your wallet...",
      action: async (data) => {
        if (!account?.address) {
          throw new Error("No wallet connected");
        }
        const { signature } = await signPersonalMessage({
          message: new TextEncoder().encode(`Create content: ${title}`),
        });
        return {
          address: account.address,
          signature,
          imageInfo: (data as { imageInfo: { url: string; cid: string } })
            .imageInfo,
          biddingInfo: (
            data as { biddingInfo: { dueDate: Date; startPrice: number } }
          ).biddingInfo,
        } as unknown;
      },
    },
    {
      title: "Create Content",
      description: "Creating content...",
      action: async (data) => {
        if (!data) throw new Error("Missing data");
        const { signature, imageInfo, biddingInfo } = data as {
          address: string;
          signature: string;
          imageInfo: { url: string; cid: string };
          biddingInfo: { dueDate: Date; startPrice: number };
        };
        const result = await createContent.mutateAsync({
          text,
          title,
          signature,
          imageInfo,
          biddingInfo
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
          Choose your preferred way to create content
        </p>
      </div>

      <Tabs
        defaultValue="traditional"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="traditional">
            <ImageIcon className="mr-2 h-4 w-4" />
            Traditional
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Wand2 className="mr-2 h-4 w-4" />
            AI Agent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traditional" className="mt-6">
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
                      <Label className="mb-0.5" htmlFor="biddingDueDate">Bidding End Date(max 30 days)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !biddingDueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {biddingDueDate ? format(biddingDueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={biddingDueDate}
                            onSelect={setBiddingDueDate}
                            initialFocus
                            disabled={(date: Date) => 
                              date < new Date() || 
                              date > new Date(new Date().setDate(new Date().getDate() + 30))
                            }
                          />
                        </PopoverContent>
                      </Popover>
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
                <Label htmlFor="image">Image (Required)</Label>
                <ImageUpload
                  onImageChange={handleImageChange}
                  disabled={createContent.isPending}
                />
                {imageUrl && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected image: {imageUrl}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handlePublish}
                  disabled={createContent.isPending}
                >
                  {createContent.isPending ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">AI Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Cost: 0.5 SUI</p>
                  <p className="text-sm text-muted-foreground">
                    Pay with your wallet
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>

              {generatedContent && (
                <div>
                  <Label>Generated Content</Label>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handlePublish}
                  disabled={!generatedContent || createContent.isPending}
                >
                  {createContent.isPending ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

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
