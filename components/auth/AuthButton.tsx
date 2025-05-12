"use client";

import { useEffect, useState, useRef } from "react";
import {
  useCurrentWallet,
  ConnectButton,
  useDisconnectWallet,
  useConnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";
import { LoginFlowDialog } from "../dialog/LoginFlowDialog";
import { UserTypeDialog } from "../dialog/UserTypeDialog";
import { UserTypeSelectionDialog } from "@/components/dialog/UserTypeSelectionDialog";
import { UserProfile, UserType } from "@/lib/api/types";
import { toast } from "sonner";

interface AuthButtonProps {
  isMobile?: boolean;
}

export function AuthButton({ isMobile = false }: AuthButtonProps) {
  const { currentWallet, isConnected } = useCurrentWallet();
  const { user, logout, refreshUser } = useUserStore();
  const { unreadCount } = useNotificationStore();
  const hasRefreshed = useRef(false);
  const wallets = useWallets();
  const [logoutLoading, setLogoutLoading] = useState(false);
  // const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect } = useConnectWallet();

  const router = useRouter();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showUserTypeDialog, setShowUserTypeDialog] = useState(false);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  // console.log("currentWallet", currentWallet);
  // console.log("user", user);
  // console.log("isConnected", isConnected);

  useEffect(() => {
    if (!user && currentWallet && !logoutLoading) {
      setShowLoginDialog(true);
      setIsLoginLoading(true);
    }
  }, [currentWallet, user, logoutLoading]);

  useEffect(() => {
    if (user && !hasRefreshed.current) {
      hasRefreshed.current = true;
      refreshUser();
    }
  }, [user, refreshUser]);

  // 处理钱包断开连接的情况
  useEffect(() => {
    if (user && !currentWallet && wallets.length > 0) {
      // 钱包断开连接，需要重新连接
      connectWallet();
    } else if (
      user &&
      currentWallet &&
      currentWallet.accounts[0]?.address !== user.walletAddress
    ) {
      // 钱包地址不匹配，需要退出登录
      handleLogout();
    }
  }, [user, currentWallet, wallets]);
  const connectWallet = async () => {
    try {
      await connect({ wallet: wallets[0] });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      handleLogout();
    }
  };
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await Promise.all([
        logout(),
        disconnect(),
      ]);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setTimeout(() => {
        setLogoutLoading(false);
      }, 1000);
    }
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleLoginSuccess = (result: { user: UserProfile }) => {
    setShowLoginDialog(false);
    if (result.user && !result.user.userType) {
      setShowUserTypeSelection(true);
    }
  };

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
    setShowUserTypeSelection(false);
    setShowUserTypeDialog(true);
  };

  if (user) {
    return (
      <div
        className={
          isMobile
            ? "flex items-center gap-2"
            : "flex flex-col items-center justify-center min-w-[200px]"
        }
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity",
              isMobile ? "mb-0" : "mb-4"
            )}
            onClick={handleProfileClick}
          >
            <Avatar className={isMobile ? "h-8 w-8" : ""}>
              {user.profile?.avatar && (
                <AvatarImage src={user.profile.avatar} />
              )}
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
            onClick={() => router.push("/notifications")}
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
        {showUserTypeSelection && (
          <UserTypeSelectionDialog
            open={showUserTypeSelection}
            onClose={() => setShowUserTypeSelection(false)}
            onSelect={handleUserTypeSelect}
          />
        )}
        {showUserTypeDialog && selectedUserType && (
          <UserTypeDialog
            open={showUserTypeDialog}
            onClose={() => setShowUserTypeDialog(false)}
            selectedType={selectedUserType}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={
        isMobile
          ? "flex items-center"
          : "flex flex-col items-center justify-center p-6 min-w-[200px]"
      }
    >
      {isConnected ? (
        <div
          className={
            isMobile
              ? "flex items-center"
              : "flex flex-col items-center space-y-4 w-full"
          }
        >
          <Button
            onClick={() => setShowLoginDialog(true)}
            disabled={isLoginLoading}
            className={cn(
              "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600",
              "dark:from-indigo-600 dark:to-purple-600 dark:hover:from-indigo-500 dark:hover:to-purple-500",
              "text-white transition-all duration-200",
              isMobile ? "h-8 px-3" : "w-full"
            )}
            size={isMobile ? "sm" : "default"}
          >
            {isLoginLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoginLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      ) : (
        <ConnectButton 
          className={cn(
            "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600",
            "dark:from-indigo-600 dark:to-purple-600 dark:hover:from-indigo-500 dark:hover:to-purple-500",
            "!text-white transition-all duration-200",
            isMobile ? "h-8" : "w-full"
          )}
        />
      )}
      {showLoginDialog && (
        <LoginFlowDialog
          open={showLoginDialog}
          onClose={() => {
            setShowLoginDialog(false);
            setIsLoginLoading(false);
          }}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
