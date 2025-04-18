'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, User, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();
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
          "header-menu fixed top-16 right-0 bottom-0 w-64 bg-sidebar/95 backdrop-blur-sm",
          "transform transition-all duration-300 ease-in-out",
          "md:hidden z-50",
          "border-l border-sidebar-border/50",
          "shadow-lg shadow-black/10",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full overflow-y-auto">
          <nav className="space-y-1 p-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Button
                variant={pathname === '/' ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start transition-colors h-12",
                  pathname === '/' ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent"
                )}
              >
                <Home className="mr-3 h-5 w-5" />
                <span className="text-base">Home</span>
              </Button>
            </Link>
            {isSignedIn && (
              <>
                <Link href="/user?source=sidebar" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isUserPageFromSidebar ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start transition-colors h-12",
                      isUserPageFromSidebar ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent"
                    )}
                  >
                    <User className="mr-3 h-5 w-5" />
                    <span className="text-base">My Page</span>
                  </Button>
                </Link>
                <Link href="/create" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    className={cn(
                      "w-full h-12 mt-2",
                      "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                      "hover:from-purple-600 hover:to-pink-600",
                      "active:from-purple-700 active:to-pink-700",
                      "transition-all duration-200",
                      "shadow-md hover:shadow-lg active:shadow-sm",
                      "rounded-xl",
                      "font-semibold"
                    )}
                  >
                    <PlusCircle className="mr-3 h-5 w-5" />
                    <span className="text-base">Create Content</span>
                  </Button>
                </Link>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            {isSignedIn ? (
              <>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start transition-colors h-14",
                      "hover:bg-sidebar-accent",
                      pathname === '/profile' && "bg-sidebar-accent"
                    )}
                  >
                    <img
                      src={user?.imageUrl || "/logo.png"}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <div className="flex flex-col items-start">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-base text-sidebar-foreground">{user?.firstName}</span>
                        <Badge variant="outline" className="text-xs">Artist</Badge>
                      </div>
                      <span className="text-sm text-sidebar-accent-foreground">@user.sui</span>
                    </div>
                  </Button>
                </Link>
                <div className="mt-4">
                  <SignOutButton>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-12"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span className="text-base">Logout</span>
                    </Button>
                  </SignOutButton>
                </div>
              </>
            ) : (
              <div className="flex justify-end">
                <AuthDialog />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 