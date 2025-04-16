'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageIcon, Wand2 } from 'lucide-react';
import { ImageUpload } from "@/components/common/ImageUpload";
import { uploadToStorage } from '@/lib/storage';
import { toast } from 'sonner';

export default function CreatePage() {
  const [, setActiveTab] = useState('traditional');
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleImageChange = async (file: File | null) => {
    if (file) {
      try {
        setIsUploading(true);
        
        // 显示上传提示
        const toastId = toast.loading('Uploading image to Walrus decentralized storage...');
        
        // 上传到 Walrus
        const result = await uploadToStorage(file);
        setImageUrl(result.url);
        setImage(file);
        
        // 更新提示
        toast.success('Image uploaded successfully!', {
          id: toastId
        });
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    } else {
      setImage(null);
      setImageUrl('');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedContent("This is a sample generated content based on your prompt. You can edit it before publishing.");
    setIsGenerating(false);
  };

  const handlePublish = async () => {
    if (isUploading) {
      toast.error('Please wait for image upload to complete');
      return;
    }

    if (image && !imageUrl) {
      toast.error('Image is still uploading');
      return;
    }

    // 准备发布数据
    const postData = {
      text,
      imageUrl,
      // ... 其他数据
    };
    
    // 调用发布 API
    console.log('Publishing with IPFS image:', postData);
    toast.success('Content published successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Content</h1>
        <p className="text-gray-600">Choose your preferred way to create content</p>
      </div>

      <Tabs defaultValue="traditional" className="w-full" onValueChange={setActiveTab}>
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
                <Label htmlFor="text">Content</Label>
                <Textarea
                  id="text"
                  placeholder="Write your content here (max 250 characters)"
                  maxLength={250}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {text.length}/250 characters
                </p>
              </div>

              <div>
                <Label htmlFor="image">Image (Optional)</Label>
                <ImageUpload 
                  onImageChange={handleImageChange}
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-gray-500 mt-1">
                    Uploading to IPFS...
                  </p>
                )}
                {imageUrl && (
                  <p className="text-sm text-gray-500 mt-1">
                    Image uploaded: {imageUrl}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handlePublish}
                  disabled={isUploading}
                >
                  Publish
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

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Cost: 0.5 SUI</p>
                  <p className="text-sm text-gray-500">Pay with your wallet</p>
                </div>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
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
                  disabled={!generatedContent || isUploading}
                >
                  Publish
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-sm text-gray-500">
        <p>Note: All content will be registered on-chain with a unique ID and timestamp.</p>
        <p>Copyright information will be permanently stored on the blockchain.</p>
      </div>
    </div>
  );
} 