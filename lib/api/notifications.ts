import { request } from "./requests";

export interface Notification {
  id: number;
  type: "auction end" | "auction win";
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  postTitle: string;
  postId: string;
  timestamp: Date;
  read: boolean;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  // 获取用户的所有通知
  getNotifications: async (): Promise<GetNotificationsResponse> => {
    return request("/api/notifications", {
      method: "GET",
    });
  },

  // 标记通知为已读
  markAsRead: async (notificationId: number): Promise<void> => {
    return request(`/api/notifications/${notificationId}/read`, {
      method: "POST",
    });
  },

  // 标记所有通知为已读
  markAllAsRead: async (): Promise<void> => {
    return request("/api/notifications/read-all", {
      method: "POST",
    });
  },
}; 