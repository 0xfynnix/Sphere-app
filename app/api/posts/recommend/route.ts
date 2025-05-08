import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus, Prisma } from "@prisma/client";
import { Post } from "@/lib/api/types";

// 定义基础权重常量
const BASE_WEIGHTS = {
  NEW_POST: 2.0,        // 新帖子基础权重（24小时内）
  NORMAL_POST: 1.0,     // 普通帖子基础权重
  MIN_REWARD: 0.5,      // 最小打赏权重
  MAX_REWARD: 5.0,      // 最大打赏权重
  TIME_DECAY_DAYS: 7,   // 时间衰减天数
  MIN_TIME_DECAY: 0.5,  // 最小时间衰减
  BOOKMARK_WEIGHT: 0.5  // 收藏权重
};

// 定义查询参数
const QUERY_PARAMS = {
  MAX_POSTS: 100,      // 每个策略最大查询帖子数
  TIME_RANGE_DAYS: 30,  // 查询时间范围（天）
  RECOMMEND_COUNT: 20   // 推荐帖子数量
};

// 定义曝光度区间和对应的权重
const AUDIENCE_WEIGHTS = {
  TIER_1: { min: 1, max: 120, weight: 1 },    // 1-120 观众
  TIER_2: { min: 121, max: 360, weight: 2 },  // 121-360 观众
  TIER_3: { min: 361, max: 1200, weight: 3 }, // 361-1200 观众
  TIER_4: { min: 1201, max: 3600, weight: 4 }, // 1201-3600 观众
  TIER_5: { min: 3601, weight: 5 }            // 3601+ 观众
};

// 定义查询策略
type QueryStrategy = {
  weight: number;
  query: {
    orderBy: Record<string, Prisma.SortOrder | { _count: Prisma.SortOrder }>;
    take: number;
  };
};

const QUERY_STRATEGIES: Record<string, QueryStrategy> = {
  RECENT: {
    weight: 0.3,
    query: {
      orderBy: { updatedAt: Prisma.SortOrder.desc },
      take: QUERY_PARAMS.MAX_POSTS
    }
  },
  POPULAR: {
    weight: 0.3,
    query: {
      orderBy: { totalRewards: Prisma.SortOrder.desc },
      take: QUERY_PARAMS.MAX_POSTS
    }
  },
  ENGAGED: {
    weight: 0.2,
    query: {
      orderBy: { audienceCount: Prisma.SortOrder.desc },
      take: QUERY_PARAMS.MAX_POSTS
    }
  },
  BOOKMARKED: {
    weight: 0.2,
    query: {
      orderBy: { bookmarks: { _count: Prisma.SortOrder.desc } },
      take: QUERY_PARAMS.MAX_POSTS
    }
  }
};

// 计算帖子的推荐权重
function calculatePostWeight(post: Post) {
  // 基础权重（新帖子获得更高权重）
  const isNewPost = (Date.now() - new Date(post.createdAt).getTime()) < 24 * 60 * 60 * 1000;
  const baseWeight = isNewPost ? BASE_WEIGHTS.NEW_POST : BASE_WEIGHTS.NORMAL_POST;
  
  // 打赏权重（使用对数函数，并限制在最小和最大权重之间）
  const rewardWeight = Math.min(
    BASE_WEIGHTS.MAX_REWARD,
    Math.max(
      BASE_WEIGHTS.MIN_REWARD,
      Math.log10(post.totalRewards + 1) * 2
    )
  );
  
  // 观众数权重
  let audienceWeight = 1;
  const audienceCount = post.audienceCount;
  
  if (audienceCount <= AUDIENCE_WEIGHTS.TIER_1.max) {
    audienceWeight = AUDIENCE_WEIGHTS.TIER_1.weight;
  } else if (audienceCount <= AUDIENCE_WEIGHTS.TIER_2.max) {
    audienceWeight = AUDIENCE_WEIGHTS.TIER_2.weight;
  } else if (audienceCount <= AUDIENCE_WEIGHTS.TIER_3.max) {
    audienceWeight = AUDIENCE_WEIGHTS.TIER_3.weight;
  } else if (audienceCount <= AUDIENCE_WEIGHTS.TIER_4.max) {
    audienceWeight = AUDIENCE_WEIGHTS.TIER_4.weight;
  } else {
    audienceWeight = AUDIENCE_WEIGHTS.TIER_5.weight;
  }

  // 时间衰减因子
  const daysSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const timeDecay = Math.max(
    BASE_WEIGHTS.MIN_TIME_DECAY,
    1 - (daysSinceCreation / BASE_WEIGHTS.TIME_DECAY_DAYS)
  );

  // 互动权重（考虑评论和收藏）
  const interactionWeight = 1 + (
    (post._count?.comments || 0) * 0.3 + 
    (post._count?.bookmarks || 0) * BASE_WEIGHTS.BOOKMARK_WEIGHT
  ) / 100;

  // 最终权重 = 基础权重 * 打赏权重 * 观众权重 * 时间衰减 * 互动权重
  return baseWeight * rewardWeight * audienceWeight * timeDecay * interactionWeight;
}

// 加权随机选择
function weightedRandomSelect(posts: Post[], weights: number[], count: number) {
  // 如果帖子数量为0，直接返回空数组
  if (posts.length === 0) {
    return [];
  }

  // 如果所有权重都是0，使用完全随机选择
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) {
    const shuffled = [...posts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, posts.length));
  }

  const selectedPosts: Post[] = [];
  const postsCopy = [...posts];
  const weightsCopy = [...weights];
  
  while (selectedPosts.length < count && postsCopy.length > 0) {
    let random = Math.random() * totalWeight;
    let index = 0;
    
    while (random > 0 && index < weightsCopy.length) {
      random -= weightsCopy[index];
      index++;
    }
    
    index = Math.max(0, index - 1);
    selectedPosts.push(postsCopy[index]);
    
    // 从数组中移除已选择的帖子
    postsCopy.splice(index, 1);
    weightsCopy.splice(index, 1);
  }
  
  return selectedPosts;
}

export async function GET() {
  try {
    // 计算时间范围
    const timeRange = new Date();
    timeRange.setDate(timeRange.getDate() - QUERY_PARAMS.TIME_RANGE_DAYS);

    // 基础查询条件
    const baseWhere = {
      status: PostStatus.PUBLISHED,
      createdAt: {
        gte: timeRange
      }
    };

    // 获取不同策略的帖子
    const strategyResults = await Promise.all(
      Object.entries(QUERY_STRATEGIES).map(async ([strategy, config]) => {
        const posts = await prisma.post.findMany({
          where: baseWhere,
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
            _count: {
              select: {
                comments: true,
                bookmarks: true,
              },
            },
          },
          ...config.query
        });

        return {
          strategy,
          posts,
          weight: config.weight
        };
      })
    );

    // 合并所有策略的结果，去重
    const allPosts = new Map();
    strategyResults.forEach(({ posts, weight }) => {
      posts.forEach(post => {
        if (!allPosts.has(post.id)) {
          allPosts.set(post.id, { post, weight });
        } else {
          // 如果帖子已存在，累加权重
          const existing = allPosts.get(post.id);
          existing.weight += weight;
        }
      });
    });

    // 转换为数组
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