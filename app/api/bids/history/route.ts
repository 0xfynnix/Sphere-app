import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // 获取帖子的所有竞拍记录，按轮次和金额排序
    const bids = await prisma.bid.findMany({
      where: {
        postId
      },
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
      orderBy: [
        { round: 'desc' },
        { amount: 'desc' }
      ]
    });

    // 按轮次分组
    const history = bids.reduce((acc, bid) => {
      if (!acc[bid.round]) {
        acc[bid.round] = {
          round: bid.round,
          bids: [],
          winner: null
        };
      }
      acc[bid.round].bids.push(bid);
      if (bid.isWinner) {
        acc[bid.round].winner = bid.user;
      }
      return acc;
    }, {} as Record<number, {
      round: number;
      bids: typeof bids;
      winner: typeof bids[0]['user'] | null;
    }>);

    return NextResponse.json({ 
      history: Object.values(history).sort((a, b) => b.round - a.round)
    });
  } catch (error) {
    console.error('Error fetching auction history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction history' },
      { status: 500 }
    );
  }
} 