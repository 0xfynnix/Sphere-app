import { uploadImage as uploadToVercelBlob } from './vercelBlob';
import { uploadImage as uploadToWalrus } from './walrus';
import { uploadImage as uploadToFilebase, isServiceEnabled } from './filebase';

export interface UploadResult {
  url: string;
  blobId?: string;
  pathname?: string;
  cid?: string;
}

export interface UploadOptions {
  permanent?: boolean;
  epochs?: number;
  access?: 'public';
  addRandomSuffix?: boolean;
  bucket?: string;
  prefix?: string;
}

/**
 * 统一的图片上传服务
 * 根据环境变量决定使用哪个上传服务
 */
export async function uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  try {
    // 检查是否启用 Filebase
    if (isServiceEnabled()) {
      console.log('Using Filebase service for image upload');
      const result = await uploadToFilebase(file, {
        bucket: options.bucket || process.env.FILEBASE_BUCKET!,
        prefix: options.prefix,
      });
      return {
        url: result.url,
        cid: result.cid,
      };
    }
    // 检查是否启用 Vercel Blob
    else if (process.env.USE_VERCEL_BLOB === 'true') {
      console.log('Using Vercel Blob service for image upload');
      const result = await uploadToVercelBlob(file, {
        access: options.access,
        addRandomSuffix: options.addRandomSuffix,
      });
      return {
        url: result.url,
        pathname: result.pathname,
      };
    } else {
      console.log('Using Walrus service for image upload');
      const result = await uploadToWalrus(file, {
        permanent: options.permanent,
        epochs: options.epochs,
      });
      return {
        url: result.url,
        blobId: result.blobId,
      };
    }
  } catch (error) {
    console.error('Error in unified image upload service:', error);
    throw error;
  }
} 