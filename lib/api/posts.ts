import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { Post, Comment, Pagination } from './types';

export interface GetUserPostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: Pagination;
  };
}

export const postsApi = {
  // 上传图片
  uploadImage: async (image: File): Promise<{ url: string; cid: string }> => {
    const formData = new FormData();
    formData.append('image', image);
    return request(API_ENDPOINTS.IMAGES.UPLOAD, {
      method: 'POST',
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
      dueDate: Date;
      startPrice: number;
    },
    nftObjectId: string;
  }) => {
    return request(API_ENDPOINTS.CONTENT.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取帖子详情
  get: async (id: string): Promise<Post> => {
    return request<Post>(API_ENDPOINTS.POSTS.GET(id), {
      method: 'GET',
    });
  },

  // 创建评论
  createComment: async (postId: string, content: string): Promise<Comment> => {
    return request<Comment>(API_ENDPOINTS.POSTS.COMMENT(postId), {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // 点赞/取消点赞
  toggleLike: async (postId: string): Promise<{ likes: number }> => {
    return request<{ likes: number }>(API_ENDPOINTS.POSTS.LIKE(postId), {
      method: 'POST',
    });
  },

  // 获取用户帖子列表
  getUserPosts: async (params: { page?: number; pageSize?: number; address: string }) => {
    const { page = 1, pageSize = 10, address } = params;
    return request<GetUserPostsResponse>(API_ENDPOINTS.CONTENT.LIST(page, pageSize, address), {
      method: 'GET',
    });
  },
}; 