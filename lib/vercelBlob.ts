import { put } from '@vercel/blob';

// 允许的文件类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
// 文件大小限制：4.5MB（Vercel 的限制）
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export interface UploadResult {
  url: string;
  pathname: string;
}

export interface UploadOptions {
  access?: 'public';
  addRandomSuffix?: boolean;
}

/**
 * 检查服务是否启用
 */
export const isServiceEnabled = (): boolean => {
  return process.env.USE_VERCEL_BLOB === 'true';
};

/**
 * 上传图片到 Vercel Blob
 * @param file 要上传的文件
 * @param options 上传选项
 * @returns Promise<UploadResult>
 */
export const uploadImage = async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
  if (!isServiceEnabled()) {
    throw new Error('Vercel Blob service is not enabled');
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 4.5MB');
  }

  // 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Please use JPG, PNG, GIF or WebP');
  }

  try {
    const blob = await put(file.name, file, {
      access: options.access || 'public',
      addRandomSuffix: options.addRandomSuffix ?? true,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Failed to upload to Vercel Blob');
  }
}; 