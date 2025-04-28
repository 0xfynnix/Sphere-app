import { create } from 'zustand';

export interface Notification {
  id: number;
  type: 'comment' | 'like' | 'follow';
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  postTitle?: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'comment',
    user: {
      name: 'Alice',
    },
    content: 'Great post! I really enjoyed reading it.',
    postTitle: 'My First Post',
    timestamp: new Date('2024-03-20T10:00:00'),
    read: false,
  },
  {
    id: 2,
    type: 'like',
    user: {
      name: 'Bob',
    },
    content: 'liked your post',
    postTitle: 'My Second Post',
    timestamp: new Date('2024-03-21T15:30:00'),
    read: false,
  },
  {
    id: 3,
    type: 'follow',
    user: {
      name: 'Charlie',
    },
    content: 'started following you',
    timestamp: new Date('2024-03-22T09:15:00'),
    read: true,
  },
  {
    id: 4,
    type: 'comment',
    user: {
      name: 'David',
    },
    content: 'Interesting perspective. Thanks for sharing!',
    postTitle: 'My Third Post',
    timestamp: new Date('2024-03-23T14:20:00'),
    read: false,
  },
  {
    id: 5,
    type: 'like',
    user: {
      name: 'Eve',
    },
    content: 'liked your comment',
    postTitle: 'My First Post',
    timestamp: new Date('2024-03-24T11:45:00'),
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,
  addNotification: (notification) => 
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
})); 