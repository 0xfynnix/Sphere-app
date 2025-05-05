import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";

interface ShareDialogProps {
  postId: string;
  postShareCode: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ postId, postShareCode, trigger }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  
  // 只在用户和帖子都有分享码时才添加分享码参数
  const shareUrl = useMemo(() => {
    return user?.shareCode && postShareCode
      ? `${window.location.origin}/post/${postId}?ref=${user.shareCode}-${postShareCode}`
      : `${window.location.origin}/post/${postId}`;
  }, [user?.shareCode, postShareCode, postId]);

  const shareText = `Check out this amazing post on Sphere! 🎨✨\n\n${shareUrl}\n\nJoin our creative community and discover more inspiring content!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy, please copy manually");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {shareText}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly className="hidden" />
            <Button onClick={handleCopyLink} className="w-full">
              Copy Share Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 