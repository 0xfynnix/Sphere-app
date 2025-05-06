import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json(
        { error: "Ref parameter is required" },
        { status: 400 }
      );
    }

    const [userShareCode, postShareCode] = ref.split('-');

    if (!userShareCode || !postShareCode) {
      return NextResponse.json(
        { error: "Invalid ref format" },
        { status: 400 }
      );
    }

    // 查找用户和帖子
    const [user, post] = await Promise.all([
      prisma.user.findFirst({
        where: { shareCode: userShareCode },
        select: { walletAddress: true }
      }),
      prisma.post.findFirst({
        where: { shareCode: postShareCode },
        select: { id: true }
      })
    ]);

    if (!user || !post) {
      return NextResponse.json(
        { error: "User or post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        postId: post.id
      }
    });
  } catch (error) {
    console.error("Error fetching ref data:", error);
    return NextResponse.json(
      { error: "Failed to fetch ref data" },
      { status: 500 }
    );
  }
} 