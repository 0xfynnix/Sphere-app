'use client';

import { SignIn, useClerk, useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // 检查 URL 参数是否要求显示登录对话框
    const showAuth = searchParams.get("showAuth");
    const hash = window.location.hash;
    
    // 如果 URL 中有 showAuth 参数或者有 hash 参数，打开弹窗
    if (showAuth === "true" || hash.includes("sso-callback")) {
      setIsOpen(true);
    }
  }, [searchParams]);

  // 监听登录状态变化
  useEffect(() => {
    if (isSignedIn) {
      // 登录成功后，清除 URL 中的 hash
      window.location.hash = "";
      setIsOpen(false);
    }
  }, [isSignedIn]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 如果用户手动关闭弹窗，先登出
      signOut();
      // 清除 URL 中的 hash
      window.location.hash = "";
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Sign In</Button>
      </DialogTrigger>
      <DialogContent className="w-[400px] p-0" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">Welcome to Sphere</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <SignIn 
            routing="hash"
            signUpUrl="/"
            signInUrl="/"
            afterSignInUrl="/"
            afterSignUpUrl="/"
            oauthFlow="auto"
            appearance={{
              baseTheme: theme === 'dark' ? undefined : undefined,
              variables: {
                colorBackground: theme === 'dark' ? '#020817' : '#ffffff',
                colorText: theme === 'dark' ? '#f8fafc' : '#020817',
                colorPrimary: '#3b82f6',
                colorInputBackground: theme === 'dark' ? '#1e293b' : '#f8fafc',
                colorInputText: theme === 'dark' ? '#f8fafc' : '#020817',
              },
              elements: {
                footer: "!hidden",
                rootBox: "!w-full",
                cardBox: "!w-full !shadow-none",
                card: "bg-background w-full !p-0 !mt-0 !gap-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsIconButton: "!border !border-input !rounded-full",
                socialButtonsBlockButton: "w-full h-12 flex items-center justify-center gap-3 bg-background !border !border-black hover:bg-accent hover:text-accent-foreground text-foreground font-medium rounded-lg transition-colors duration-200",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                formFieldInput: "bg-input text-foreground border-input",
                footerActionLink: "text-primary hover:text-primary/90",
                formFieldLabel: "text-foreground",
                formFieldWarningText: "text-destructive",
                formFieldSuccessText: "text-success",
                form: "w-full",
                formField: "mb-4",
                formFieldInputWrapper: "w-full",
                formFieldLabelRow: "mb-1",
                formFieldInputShowPasswordIcon: "text-foreground",
                formFieldInputShowPasswordButton: "hover:bg-transparent",
                formFieldInputShowPasswordIconContainer: "hover:bg-transparent",
              }
            }}
          />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}