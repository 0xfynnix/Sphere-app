import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        comments: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        likes: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        walrusImages: true,
        vercelBlobImages: true,
        filebaseImages: true,
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.user.id,
        name: post.user.profile?.name || 'Anonymous',
        avatar: post.user.profile?.avatar
      },
      likes: post.likes.length,
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.user.id,
          name: comment.user.profile?.name || 'Anonymous',
          avatar: comment.user.profile?.avatar
        },
        timestamp: comment.createdAt
      })),
      images: [
        ...post.walrusImages.map(img => ({
          url: img.url,
          type: 'walrus'
        })),
        ...post.vercelBlobImages.map(img => ({
          url: img.url,
          type: 'vercel'
        })),
        ...post.filebaseImages.map(img => ({
          url: img.url,
          type: 'filebase'
        }))
      ],
      allowBidding: post.allowBidding,
      biddingDueDate: post.biddingDueDate,
      startPrice: post.startPrice,
      shareCode: post.shareCode,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
} 