import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';
import { uploadImage } from '@/lib/imageUpload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const image = formData.get('image') as File;
    const address = request.headers.get('x-user-address');
    
    if (!text || !image) {
      return NextResponse.json(
        { error: 'Text and image are required' },
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

    // 上传图片
    const uploadResult = await uploadImage(image, { permanent: true });
    
    // 创建数据库记录
    const post = await prisma.post.create({
      data: {
        content: text,
        title: text.substring(0, 100),
        userId: user.id,
        ...(uploadResult.blobId ? {
          walrusImages: {
            create: {
              url: uploadResult.url,
              blobId: uploadResult.blobId,
              expiryDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000), // 53个epoch
            },
          },
        } : uploadResult.pathname ? {
          vercelBlobImages: {
            create: {
              url: uploadResult.url,
              pathname: uploadResult.pathname,
            },
          },
        } : {
          filebaseImages: {
            create: {
              url: uploadResult.url,
              cid: uploadResult.cid!,
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