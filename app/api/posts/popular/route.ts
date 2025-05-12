import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

// 定义查询参数
const QUERY_PARAMS = {
  POPULAR_COUNT: 20    // 返回的帖子数量
};

export async function GET() {
  try {
    // 获取所有已发布的帖子
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED
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
        category: true,
        tags: true,
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
      orderBy: {
        totalRewards: 'desc',
      },
      take: QUERY_PARAMS.POPULAR_COUNT,
    });

    // 格式化返回数据
    const formattedPosts = posts.map((post, index) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      totalRewards: post.totalRewards,
      audienceCount: post.audienceCount,
      createdAt: post.createdAt.toISOString(),
      user: {
        id: post.user.id,
        walletAddress: post.user.walletAddress,
        profile: post.user.profile || { name: null, avatar: null }
      },
      category: post.category,
      tags: post.tags,
      _count: post._count,
      images: post.filebaseImages,
      rank: index + 1
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total: formattedPosts.length,
    });
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular posts" },
      { status: 500 }
    );
  }
} 