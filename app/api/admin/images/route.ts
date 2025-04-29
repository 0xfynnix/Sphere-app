import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const imageRecord = await request.json();
    
    // 保存到数据库
    await prisma.walrusImage.create({
      data: {
        id: imageRecord.id,
        blobId: imageRecord.blobId,
        url: imageRecord.url,
        expiryDate: new Date(imageRecord.expiryDate),
        createdAt: new Date(imageRecord.createdAt)
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving image record:', error);
    return NextResponse.json(
      { error: 'Failed to save image record' },
      { status: 500 }
    );
  }
}

// 获取所有需要续期的图片
export async function GET() {
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
    
    return NextResponse.json(imagesToRenew);
  } catch (error) {
    console.error('Error fetching images to renew:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
} 