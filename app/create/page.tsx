'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageIcon, Wand2 } from 'lucide-react';
import { ImageUpload } from "@/components/common/ImageUpload"

export default function CreatePage() {
  const [, setActiveTab] = useState('traditional');
  const [text, setText] = useState('');
  const [, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
    }else{
      setImage(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedContent("This is a sample generated content based on your prompt. You can edit it before publishing.");
    setIsGenerating(false);
  };

  const handlePublish = () => {
    // Handle publishing logic
    console.log('Publishing content...');
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
                  onImageChange={(file) => {
                    
                      handleImageChange(file)
                    
                  }} 
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePublish}>
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
                  disabled={!generatedContent}
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