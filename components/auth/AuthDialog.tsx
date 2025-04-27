"use client";

import { useState, useEffect } from "react";
import {
  useCurrentWallet,
  useCurrentAccount,
  ConnectButton,
  useSignPersonalMessage,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { getChallenge, verifySignature } from "@/lib/api/wallet";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AuthDialogProps {
  isMobile?: boolean;
}

export function AuthDialog({ isMobile = false }: AuthDialogProps) {
  const { currentWallet, connectionStatus, isConnected } = useCurrentWallet();
  const account = useCurrentAccount();
  const { user, setUser, setToken, logout } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: disconnect } = useDisconnectWallet();
  const router = useRouter();

  useEffect(() => {
    console.log("currentWallet", currentWallet);
    if (currentWallet) {
      handleLogin();
    }
  }, [currentWallet]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      if (connectionStatus !== "connected") {
        toast.error("Failed to connect wallet:", {
          description: "Please connect your wallet to continue",
        });
        return;
      }

      if (!account?.address) {
        throw new Error("No wallet account found");
      }

      const walletAddress = account.address;
      
      // 1. 获取挑战码
      const challenge = await getChallenge(walletAddress);
      
      // 2. 使用钱包签名挑战码
      const { signature } = await signPersonalMessage({
        message: new TextEncoder().encode(challenge),
      });
      
      // 3. 验证签名并获取用户信息
      const { token, user } = await verifySignature(
        walletAddress,
        signature,
        challenge
      );
      
      // 4. 存储 token 和用户信息
      setToken(token);
      setUser(user);
    } catch (error) {
      toast.error("Failed to connect wallet:", {
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    disconnect();
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  if (user) {
    return (
      <div className={isMobile ? "flex items-center gap-2" : "flex flex-col items-center justify-center p-6"}>
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
    <div className={isMobile ? "flex items-center" : "flex flex-col items-center justify-center p-6"}>
      {isConnected ? (
        <div className={isMobile ? "flex items-center" : "flex flex-col items-center space-y-4"}>
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className={isMobile ? "h-8 px-3" : "w-full"}
            size={isMobile ? "sm" : "default"}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Logging in..." : "Retry Login"}
          </Button>
        </div>
      ) : (
        <ConnectButton className={isMobile ? "h-8" : "w-full"} />
      )}
    </div>
  );
}
