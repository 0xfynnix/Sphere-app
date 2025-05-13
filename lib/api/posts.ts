import { request } from "./requests";
import { API_ENDPOINTS } from "./requests";
import { Post, Comment, Pagination, UpdatePostAuctionRequest, RecommendResponse } from "./types";

export interface PostListItem {
  id: string;
  title: string;
  content: string;
  totalRewards: number;
  rewardCount: number;
  audienceCount: number;
  createdAt: string;
  user: {
    id: string;
    walletAddress: string;
    profile: {
      name: string | null;
      avatar: string | null;
    } | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  _count: {
    comments: number;
    bookmarks: number;
  };
  comments: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: string;
  }[];
  status: string;
  allowBidding: boolean;
  biddingDueDate: string | null;
  nftObjectId?: string | null;
  auctionRound: number;
  auctionHistory: {
    id: string;
    round: number;
    startPrice: number;
    biddingDueDate: string;
    totalBids: number;
    auctionObjectId: string;
    auctionCapObjectId: string;
    finalPrice: number | null;
    winner: {
      name: string;
      avatar: string | null;
    } | null;
  }[];
  images: {
    url: string;
    cid: string;
  }[];
}

export interface GetUserPostsResponse {
  success: boolean;
  data: {
    posts: PostListItem[];
    pagination: Pagination;
  };
}

export interface PopularPost {
  id: string;
  title: string;
  content: string;
  totalRewards: number;
  rewardCount: number;
  audienceCount: number;
  createdAt: string;
  user: {
    id: string;
    walletAddress: string;
    profile: {
      name: string | null;
      avatar: string | null;
    };
  };
  category: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
  _count: {
    comments: number;
    bookmarks: number;
  };
  images: {
    id: string;
    url: string;
  }[];
  rank: number;
}

export interface PopularPostsResponse {
  posts: PopularPost[];
  total: number;
}

export const postsApi = {
  // 上传图片
  uploadImage: async (image: File): Promise<{ url: string; cid: string }> => {
    const formData = new FormData();
    formData.append("image", image);
    return request(API_ENDPOINTS.IMAGES.UPLOAD, {
      method: "POST",
      body: formData,
    });
  },

  // 创建帖子
  create: async (data: {
    text: string;
    title: string;
    digest: string;
    imageInfo: { url: string; cid: string };
    biddingInfo?: {
      durationHours: number;
      durationMinutes: number;
      startPrice: number;
      auctionDigest?: string;
      auctionId?: string;
      auctionCapId?: string;
    };
    nftObjectId: string;
  }) => {
    return request(API_ENDPOINTS.CONTENT.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 获取帖子详情
  get: async (id: string): Promise<Post> => {
    return request<Post>(API_ENDPOINTS.POSTS.GET(id), {
      method: "GET",
    });
  },

  /**
   * 创建评论
   * @param postId 帖子ID
   * @param content 评论内容
   * @returns 创建的评论
   */
  createComment: async (postId: string, content: string): Promise<Comment> => {
    return request<Comment>(API_ENDPOINTS.POSTS.COMMENT(postId), {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  // 点赞/取消点赞
  toggleLike: async (postId: string): Promise<{ likes: number }> => {
    return request<{ likes: number }>(API_ENDPOINTS.POSTS.LIKE(postId), {
      method: "POST",
    });
  },

  // 获取用户帖子列表
  getUserPosts: async (params: {
    page?: number;
    pageSize?: number;
    address: string;
  }) => {
    const { page = 1, pageSize = 10, address } = params;
    return request<GetUserPostsResponse>(
      API_ENDPOINTS.CONTENT.LIST(page, pageSize, address),
      {
        method: "GET",
      }
    );
  },
    // 获取用户帖子列表
    getUserAllPosts: async (params: {
      page?: number;
      pageSize?: number;
      address: string;
    }) => {
      const { page = 1, pageSize = 10, address } = params;
      return request<GetUserPostsResponse>(
        API_ENDPOINTS.CONTENT.ALL(page, pageSize, address),
        {
          method: "GET",
        }
      );
    },
  

  updatePostAuction: async (data: UpdatePostAuctionRequest): Promise<Post> => {
    return request(`/api/posts/${data.postId}/auction`, {
      method: "POST",
      body: JSON.stringify(data.auctionInfo),
    });
  },

  /**
   * 获取推荐帖子
   */
  getRecommendedPosts: async () => {
    return request<RecommendResponse>(API_ENDPOINTS.POSTS.RECOMMEND, {
      method: "GET",
    });
  },

  getComments: async (postId: string, page: number = 1, pageSize: number = 10) => {
    return request<{
      comments: Array<{
        id: string;
        content: string;
        createdAt: string;
        user: {
          id: string;
          walletAddress: string;
          profile: {
            name: string | null;
            avatar: string | null;
          } | null;
        };
      }>;
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(API_ENDPOINTS.POSTS.COMMENTS(postId, page, pageSize), {
      method: "GET",
    });
  },

  /**
   * 获取热门帖子
   */
  getPopularPosts: async (): Promise<PopularPostsResponse> => {
    return request<PopularPostsResponse>(API_ENDPOINTS.POSTS.POPULAR, {
      method: "GET",
    });
  },

  // 获取用户关注的所有用户的帖子
  getFollowedUsersPosts: async (params: { page?: number; pageSize?: number}) => {
    const { page = 1, pageSize = 10 } = params;
    return request<GetUserPostsResponse>(
      `/api/follow/user?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  },
};
