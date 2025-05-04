"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageIcon, Wand2 } from "lucide-react";
import { ImageUpload } from "@/components/common/ImageUpload";
import { toast } from "sonner";
import { useCreateContent, useUploadImage } from "@/lib/api/hooks";
import { FlowDialog, Step } from "@/components/dialog/FlowDialog";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { Post } from "@/lib/api/types";
import { useRouter } from "next/navigation";
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
        } as unknown;
      },
    },
    {
      title: "Create Content",
      description: "Creating content...",
      action: async (data) => {
        if (!data) throw new Error("Missing data");
        const { signature, imageInfo } = data as {
          address: string;
          signature: string;
          imageInfo: { url: string; cid: string };
        };
        const result = await createContent.mutateAsync({
          text,
          title,
          signature,
          imageInfo,
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
