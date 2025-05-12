import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 关注用户
export async function POST(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { followingId } = await req.json();
    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 });
    }

    // 获取当前用户
    const currentUser = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 检查是否已经关注
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
    }

    // 创建关注关系
    const follow = await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: followingId,
      },
      include: {
        following: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(follow);
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

// 取消关注
export async function DELETE(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { followingId } = await req.json();
    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 });
    }

    // 获取当前用户
    const currentUser = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 删除关注关系
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: followingId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}

// 获取关注关系
export async function GET(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const followingId = searchParams.get('followingId');

    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 });
    }

    // 获取当前用户
    const currentUser = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 查询关注关系
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: followingId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
  }
} 