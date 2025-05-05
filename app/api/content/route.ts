import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';

// 使用自定义字母表生成更短的ID
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
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

    // 获取用户帖子总数
    const total = await prisma.post.count({
      where: {
        userId: user.id,
        status: PostStatus.PUBLISHED
      }
    });

    // 获取分页的帖子列表
    const posts = await prisma.post.findMany({
      where: {
        userId: user.id,
        status: PostStatus.PUBLISHED
      },
      include: {
        walrusImages: true,
        vercelBlobImages: true,
        filebaseImages: true,
        lotteryPool: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // 将 filebaseImages 重命名为 images
    const processedPosts = posts.map(post => ({
      ...post,
      images: post.filebaseImages,
    }));

    return NextResponse.json({
      success: true,
      data: {
        posts: processedPosts,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
}

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
        shareCode: nanoid(), // 生成帖子分享码
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
        lotteryPool: {
          create: {
            amount: 0, // 初始金额为0
            round: 1, // 初始轮次为1
          }
        }
      },
      include: {
        lotteryPool: true
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