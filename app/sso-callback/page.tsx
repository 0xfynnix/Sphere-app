'use client';

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div>
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback />
    </div>
  );
} 