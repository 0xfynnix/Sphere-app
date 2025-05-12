import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { Prisma } from "@prisma/client";
import { RecommendedPost } from "@/lib/api/types";

// 定义基础权重常量
// const BASE_WEIGHTS = {
//   NEW_POST: 2.0,        // 新帖子基础权重（24小时内）
//   NORMAL_POST: 1.0,     // 普通帖子基础权重
//   MIN_REWARD: 0.5,      // 最小打赏权重
//   MAX_REWARD: 5.0,      // 最大打赏权重
//   TIME_DECAY_DAYS: 7,   // 时间衰减天数
//   MIN_TIME_DECAY: 0.5,  // 最小时间衰减
//   BOOKMARK_WEIGHT: 0.5  // 收藏权重
// };

// 定义查询参数
const QUERY_PARAMS = {
  MAX_POSTS: 100,      // 每个策略最大查询帖子数
  TIME_RANGE_DAYS: 30,  // 查询时间范围（天）
  RECOMMEND_COUNT: 20   // 推荐帖子数量
};

// 定义曝光度区间和对应的权重
// const AUDIENCE_WEIGHTS = {
//   TIER_1: { min: 1, max: 120, weight: 1 },    // 1-120 观众
//   TIER_2: { min: 121, max: 360, weight: 2 },  // 121-360 观众
//   TIER_3: { min: 361, max: 1200, weight: 3 }, // 361-1200 观众
//   TIER_4: { min: 1201, max: 3600, weight: 4 }, // 1201-3600 观众
//   TIER_5: { min: 3601, weight: 5 }            // 3601+ 观众
// };

// 定义查询策略
// type QueryStrategy = {
//   weight: number;
//   query: {
//     orderBy: Record<string, Prisma.SortOrder | { _count: Prisma.SortOrder }>;
//     take: number;
//   };
// };

// const QUERY_STRATEGIES: Record<string, QueryStrategy> = {
//   RECENT: {
//     weight: 0.3,
//     query: {
//       orderBy: { updatedAt: Prisma.SortOrder.desc },
//       take: QUERY_PARAMS.MAX_POSTS
//     }
//   },
//   POPULAR: {
//     weight: 0.3,
//     query: {
//       orderBy: { totalRewards: Prisma.SortOrder.desc },
//       take: QUERY_PARAMS.MAX_POSTS
//     }
//   },
//   ENGAGED: {
//     weight: 0.2,
//     query: {
//       orderBy: { audienceCount: Prisma.SortOrder.desc },
//       take: QUERY_PARAMS.MAX_POSTS
//     }
//   },
//   BOOKMARKED: {
//     weight: 0.2,
//     query: {
//       orderBy: { bookmarks: { _count: Prisma.SortOrder.desc } },
//       take: QUERY_PARAMS.MAX_POSTS
//     }
//   }
// };

// 计算帖子权重
function calculatePostWeight(post: RecommendedPost): number {
  // 基础权重
  let weight = 1;

  // 根据打赏金额增加权重
  weight += post.totalRewards * 0.1;

  // 根据观众数量增加权重
  weight += post.audienceCount * 0.05;

  // 根据评论数量增加权重
  weight += post._count.comments * 0.2;

  // 根据收藏数量增加权重
  weight += post._count.bookmarks * 0.15;

  // 根据发布时间调整权重（越新权重越高）
  const postDate = new Date(post.createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
  weight *= Math.exp(-hoursDiff / 24); // 24小时衰减因子

  return weight;
}

// 加权随机选择
function weightedRandomSelect<T>(items: T[], weights: number[], count: number): T[] {
  const selected: T[] = [];
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  while (selected.length < count && items.length > 0) {
    let random = Math.random() * totalWeight;
    let selectedIndex = -1;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }
    
    if (selectedIndex === -1) {
      selectedIndex = items.length - 1;
    }
    
    selected.push(items[selectedIndex]);
    items.splice(selectedIndex, 1);
    weights.splice(selectedIndex, 1);
  }
  
  return selected;
}

export async function GET() {
  try {
    // 计算时间范围
    const timeRange = new Date();
    timeRange.setDate(timeRange.getDate() - QUERY_PARAMS.TIME_RANGE_DAYS);

    // 获取所有已发布的帖子
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
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
        createdAt: "desc",
      },
    });

    // 合并所有策略的结果，去重
    const allPosts = new Map<string, { post: RecommendedPost; weight: number }>();
    posts.forEach(post => {
      const recommendedPost: RecommendedPost = {
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
        images: post.filebaseImages
      };

      if (!allPosts.has(post.id)) {
        allPosts.set(post.id, { 
          post: recommendedPost, 
          weight: calculatePostWeight(recommendedPost) 
        });
      } else {
        // 如果帖子已存在，累加权重
        const existing = allPosts.get(post.id);
        if (existing) {
          existing.weight += calculatePostWeight(recommendedPost);
        }
      }
    });

    // 将 Map 转换为数组
    const uniquePosts = Array.from(allPosts.values()).map(({ post }) => post);

    // 如果没有帖子，直接返回空数组
    if (uniquePosts.length === 0) {
      return NextResponse.json({
        posts: [],
        total: 0,
      });
    }

    // 如果帖子数量少于20条，直接返回所有帖子
    if (uniquePosts.length <= QUERY_PARAMS.RECOMMEND_COUNT) {
      return NextResponse.json({
        posts: uniquePosts,
        total: uniquePosts.length,
      });
    }

    // 计算每个帖子的最终权重
    const weights = uniquePosts.map(post => calculatePostWeight(post));
    
    // 使用加权随机选择指定数量的帖子
    let recommendedPosts = weightedRandomSelect(uniquePosts, weights, QUERY_PARAMS.RECOMMEND_COUNT);

    // 如果选择的帖子数量不足20条，随机补充
    if (recommendedPosts.length < QUERY_PARAMS.RECOMMEND_COUNT) {
      const remainingCount = QUERY_PARAMS.RECOMMEND_COUNT - recommendedPosts.length;
      const selectedIds = new Set(recommendedPosts.map(post => post.id));
      const remainingPosts = uniquePosts.filter(post => !selectedIds.has(post.id));
      
      // 随机打乱剩余帖子
      const shuffledRemaining = [...remainingPosts].sort(() => Math.random() - 0.5);
      // 补充到推荐列表中
      recommendedPosts = [...recommendedPosts, ...shuffledRemaining.slice(0, remainingCount)];
    }

    return NextResponse.json({
      posts: recommendedPosts,
      total: uniquePosts.length,
    });
  } catch (error) {
    console.error("Error fetching recommended posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended posts" },
      { status: 500 }
    );
  }
} 