import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { Post, Comment } from './types';

export const postsApi = {
  // 创建帖子
  create: async (formData: FormData) => {
    return request(API_ENDPOINTS.CONTENT.CREATE, {
      method: 'POST',
      body: formData,
      // 不要设置 Content-Type，让浏览器自动设置
      // 当发送 FormData 时，浏览器会自动设置正确的 Content-Type 和 boundary
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
}; 