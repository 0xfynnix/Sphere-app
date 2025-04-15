'use client';

import { useSignIn, useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/lib/utils";

export function AuthDialog() {
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn, user, isLoaded: isUserLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 检查 URL 参数是否要求显示登录对话框
    const showAuth = searchParams.get("showAuth");
    if (showAuth === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    logger.debug('AuthDialog - Authentication state changed', { isSignedIn, user });
    if (isSignedIn) {
      setIsOpen(false);
      // 清除 URL 参数
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("showAuth");
      router.replace(newUrl.pathname);
      router.refresh();
    }
  }, [isSignedIn, user, router]);

  const handleGoogleAuth = async () => {
    if (!isSignInLoaded || !isUserLoaded) {
      logger.error('AuthDialog - Clerk is not loaded');
      return;
    }
    
    try {
      logger.info('AuthDialog - Starting Google authentication');
      
      // 获取当前 URL 作为重定向 URL
      const currentUrl = new URL(window.location.href);
      const redirectUrl = `${currentUrl.origin}/sso-callback`;
      const redirectUrlComplete = currentUrl.origin;

      // 尝试登录，启用自动注册
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl,
        redirectUrlComplete,
        continueSignUp: true, // 启用自动注册
      });
      
      // 认证成功后会自动关闭对话框并刷新页面
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      logger.error('AuthDialog - Error during Google authentication', { 
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Sign In</Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">Welcome to Sphere</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Button
            onClick={handleGoogleAuth}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>
          <p className="mt-4 text-sm text-gray-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 