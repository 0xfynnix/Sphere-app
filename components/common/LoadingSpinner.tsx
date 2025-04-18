'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export function LoadingSpinner({ fullScreen = false, text = 'Loading...', className = '' }: LoadingSpinnerProps) {
  const content = (
    <div className="flex h-screen justify-center items-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
} 