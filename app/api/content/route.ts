import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { text, title, imageInfo, biddingInfo } = await request.json();
    const address = request.headers.get('x-user-address');
    console.log(text, title, imageInfo);
    if (!text || !imageInfo || !title) {
      return NextResponse.json(
        { error: 'Text, title and image are required' },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    
    // 创建数据库记录
    const post = await prisma.post.create({
      data: {
        content: text,
        title: title,
        userId: user.id,
        allowBidding: !!biddingInfo,
        biddingDueDate: biddingInfo?.dueDate,
        startPrice: biddingInfo?.startPrice,
        ...(imageInfo.blobId ? {
          walrusImages: {
            create: {
              url: imageInfo.url,
              blobId: imageInfo.blobId,
              expiryDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000), // 53个epoch
            },
          },
        } : imageInfo.pathname ? {
          vercelBlobImages: {
            create: {
              url: imageInfo.url,
              pathname: imageInfo.pathname,
            },
          },
        } : {
          filebaseImages: {
            create: {
              url: imageInfo.url,
              cid: imageInfo.cid,
            },
          },
        }),
        status: PostStatus.PUBLISHED,
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
} 