import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取收藏状态
export async function GET(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    // 获取当前用户
    const currentUser = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 查询收藏关系
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: currentUser.id,
        },
      },
    });

    return NextResponse.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return NextResponse.json({ error: 'Failed to check bookmark status' }, { status: 500 });
  }
} 