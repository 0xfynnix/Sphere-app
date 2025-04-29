import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

// 挑战码过期时间（5分钟）
const CHALLENGE_EXPIRY = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // 生成随机挑战码
    const challenge = randomBytes(32).toString('hex');
    
    // 存储挑战码和过期时间
    const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRY);
    
    // 删除该钱包地址的旧挑战码
    await prisma.challenge.deleteMany({
      where: {
        walletAddress,
      },
    });
    
    // 创建新的挑战码
    await prisma.challenge.create({
      data: {
        walletAddress,
        challenge,
        expiresAt,
      },
    });

    // 清理过期的挑战码
    await prisma.challenge.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      data: {
        challenge,
      },
    });
  } catch (error) {
    console.error('Failed to generate challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
} 