import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications
export async function GET(request: Request) {
  try {
    const userAddress = request.headers.get('x-user-address');

    if (!userAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 获取用户ID
    const user = await prisma.user.findUnique({
      where: { walletAddress: userAddress },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 获取用户的通知
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        content: true,
        read: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // 获取未读通知数量
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    // 格式化通知数据
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      user: {
        name: notification.user.profile?.name || "Anonymous",
        avatar: notification.user.profile?.avatar,
      },
      content: notification.content,
      postTitle: notification.post.title,
      postId: notification.post.id,
      timestamp: notification.createdAt,
      read: notification.read,
    }));

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 