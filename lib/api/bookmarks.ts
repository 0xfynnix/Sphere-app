import { request } from './requests';
import { BookmarkResponse, BookmarkStatusResponse, PaginatedPostsResponse } from './types';

export const bookmarkPost = async (postId: string): Promise<BookmarkResponse> => {
  return request('/api/posts/bookmark', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  });
};

export const unbookmarkPost = async (postId: string): Promise<{ success: boolean }> => {
  return request('/api/posts/bookmark', {
    method: 'DELETE',
    body: JSON.stringify({ postId }),
  });
};

export const getUserBookmarks = async (userAddress: string, page: number = 1, pageSize: number = 10): Promise<PaginatedPostsResponse> => {
  return request(`/api/posts/bookmarks?userAddress=${userAddress}&page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
};

export const checkBookmarkStatus = async (postId: string): Promise<BookmarkStatusResponse> => {
  return request(`/api/posts/bookmark/status?postId=${postId}`, {
    method: 'GET',
  });
}; 