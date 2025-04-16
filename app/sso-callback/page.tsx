'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { Suspense } from 'react';

function SSOCallbackContent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Signing in...</h2>
        <p className="text-muted-foreground">Please wait while we process your login request</p>
      </div>
    </div>
  );
}

export default function SSOCallback() {
  return (
    <Suspense fallback={<SSOCallbackContent />}>
      <div id="clerk-captcha">
        <AuthenticateWithRedirectCallback />
      </div>
    </Suspense>
  );
} 