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

    const { postId, amount, digest, ref } = await request.json();

    if (!postId || !amount || !digest) {
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

    let referrer = null;
    let postShareCode = null;

    // If ref is provided, try to find referrer and validate post share code
    if (ref) {
      const [userShareCode, refPostShareCode] = ref.split('-');
      if (userShareCode && refPostShareCode) {
        // Validate post share code
        if (post.shareCode === refPostShareCode) {
          postShareCode = refPostShareCode;
          // Find referrer
          referrer = await prisma.user.findFirst({
            where: {
              shareCode: userShareCode
            }
          });
        }
      }
    }

    // 创建竞拍记录
    const bid = await prisma.bid.create({
      data: {
        amount,
        postId,
        userId: user.id,
        round: post.auctionRound, // 设置当前轮次
        referrerId: referrer?.id, // 添加推荐人ID
        transactions: {
          create: {
            digest,
            userId: user.id,
            postId,
            type: 'place_bid',
            status: 'success',
            data: {
              amount,
              round: post.auctionRound,
              ref,
              referrerId: referrer?.id,
              postShareCode,
            },
          },
        },
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

    // 更新帖子的当前最高竞拍价
    await prisma.post.update({
      where: { id: postId },
      data: {
        currentHighestBid: amount
      }
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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.bid.count({
        where: { postId }
      })
    ]);

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
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Error getting bids:", error);
    return NextResponse.json({ error: "Failed to get bids" }, { status: 500 });
  }
}
