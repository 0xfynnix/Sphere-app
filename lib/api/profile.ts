import { request } from './requests';
import { API_ENDPOINTS } from './requests';
import { UpdateProfileRequest, UpdateProfileResponse } from './types';

export const profileApi = {
  // 更新个人资料
  update: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.bio) formData.append('bio', data.bio);
    if (data.avatar) formData.append('avatar', data.avatar);

    return request(API_ENDPOINTS.PROFILE.UPDATE, {
      method: 'PATCH',
      body: formData,
    });
  },
}; 