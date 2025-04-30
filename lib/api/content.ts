import { request } from './requests';
import { API_ENDPOINTS } from './requests';

export const contentApi = {
  // 创建内容
  create: async (formData: FormData) => {
    return request(API_ENDPOINTS.CONTENT.CREATE, {
      method: 'POST',
      body: formData,
      headers: {} as HeadersInit, // Let the browser set the correct Content-Type for FormData
    });
  },
}; 