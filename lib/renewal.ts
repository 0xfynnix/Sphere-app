import { WalrusClient } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { prisma } from './prisma';

// 初始化 Sui 客户端
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// 初始化 Walrus 客户端
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});

// 续期服务
export async function checkAndRenewImages() {
  try {
    // 获取30天内到期的图片
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const imagesToRenew = await prisma.walrusImage.findMany({
      where: {
        expiryDate: {
          lt: thirtyDaysFromNow
        }
      }
    });
    
    for (const image of imagesToRenew) {
      try {
        // 使用 Walrus 的续期功能
        const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(process.env.WALRUS_SIGNER_PRIVATE_KEY!, 'hex'));
        
        // 续期操作
        await walrusClient.extendBlob({
          blobObjectId: image.blobId,
          epochs: 53, // 续期53个epoch
          owner: keypair.getPublicKey().toSuiAddress(),
        });
        
        // 更新数据库中的到期时间
        await prisma.walrusImage.update({
          where: { id: image.id },
          data: { 
            expiryDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000) // 53个epoch
          }
        });
        
        console.log(`Successfully renewed image ${image.blobId}`);
      } catch (error) {
        console.error(`Failed to renew image ${image.blobId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in renewal service:', error);
    throw error;
  }
}

// 设置定时任务（每天运行一次）
export function startRenewalService() {
  // 立即运行一次
  checkAndRenewImages();
  
  // 设置每天运行
  setInterval(checkAndRenewImages, 24 * 60 * 60 * 1000);
} 