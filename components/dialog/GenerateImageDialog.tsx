import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGenerateImage } from "@/lib/api/hooks";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import Image from "next/image";

interface GenerateImageDialogProps {
  open: boolean;
  onClose: () => void;
  onImageGenerated: (file: File) => void;
}

type Step = "input" | "preview";

export function GenerateImageDialog({ open, onClose, onImageGenerated }: GenerateImageDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<Step>("input");
  const generateImage = useGenerateImage();

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      const result = await generateImage.mutateAsync({
        prompt,
        num_inference_steps: 50,
        guidance_scale: 7.5,
        width: 512,
        height: 512,
      });

      // Set preview
      setPreviewUrl(result.image);
      setCurrentStep("preview");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    }
  };

  const handleConfirm = async () => {
    try {
      // Convert base64 to File object
      const base64Response = await fetch(previewUrl);
      const blob = await base64Response.blob();
      const file = new File([blob], "generated-image.png", { type: "image/png" });
      
      onImageGenerated(file);
      toast.success("Image generated successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to process image", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleSaveToLocal = async () => {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(previewUrl);
      const blob = await base64Response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${Date.now()}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Image saved successfully!");
    } catch (error) {
      toast.error("Failed to save image", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep("input");
  };

  const handleClose = () => {
    setPreviewUrl("");
    setPrompt("");
    setCurrentStep("input");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "input" ? "Generate Image with AI" : "Preview Generated Image"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {currentStep === "input" ? (
            <div className="grid gap-2">
              <Label htmlFor="prompt">AI Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-32"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square w-full max-w-[512px] mx-auto rounded-lg overflow-hidden border">
                <Image
                  src={previewUrl}
                  alt="Generated image preview"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Prompt: {prompt}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {currentStep === "preview" && (
            <>
              <Button variant="outline" onClick={handleBack} className="mr-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <Button variant="outline" onClick={handleSaveToLocal}>
                <Download className="mr-2 h-4 w-4" />
                Save to Local
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {currentStep === "input" ? (
            <Button 
              onClick={handleGenerate} 
              disabled={generateImage.isPending || !prompt}
            >
              {generateImage.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          ) : (
            <Button onClick={handleConfirm}>
              Use This Image
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 