import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/read-all
export async function POST(request: Request,) {
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

    // 标记该用户的所有未读通知为已读
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 