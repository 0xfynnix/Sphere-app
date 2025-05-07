import { GetTransactionsParams, GetTransactionsResponse } from './types';
import { request } from './requests';

/**
 * 获取用户交易记录
 * @param params 查询参数
 * @returns 交易记录列表
 */
export async function getTransactions(params: GetTransactionsParams = {}): Promise<GetTransactionsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }
  if (params.type) {
    searchParams.append('type', params.type);
  }
  if (params.status) {
    searchParams.append('status', params.status);
  }

  const queryString = searchParams.toString();
  const url = `/api/user/transactions${queryString ? `?${queryString}` : ''}`;

  return request<GetTransactionsResponse>(url, {
    method: 'GET',
  });
} 