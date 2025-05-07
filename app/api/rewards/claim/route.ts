import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 领取打赏奖励
export async function POST(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rewardId, type } = await req.json();
    
    if (!rewardId || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find reward
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
        include: {
          recipient: true,
          referrer: true,
        }
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      let amount = 0;
      const updateData = {
        recipientClaimed: false,
        referrerClaimed: false,
      };

      // 根据类型处理不同的领取逻辑
      switch (type) {
        case 'recipient':
          if (reward.recipientId !== user.id) {
            throw new Error('Not authorized to claim this reward');
          }
          if (reward.recipientClaimed) {
            throw new Error('Reward already claimed');
          }
          amount = reward.recipientAmount;
          updateData.recipientClaimed = true;
          break;

        case 'referrer':
          if (reward.referrerId !== user.id) {
            throw new Error('Not authorized to claim this reward');
          }
          if (reward.referrerClaimed) {
            throw new Error('Reward already claimed');
          }
          if (!reward.referrerAmount) {
            throw new Error('No referrer amount available');
          }
          amount = reward.referrerAmount;
          updateData.referrerClaimed = true;
          break;

        default:
          throw new Error('Invalid claim type');
      }

      // Update reward claim status
      await tx.reward.update({
        where: { id: rewardId },
        data: updateData
      });

      // Update user earnings
      if (type === 'recipient') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            rewardEarnings: {
              increment: amount
            }
          }
        });
      } else if (type === 'referrer') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            referredRewardEarnings: {
              increment: amount
            }
          }
        });
      }

      return { success: true, amount };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to claim reward' }, { status: 500 });
  }
}

// 获取未领取的打赏奖励
export async function GET(req: Request) {
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

    // Get unclaimed rewards as recipient
    const unclaimedRecipientRewards = await prisma.reward.findMany({
      where: {
        recipientId: user.id,
        recipientClaimed: false
      },
      include: {
        post: {
          select: {
            title: true,
            shareCode: true
          }
        },
        sender: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    // Get unclaimed rewards as referrer
    const unclaimedReferrerRewards = await prisma.reward.findMany({
      where: {
        referrerId: user.id,
        referrerClaimed: false,
        referrerAmount: {
          gt: 0
        }
      },
      include: {
        post: {
          select: {
            title: true,
            shareCode: true
          }
        },
        sender: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    return NextResponse.json({
      recipientRewards: unclaimedRecipientRewards,
      referrerRewards: unclaimedReferrerRewards
    });
  } catch (error) {
    console.error('Error fetching unclaimed rewards:', error);
    return NextResponse.json({ error: 'Failed to fetch unclaimed rewards' }, { status: 500 });
  }
} 