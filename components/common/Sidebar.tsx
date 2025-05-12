/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, User, PlusCircle, Bell } from "lucide-react";
import { AuthButton } from "../auth/AuthButton";
import { ThemeToggle } from "./ThemeToggle";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const { unreadCount } = useNotificationStore();

  // 检查是否是从侧边栏进入的用户页面
  const isUserPageFromSidebar =
    pathname.startsWith("/user") && searchParams.get("source") === "sidebar";

  return (
    <div className="w-64 h-screen bg-sidebar backdrop-blur-sm border-r border-sidebar-border fixed left-0 top-0 flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Sphere Logo"
              width={32}
              height={32}
              className="rounded-full mr-2"
            />
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Sphere
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-3">
          <Link href="/" className="block">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              className={cn(
                "w-full justify-start transition-colors py-6",
                pathname === "/"
                  ? "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/30"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          {user && (
            <>
              <Link href={`/user/${user.walletAddress}`} className="block">
                <Button
                  variant={isUserPageFromSidebar ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-colors py-6",
                    isUserPageFromSidebar
                      ? "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/30"
                  )}
                >
                  <User className="mr-2 h-4 w-4" />
                  My Page
                </Button>
              </Link>
            </>
          )}
        </nav>

        {user && (
          <div className="my-8">
            <Link href="/create">
              <Button
                className={cn(
                  "w-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 text-white",
                  "hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-500 dark:hover:to-purple-500",
                  "active:from-indigo-700 active:to-purple-700",
                  "transition-all duration-200",
                  "shadow-md hover:shadow-lg active:shadow-sm",
                  "rounded-xl",
                  "font-semibold",
                  "py-6"
                )}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Content
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex justify-center">
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
