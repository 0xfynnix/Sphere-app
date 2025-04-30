import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import sharp from 'sharp';

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
  // 将 File 转换为 Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 使用 sharp 压缩图片
  const compressedBuffer = await sharp(buffer)
    .resize(1200, 1200, { // 限制最大尺寸
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 80 }) // 转换为 webp 格式，质量 80%
    .toBuffer();

  // 创建新的 File 对象
  return new File([compressedBuffer], file.name, { type: 'image/webp' });
}

function getEd25519PrivateKey(suiPrivateKey: string): Uint8Array {
  const { schema, secretKey } = decodeSuiPrivateKey(suiPrivateKey);
  if (schema !== 'ED25519') {
    throw new Error('Invalid key schema. Expected ED25519');
  }
  
  return secretKey;
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
    const privateKey = getEd25519PrivateKey(process.env.WALRUS_SIGNER_PRIVATE_KEY!);
    const keypair = Ed25519Keypair.fromSecretKey(privateKey);
    
    // 压缩图片
    const compressedFile = await compressImage(file);
    
    // 将文件转换为 Uint8Array
    const arrayBuffer = await compressedFile.arrayBuffer();
    const blob = new Uint8Array(arrayBuffer);
    
    // 确定存储时间
    const epochs = options.permanent ? 53 : (options.epochs || 3);
    
    // 上传到 Walrus
    const { blobId } = await walrusClient.writeBlob({
      blob,
      deletable: false,
      epochs,
      signer: keypair,
    });
    
    // 返回 blob ID
    return {
      blobId,
      url: blobId // 使用 blobId 作为临时标识
    };
  } catch (error) {
    console.error('Error uploading to Walrus:', error);
    throw new Error('Failed to upload to Walrus');
  }
}

export async function getImageData(blobId: string): Promise<Uint8Array | null> {
  try {
    const result = await walrusClient.readBlob({ blobId });
    return result;
  } catch (error) {
    console.error('Error reading image data:', error);
    return null;
  }
}

export async function checkImageAvailability(blobId: string): Promise<boolean> {
  try {
    await walrusClient.readBlob({ blobId });
    return true;
  } catch (error) {
    console.error('Error checking image availability:', error);
    return false;
  }
}