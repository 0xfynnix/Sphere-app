import { request } from './requests';
import { FollowResponse } from './types';

export const followUser = async (followingId: string): Promise<FollowResponse> => {
  return request('/api/follow', {
    method: 'POST',
    body: JSON.stringify({ followingId }),
  });
};

export const unfollowUser = async (followingId: string): Promise<{ success: boolean }> => {
  return request('/api/follow', {
    method: 'DELETE',
    body: JSON.stringify({ followingId }),
  });
};

export const checkFollowStatus = async (followingId: string): Promise<{ isFollowing: boolean }> => {
  return request(`/api/follow?followingId=${followingId}`, {
    method: 'GET',
  });
}; 