import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取某个用户关注的所有用户的post列表集合接口
export async function GET(req: Request) {
  try {
    // 获取用户地址
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // 获取查询的用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 获取用户关注的所有用户的ID
    const followingIds = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });

    const followingUserIds = followingIds.map(follow => follow.followingId);

    // 查询这些用户的帖子
    const posts = await prisma.post.findMany({
      where: {
        userId: { in: followingUserIds },
      },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: skip,
    });

    // 查询总数
    const totalCount = await prisma.post.count({
      where: {
        userId: { in: followingUserIds },
      },
    });

    // 计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching followed users posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
} 