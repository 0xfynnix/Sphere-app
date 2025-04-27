/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, User, PlusCircle, LogOut } from 'lucide-react';
import { AuthDialog } from '../auth/AuthDialog';
import { logger } from '@/lib/utils';
import { useEffect } from 'react';
import { Badge } from '../ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { useCurrentWallet } from '@mysten/dapp-kit';

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentWallet } = useCurrentWallet();

  useEffect(() => {
    logger.debug('Sidebar - Wallet state changed', { currentWallet });
  }, [currentWallet]);

  // 检查是否是从侧边栏进入的用户页面
  const isUserPageFromSidebar = pathname.startsWith('/user') && searchParams.get('source') === 'sidebar';

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 flex flex-col">
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
          {currentWallet && (
            <Link href={`/user/${currentWallet.accounts[0]?.address}`}>
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

        {currentWallet && (
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
        {currentWallet ? (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sidebar-foreground">Wallet Connected</span>
                <span className="text-sm text-sidebar-accent-foreground truncate max-w-[150px]">
                  {currentWallet.accounts[0]?.address}
                </span>
              </div>
            </div>
            <AuthDialog />
          </div>
        ) : (
          <div className="flex justify-center">
            <AuthDialog />
          </div>
        )}
      </div>
    </div>
  );
} 