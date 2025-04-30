"use client";

import { useEffect } from "react";
import {
  useCurrentWallet,
  ConnectButton,
  useSignPersonalMessage,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWalletLogin } from "@/lib/api/hooks";

interface AuthDialogProps {
  isMobile?: boolean;
}

export function AuthDialog({ isMobile = false }: AuthDialogProps) {
  const { currentWallet, isConnected } = useCurrentWallet();
  const { user, logout } = useUserStore();
  const { unreadCount } = useNotificationStore();

  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: disconnect } = useDisconnectWallet();

  useEffect(() => {
    console.log("currentWallet", currentWallet);
    if (currentWallet) {
      handleConnect();
    }
  }, [currentWallet]);


  const router = useRouter();
  
  const { login, isLoading: isLoginLoading } = useWalletLogin();

  const handleConnect = async () => {
    try {
      if (!currentWallet) {
        throw new Error('No wallet connected');
      }

      const address = currentWallet.accounts[0].address;

      // 使用 login 函数处理登录流程
      const result = await login(address, async (message) => {
        const { signature } = await signPersonalMessage({ message });
        return { signature };
      });
      
      if (result.success) {
        toast.success('Login successful');
      } else {
        // 显示错误信息
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleLogout = () => {
    logout();
    disconnect();
    router.push("/");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  if (user) {
    return (
      <div className={isMobile ? "flex items-center gap-2" : "flex flex-col items-center justify-center min-w-[200px]"}>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity",
              isMobile ? "mb-0" : "mb-4"
            )}
            onClick={handleProfileClick}
          >
            <Avatar className={isMobile ? "h-8 w-8" : ""}>
              {user.profile?.avatar && <AvatarImage src={user.profile.avatar} />}
              <AvatarFallback>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <div>
                <h3 className="font-semibold">
                  {user.profile?.name || "Anonymous"}
                </h3>
                <p className="text-sm text-gray-500">
                  {user.walletAddress?.slice(0, 6)}...
                  {user.walletAddress?.slice(-4)}
                </p>
              </div>
            )}
          </div>
          <div 
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        {!isMobile && (
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={isMobile ? "flex items-center" : "flex flex-col items-center justify-center p-6 min-w-[200px]"}>
      {isConnected ? (
        <div className={isMobile ? "flex items-center" : "flex flex-col items-center space-y-4 w-full"}>
          <Button
            onClick={handleConnect}
            disabled={isLoginLoading}
            className={isMobile ? "h-8 px-3" : "w-full"}
            size={isMobile ? "sm" : "default"}
          >
            {isLoginLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoginLoading ? "Logging in..." : "Retry Login"}
          </Button>
        </div>
      ) : (
        <ConnectButton className={isMobile ? "h-8" : "w-full"} />
      )}
    </div>
  );
}
