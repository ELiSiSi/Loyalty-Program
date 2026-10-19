export interface ApiResponse<T = any> {
  success: boolean;
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export const successResponse = <T>(
  data?: T,
  message?: string,
  meta?: ApiResponse['meta']
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    status: 'success',
  };

  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  if (meta) response.meta = meta;

  return response;
};
