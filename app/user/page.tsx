'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function UserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 这里应该从用户认证信息中获取当前用户的ID
    // 目前使用模拟的ID
    const currentUserId = "alice123";
    const source = searchParams.get('source');
    // 保留 source 参数
    const redirectUrl = source ? `/user/${currentUserId}?source=${source}` : `/user/${currentUserId}`;
    router.push(redirectUrl);
  }, [router, searchParams]);

  return null;
} 