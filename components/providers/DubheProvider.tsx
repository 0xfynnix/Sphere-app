'use client';

import { useEffect } from 'react';
import { useDubheStore } from '@/store/dubheStore';
import { dubheConfig } from '@/config/dubhe.config';

export default function DubheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize, isInitialized } = useDubheStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize(dubheConfig);
    }
  }, [initialize, isInitialized]);

  return <>{children}</>;
} 