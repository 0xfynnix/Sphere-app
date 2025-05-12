import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取用户收藏列表 - 公共接口，不需要认证
export async function GET(req: Request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    if (!userAddress) {
      return NextResponse.json({ error: 'Missing userAddress parameter' }, { status: 400 });
    }

    // 获取查询的用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: userAddress },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 查询收藏的总数
    const totalCount = await prisma.bookmark.count({
      where: {
        userId: user.id,
      },
    });

    // 查询收藏列表
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      include: {
        post: {
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
            walrusImages: {
              select: {
                id: true,
                url: true,
              },
            },
            vercelBlobImages: {
              select: {
                id: true,
                url: true,
              },
            },
            filebaseImages: {
              select: {
                id: true,
                url: true,
              },
            },
            _count: {
              select: {
                comments: true,
                bookmarks: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: skip,
    });

    // 整理响应数据
    const posts = bookmarks.map((bookmark) => {
      const post = bookmark.post;
      const images = [
        ...post.filebaseImages.map((img) => ({ id: img.id, url: img.url })),
      ];
      const thumbnails = post.filebaseImages.map((img) => ({ id: img.id, thumbnailUrl: img.url }));

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        totalRewards: post.totalRewards,
        audienceCount: post.audienceCount,
        createdAt: post.createdAt,
        user: {
          id: post.user.id,
          walletAddress: post.user.walletAddress,
          profile: post.user.profile,
        },
        category: post.category,
        _count: post._count,
        x: images,
        thumbnails: thumbnails,
        bookmarkedAt: bookmark.createdAt,
      };
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
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
} 