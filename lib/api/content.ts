import { request } from './requests';
import { API_ENDPOINTS } from './requests';

export const contentApi = {
  // 创建内容
  create: async (formData: FormData) => {
    return request(API_ENDPOINTS.CONTENT.CREATE, {
      method: 'POST',
      body: formData,
      // 不要设置 Content-Type，让浏览器自动设置
      // 当发送 FormData 时，浏览器会自动设置正确的 Content-Type 和 boundary
    });
  },
}; 