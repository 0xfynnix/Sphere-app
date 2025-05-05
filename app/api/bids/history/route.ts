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

    const history = await prisma.auctionHistory.findMany({
      where: {
        postId
      },
      include: {
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
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching auction history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction history' },
      { status: 500 }
    );
  }
} 