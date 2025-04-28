'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const { user } = useUserStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
    // TODO: Call API to mark notification as read
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    // TODO: Call API to mark all notifications as read
  };

  const handleViewPost = (postId: string) => {
    // TODO: Navigate to post
    console.log('View post:', postId);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                "p-4 hover:shadow-lg transition-shadow",
                !notification.read && "bg-muted/50"
              )}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  {notification.user.avatar ? (
                    <AvatarImage src={notification.user.avatar} />
                  ) : (
                    <AvatarFallback>
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{notification.user.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  {notification.postTitle && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Commented on &ldquo;{notification.postTitle}&rdquo;
                    </p>
                  )}
                  <p className="text-sm">{notification.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {notification.postTitle && (
                      <Button variant="outline" size="sm" onClick={() => handleViewPost(notification.id.toString())}>
                        View Post
                      </Button>
                    )}
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 