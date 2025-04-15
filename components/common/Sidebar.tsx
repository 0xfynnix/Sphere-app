/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, User, PlusCircle, LogOut } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { logger } from '@/lib/utils';
import { useEffect } from 'react';
import { Badge } from '../ui/badge';

export default function Sidebar() {
  const pathname = usePathname();
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    logger.debug('Sidebar - Authentication state changed', { isSignedIn, user, isLoaded });
  }, [isSignedIn, user, isLoaded]);

  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 fixed left-0 top-0 flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-center mb-8">
          <Image
            src="/logo.png"
            alt="Sphere Logo"
            width={32}
            height={32}
            className="rounded-full mr-2"
          />
          <h1 className="text-xl font-bold">Sphere</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/">
            <Button
              variant={pathname === '/' ? 'default' : 'ghost'}
              className={cn(
                "w-full justify-start transition-colors",
                pathname === '/' ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-gray-200"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          {isSignedIn && (
            <Link href="/my-page">
              <Button
                variant={pathname === '/my-page' ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start transition-colors",
                  pathname === '/my-page' ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-gray-200"
                )}
              >
                <User className="mr-2 h-4 w-4" />
                My Page
              </Button>
            </Link>
          )}
        </nav>

        {isSignedIn && (
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

      <div className="p-4 border-t border-gray-200">
        {isSignedIn ? (
          <>
            <Link href="/profile">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start transition-colors h-12",
                  "hover:bg-gray-200",
                  pathname === '/profile' && "bg-gray-200"
                )}
              >
                <img
                  src={user?.imageUrl || "/logo.png"}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
                <div className="flex flex-col items-start">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{user?.firstName}</span>
                    <Badge variant="outline" className="text-xs">Artist</Badge>
                  </div>
                  <span className="text-xs text-gray-500">@user.sui</span>
                </div>
              </Button>
            </Link>
            <div className="mt-4">
              <SignOutButton>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
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
  );
} 