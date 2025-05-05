import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const address = request.headers.get("x-user-address");
    if (!address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { postId, amount, signature } = await request.json();

    if (!postId || !amount || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 验证帖子是否存在且允许竞拍
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { bids: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.allowBidding) {
      return NextResponse.json(
        { error: "Bidding is not allowed for this post" },
        { status: 400 }
      );
    }

    if (post.biddingDueDate && new Date(post.biddingDueDate) < new Date()) {
      return NextResponse.json({ error: "Bidding has ended" }, { status: 400 });
    }

    // 验证出价是否高于当前最高出价或起拍价
    const currentHighestBid =
      post.bids.length > 0
        ? Math.max(...post.bids.map((bid) => bid.amount))
        : post.startPrice || 0;

    if (amount <= currentHighestBid) {
      return NextResponse.json(
        { error: "Bid amount must be higher than current highest bid" },
        { status: 400 }
      );
    }

    // 创建竞拍记录
    const bid = await prisma.bid.create({
      data: {
        amount,
        postId,
        userId: user.id,
        chainId: signature, // 暂时使用签名作为链上ID
      },
      include: {
        user: {
          select: {
            id: true,
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

    return NextResponse.json({
      success: true,
      bid: {
        ...bid,
        user: {
          id: bid.user.id,
          name: bid.user.profile?.name || "Anonymous",
          avatar: bid.user.profile?.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const bids = await prisma.bid.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
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

    return NextResponse.json({
      success: true,
      bids: bids.map((bid) => ({
        ...bid,
        user: {
          id: bid.user.id,
          name: bid.user.profile?.name || "Anonymous",
          avatar: bid.user.profile?.avatar,
        },
      })),
    });
  } catch (error) {
    console.error("Error getting bids:", error);
    return NextResponse.json({ error: "Failed to get bids" }, { status: 500 });
  }
}
