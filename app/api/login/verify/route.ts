import { NextResponse } from 'next/server';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { SuiGraphQLClient } from '@mysten/sui/graphql';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { customAlphabet } from 'nanoid';

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 使用自定义字母表生成更短的ID
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export async function POST(request: Request) {
  try {
    const { walletAddress, signature, challenge } = await request.json();

    if (!walletAddress || !signature || !challenge) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 查找挑战码
    const storedChallenge = await prisma.challenge.findFirst({
      where: {
        walletAddress,
        challenge,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!storedChallenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    // 验证签名
    const client = new SuiGraphQLClient({
      url: 'https://sui-testnet.mystenlabs.com/graphql',
    });

    const publicKey = await verifyPersonalMessageSignature(
      new TextEncoder().encode(challenge),
      signature,
      {
        client,
        address: walletAddress,
      }
    );

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 删除已使用的挑战码
    await prisma.challenge.delete({
      where: {
        id: storedChallenge.id,
      },
    });

    // 查找或创建用户
    const user = await prisma.user.upsert({
      where: {
        walletAddress,
      },
      create: {
        walletAddress,
        shareCode: nanoid(), // 创建用户时生成分享码
      },
      update: {},
    });

    // 生成 JWT token
    const token = jwt.sign(
      { walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error('Failed to verify signature:', error);
    return NextResponse.json(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
} 