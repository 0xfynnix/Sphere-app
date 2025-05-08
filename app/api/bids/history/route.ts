import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuctionHistory, Bid } from '@prisma/client';

type AuctionHistoryWithRelations = AuctionHistory & {
  bids: (Bid & {
    user: {
      id: string;
      walletAddress: string;
      profile: {
        name: string | null;
        avatar: string | null;
      } | null;
    };
  })[];
  winner: {
    id: string;
    walletAddress: string;
    profile: {
      name: string | null;
      avatar: string | null;
    } | null;
  } | null;
};

export async function GET(
  request: Request,
  // { params }: { params: { postId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // 获取帖子的所有拍卖历史记录，按轮次排序
    const auctionHistories = await prisma.auctionHistory.findMany({
      where: {
        postId
      },
      include: {
        bids: {
          include: {
            user: {
              select: {
                id: true,
                walletAddress: true,
                profile: {
                  select: {
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: {
            amount: 'desc'
          }
        },
        winner: {
          select: {
            id: true,
            walletAddress: true,
            profile: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        round: 'desc'
      }
    }) as AuctionHistoryWithRelations[];

    // 格式化返回数据
    const history = auctionHistories.map(history => ({
      id: history.id,
      round: history.round,
      startPrice: history.startPrice,
      finalPrice: history.finalPrice,
      totalBids: history.totalBids,
      biddingDueDate: history.biddingDueDate,
      bids: history.bids.map(bid => ({
        ...bid,
        user: {
          id: bid.user.id,
          walletAddress: bid.user.walletAddress,
          name: bid.user.profile?.name || 'Anonymous',
          avatar: bid.user.profile?.avatar
        }
      })),
      winner: history.winner ? {
        id: history.winner.id,
        walletAddress: history.winner.walletAddress,
        name: history.winner.profile?.name || 'Anonymous',
        avatar: history.winner.profile?.avatar
      } : null
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching auction history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction history' },
      { status: 500 }
    );
  }
} 