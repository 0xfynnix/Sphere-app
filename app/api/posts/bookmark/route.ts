import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 收藏帖子
export async function POST(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();
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

    // 查找帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 检查是否已经收藏
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: currentUser.id,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json({ error: 'Already bookmarked this post' }, { status: 400 });
    }

    // 创建收藏关系
    const bookmark = await prisma.bookmark.create({
      data: {
        postId: postId,
        userId: currentUser.id,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, bookmark });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    return NextResponse.json({ error: 'Failed to bookmark post' }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();
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

    // 检查收藏是否存在
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: currentUser.id,
        },
      },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // 删除收藏关系
    await prisma.bookmark.delete({
      where: {
        id: bookmark.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
} 