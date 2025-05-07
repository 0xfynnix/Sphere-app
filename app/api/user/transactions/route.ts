import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const address = request.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;

    // 计算分页偏移量
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = {
      userId: user.id,
      ...(type && { type }),
      ...(status && { status }),
    };

    // 获取总记录数
    const total = await prisma.suiTransaction.count({ where });

    // 获取分页数据
    const transactions = await prisma.suiTransaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        reward: {
          select: {
            id: true,
            amount: true,
          },
        },
        bid: {
          select: {
            id: true,
            amount: true,
            isWinner: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return NextResponse.json(
      { error: '获取交易记录失败' },
      { status: 500 }
    );
  }
} 