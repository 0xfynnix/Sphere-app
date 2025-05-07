import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // 从请求头获取用户地址
    const address = request.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 获取请求体中的竞拍ID
    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // 查找竞拍帖子
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        bids: {
          orderBy: [
            { amount: 'desc' },
            { createdAt: 'asc' }
          ],
          include: {
            user: true
          }
        },
        lotteryPool: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 验证帖子是否属于当前用户
    if (post.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only process your own auctions' },
        { status: 403 }
      );
    }

    // 验证帖子是否已到期
    if (!post.biddingDueDate || new Date(post.biddingDueDate) > new Date()) {
      return NextResponse.json(
        { error: 'Auction has not expired yet' },
        { status: 400 }
      );
    }

    // 验证帖子是否允许竞拍且状态为已发布
    if (!post.allowBidding || post.status !== PostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'Auction is not active' },
        { status: 400 }
      );
    }

    // 如果没有竞拍记录，直接关闭竞拍
    if (post.bids.length === 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          allowBidding: false,
          biddingDueDate: null,
          startPrice: null,
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Auction closed with no bids'
      });
    }

    // 获取最高出价者
    const winningBid = post.bids[0];

    // 更新所有竞拍记录
    await prisma.bid.updateMany({
      where: { postId: post.id },
      data: { 
        round: post.auctionRound,
        isWinner: false,
        postId: undefined,
        lotteryPoolId: undefined
      }
    });

    // 更新获胜者的竞拍记录
    await prisma.bid.update({
      where: { id: winningBid.id },
      data: { 
        isWinner: true,
        postId: undefined,
        lotteryPoolId: undefined
      }
    });

    // 更新创作者的竞拍收益（80%）
    await prisma.user.update({
      where: { id: post.userId },
      data: {
        auctionEarnings: {
          increment: winningBid.amount * 0.8
        }
      }
    });

    // 如果有推荐人，更新推荐人的竞拍收益（5%）
    if (winningBid.referrerId) {
      await prisma.user.update({
        where: { id: winningBid.referrerId },
        data: {
          auctionEarnings: {
            increment: winningBid.amount * 0.05
          }
        }
      });
    }

    // 更新抽奖池金额（5%）
    if (post.lotteryPool) {
      await prisma.lotteryPool.update({
        where: { id: post.lotteryPool.id },
        data: {
          amount: {
            increment: winningBid.amount * 0.05
          }
        }
      });
    } else {
      await prisma.lotteryPool.create({
        data: {
          postId: post.id,
          amount: winningBid.amount * 0.05,
          round: post.auctionRound
        }
      });
    }

    // 更新帖子状态
    await prisma.post.update({
      where: { id: post.id },
      data: {
        userId: winningBid.userId,
        allowBidding: false,
        biddingDueDate: null,
        startPrice: null,
        currentHighestBid: null,
        status: PostStatus.PUBLISHED,
        auctionRound: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully processed auction',
      winner: {
        userId: winningBid.userId,
        amount: winningBid.amount
      }
    });
  } catch (error) {
    console.error('Error processing auction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process auction' },
      { status: 500 }
    );
  }
} 