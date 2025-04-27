/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, User, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { AuthDialog } from '../auth/AuthDialog';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { useCurrentWallet } from '@mysten/dapp-kit';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentWallet } = useCurrentWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 点击菜单外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.header-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const isUserPageFromSidebar = pathname.startsWith('/user') && searchParams.get('source') === 'sidebar';

  return (
    <header className="fixed top-0 left-0 right-0 bg-sidebar border-b border-sidebar-border z-50">
      <div className="px-4 py-3 flex items-center justify-between">
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
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <AuthDialog />
          <Button
            variant="ghost"
            size="icon"
            className="header-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 菜单遮罩层 */}
      {isMenuOpen && (
        <div 
          className={cn(
            "fixed inset-0 bg-black/30 backdrop-blur-[2px]",
            "transition-opacity duration-300 ease-in-out",
            "md:hidden z-40"
          )}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* 菜单内容 */}
      <div 
        className={cn(
          "header-menu fixed top-0 right-0 bottom-0 w-64 bg-sidebar/95 backdrop-blur-sm",
          "transform transition-all duration-300 ease-in-out",
          "md:hidden z-50",
          "border-l border-sidebar-border/50",
          "shadow-lg shadow-black/10",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Sphere Logo"
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
                <h2 className="text-lg font-semibold text-sidebar-foreground">Sphere</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <Link
              href="/"
              className={cn(
                "flex items-center px-4 py-2 rounded-lg",
                "text-sidebar-foreground hover:bg-sidebar-hover",
                pathname === "/" && "bg-sidebar-hover"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              Home
            </Link>

            {currentWallet && (
              <>
                <Link
                  href={`/user/${currentWallet.accounts[0]?.address}`}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    "text-sidebar-foreground hover:bg-sidebar-hover",
                    pathname.startsWith("/user") && !isUserPageFromSidebar && "bg-sidebar-hover"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </Link>

                <Link
                  href="/create"
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg",
                    "text-sidebar-foreground hover:bg-sidebar-hover",
                    pathname === "/create" && "bg-sidebar-hover"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PlusCircle className="h-5 w-5 mr-3" />
                  Create
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 