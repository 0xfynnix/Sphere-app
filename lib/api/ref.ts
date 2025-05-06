import { request } from "./requests";

export interface RefData {
  walletAddress: string;
  postId: string;
}

export const getRefData = async (ref: string): Promise<RefData> => {
  const response = await request<{ success: boolean; data: RefData }>(`/api/ref?ref=${ref}`);
  return response.data;
}; 