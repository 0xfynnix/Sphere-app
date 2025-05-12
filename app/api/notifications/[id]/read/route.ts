import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/[id]/read
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userAddress = request.headers.get('x-user-address');

    if (!userAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id: notificationId } = await context.params;
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

    // 确保通知属于该用户
    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(notificationId),
        userId: user.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // 标记通知为已读
    await prisma.notification.update({
      where: { id: notification.id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 