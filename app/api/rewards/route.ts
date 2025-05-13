import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Function to calculate random audience growth based on amount
function calculateRandomAudienceGrowth(amount: number): number {
  if (amount >= 1 && amount < 3) {
    return Math.floor(Math.random() * 120) + 1; // 1-120 audiences for 1 SUI
  } else if (amount >= 3 && amount < 10) {
    return Math.floor(Math.random() * 240) + 120; // 120-360 audiences for 3 SUI
  } else if (amount >= 10 && amount < 30) {
    return Math.floor(Math.random() * 840) + 360; // 360-1200 audiences for 10 SUI
  } else if (amount >= 30) {
    return Math.floor(Math.random() * 2400) + 1200; // 1200-3600 audiences for 30 SUI
  }
  return 0;
}

export async function POST(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { ref, amount, postId, digest } = await req.json();
    
    if (!amount || !postId || !digest) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Find post
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        user: true,
        creator: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 获取当前轮次的奖池
    const currentLotteryPool = await prisma.lotteryPool.findFirst({
      where: {
        postId: post.id,
        round: post.lotteryRound
      }
    });

    let referrer = null;
    let postShareCode = null;

    // If ref is provided, try to find referrer and validate post share code
    if (ref) {
      const [userShareCode, refPostShareCode] = ref.split('-');
      if (userShareCode && refPostShareCode) {
        // Validate post share code
        if (post.shareCode === refPostShareCode) {
          postShareCode = refPostShareCode;
          // Find referrer
          referrer = await prisma.user.findFirst({
            where: {
              shareCode: userShareCode
            }
          });
        }
      }
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate amounts for each party
      let recipientAmount, referrerAmount, platformAmount, lotteryAmount;

      if (referrer && postShareCode) {
        // With referrer: 80% to creator, 5% to referrer, 5% to lottery, 10% to platform
        recipientAmount = amount * 0.8;
        referrerAmount = amount * 0.05;
        lotteryAmount = amount * 0.05;
        platformAmount = amount * 0.1;
      } else {
        // Without referrer: 85% to creator, 5% to lottery, 10% to platform
        recipientAmount = amount * 0.85;
        referrerAmount = null;
        lotteryAmount = amount * 0.05;
        platformAmount = amount * 0.1;
      }

      // Calculate random audience growth
      const audienceGrowth = calculateRandomAudienceGrowth(amount);

      // Create reward record with all amounts
      const reward = await tx.reward.create({
        data: {
          postId: post.id,
          amount: amount,
          senderId: user.id,
          recipientId: post.userId,
          referrerId: referrer?.id,
          lotteryPoolId: currentLotteryPool?.id,
          // Record amounts for each party
          recipientAmount,
          referrerAmount,
          platformAmount,
          lotteryAmount,
          // All claims start as false
          recipientClaimed: false,
          referrerClaimed: false,
          platformClaimed: false,
        }
      });

      // Update post's audience count
      await tx.post.update({
        where: { id: post.id },
        data: {
          audienceCount: {
            increment: audienceGrowth
          },
          rewardCount: {
            increment: 1
          }
        }
      });

      // Create transaction record
      await tx.suiTransaction.create({
        data: {
          digest: digest,
          userId: user.id,
          postId: post.id,
          rewardId: reward.id,
          type: "reward",
          status: "success",
          data: {
            amount,
            ref,
            referrerId: referrer?.id,
            postShareCode,
            senderId: user.id,
            recipientId: post.userId,
            recipientAmount,
            referrerAmount,
            platformAmount,
            lotteryAmount
          }
        }
      });

      // Update or create lottery pool with direct amount update
      if (currentLotteryPool) {
        await tx.lotteryPool.update({
          where: { id: currentLotteryPool.id },
          data: {
            amount: {
              increment: lotteryAmount
            }
          }
        });
      } else {
        throw new Error('Lottery pool not found');
      }

      return reward;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing reward:', error);
    return NextResponse.json({ error: 'Failed to process reward' }, { status: 500 });
  }
}