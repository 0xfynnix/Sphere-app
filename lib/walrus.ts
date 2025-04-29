import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// 初始化 Sui 客户端
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// 初始化 Walrus 客户端
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});

// 文件大小限制：5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// 允许的文件类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface UploadResult {
  url: string;
  blobId: string;
}

export interface UploadOptions {
  epochs?: number; // 存储的epoch数量，默认3个epoch
  permanent?: boolean; // 是否永久存储，如果为true则使用最大epochs
}

// 压缩图片
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: 'image/webp' }));
        }, 'image/webp', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB');
  }

  // 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Please use JPG, PNG, GIF or WebP');
  }

  try {
    // 压缩图片
    const compressedFile = await compressImage(file);
    
    // 将文件转换为 Uint8Array
    const arrayBuffer = await compressedFile.arrayBuffer();
    const blob = new Uint8Array(arrayBuffer);
    
    // 确定存储时间
    const epochs = options.permanent ? 53 : (options.epochs || 3);
    
    // 上传到 Walrus
    const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(process.env.WALRUS_SIGNER_PRIVATE_KEY!, 'hex'));
    const { blobId } = await walrusClient.writeBlob({
      blob,
      deletable: false,
      epochs,
      signer: keypair,
    });
    
    // 返回存储 URL 和 blob ID
    return {
      url: `https://walrus.app/blob/${blobId}`,
      blobId
    };
  } catch (error) {
    console.error('Error uploading to Walrus:', error);
    throw new Error('Failed to upload to Walrus');
  }
}

export async function getImageUrl(blobId: string): Promise<string> {
  return `https://walrus.app/blob/${blobId}`;
}

export async function checkImageAvailability(blobId: string): Promise<boolean> {
  try {
    const result = await walrusClient.readBlob({ blobId });
    return result !== null;
  } catch (error) {
    console.error('Error checking image availability:', error);
    return false;
  }
} 