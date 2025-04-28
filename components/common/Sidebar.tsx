/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, User, PlusCircle } from 'lucide-react';
import { AuthDialog } from '../auth/AuthDialog';
import { ThemeToggle } from './ThemeToggle';
import { useUserStore } from '@/store/userStore';

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUserStore();

  // 检查是否是从侧边栏进入的用户页面
  const isUserPageFromSidebar = pathname.startsWith('/user') && searchParams.get('source') === 'sidebar';

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
            <h1 className="text-xl font-bold text-sidebar-foreground">Sphere</h1>
          </div>
          <ThemeToggle />
        </div>
        <nav className="space-y-2">
          <Link href="/">
            <Button
              variant={pathname === '/' ? 'default' : 'ghost'}
              className={cn(
                "w-full justify-start transition-colors",
                pathname === '/' ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          { user && (
            <Link href={`/user/${user.walletAddress}`}>
              <Button
                variant={isUserPageFromSidebar ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start transition-colors",
                  isUserPageFromSidebar ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent"
                )}
              >
                <User className="mr-2 h-4 w-4" />
                My Page
              </Button>
            </Link>
          )}
        </nav>

         {user && (
          <div className="my-8">
            <Link href="/create">
              <Button
                className={cn(
                  "w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                  "hover:from-purple-600 hover:to-pink-600",
                  "active:from-purple-700 active:to-pink-700",
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
            <AuthDialog />
          </div>
      </div>
    </div>
  );
} 