import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
interface PostReward {
  post: {
    id: string;
    title: string;
    shareCode: string;
    content: string;
    createdAt: Date;
    nftObjectId: string | null;
    user: {
      walletAddress: string;
      profile: {
        name: string | null;
        avatar: string | null;
      } | null;
    };
  };
  totalAmount: number;
  rewards: Array<{
    id: string;
    amount: number;
    sender: {
      walletAddress: string;
      profile: {
        name: string | null;
        avatar: string | null;
      } | null;
    };
    createdAt: Date;
  }>;
}
// 领取打赏奖励
export async function POST(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, digest } = await req.json();
    
    if (!type || !digest) {
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
      // Find all unclaimed rewards based on type
      const unclaimedRewards = await tx.reward.findMany({
        where: {
          ...(type === 'recipient' ? {
            recipientId: user.id,
            recipientClaimed: false
          } : {
            referrerId: user.id,
            referrerClaimed: false,
            referrerAmount: {
              gt: 0
            }
          }),
        },
        include: {
          recipient: true,
          referrer: true,
        }
      });

      if (unclaimedRewards.length === 0) {
        throw new Error('No unclaimed rewards found');
      }

      let totalAmount = 0;

      // Process each reward
      for (const reward of unclaimedRewards) {
        const updateData = {
          recipientClaimed: false,
          referrerClaimed: false,
        };

        if (type === 'recipient') {
          if (reward.recipientId !== user.id) {
            continue; // Skip if not authorized
          }
          if (reward.recipientClaimed) {
            continue; // Skip if already claimed
          }
          totalAmount += reward.recipientAmount;
          updateData.recipientClaimed = true;
        } else {
          if (reward.referrerId !== user.id) {
            continue; // Skip if not authorized
          }
          if (reward.referrerClaimed) {
            continue; // Skip if already claimed
          }
          if (!reward.referrerAmount) {
            continue; // Skip if no amount available
          }
          totalAmount += reward.referrerAmount;
          updateData.referrerClaimed = true;
        }

        // Update reward claim status
        await tx.reward.update({
          where: { id: reward.id },
          data: updateData
        });
      }

      // Update user earnings
      if (type === 'recipient') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            rewardEarnings: {
              increment: totalAmount
            }
          }
        });
      } else if (type === 'referrer') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            referredRewardEarnings: {
              increment: totalAmount
            }
          }
        });
      }

      // Create SuiTransaction record
      const transaction = await tx.suiTransaction.create({
        data: {
          digest,
          type: type === 'recipient' ? 'claim recipient reward' : 'claim referrer reward',
          status: 'SUCCESS',
          userId: user.id,
          data: {
            totalAmount,
            processedCount: unclaimedRewards.length,
            type
          }
        }
      });

      return { 
        success: true, 
        totalAmount, 
        processedCount: unclaimedRewards.length,
        transaction 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error claiming rewards:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to claim rewards' }, { status: 500 });
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
            id: true,
            title: true,
            shareCode: true,
            content: true,
            createdAt: true,
            nftObjectId: true,
            user: {
              select: {
                walletAddress: true,
                profile: {
                  select: {
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          }
        },
        sender: {
          select: {
            walletAddress: true,
            profile: {
              select: {
                name: true,
                avatar: true
              }
            }
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
            id: true,
            title: true,
            shareCode: true,
            content: true,
            createdAt: true,
            nftObjectId: true,
            user: {
              select: {
                walletAddress: true,
                profile: {
                  select: {
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          }
        },
        sender: {
          select: {
            walletAddress: true,
            profile: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    // Group recipient rewards by post
    const recipientPosts = unclaimedRecipientRewards.reduce<Record<string, PostReward>>((acc, reward) => {
      const postId = reward.post.id;
      if (!acc[postId]) {
        acc[postId] = {
          post: reward.post,
          totalAmount: 0,
          rewards: []
        };
      }
      acc[postId].totalAmount += reward.recipientAmount;
      acc[postId].rewards.push({
        id: reward.id,
        amount: reward.recipientAmount,
        sender: reward.sender,
        createdAt: reward.createdAt
      });
      return acc;
    }, {});

    // Group referrer rewards by post
    const referrerPosts = unclaimedReferrerRewards.reduce<Record<string, PostReward>>((acc, reward) => {
      const postId = reward.post.id;
      if (!acc[postId]) {
        acc[postId] = {
          post: reward.post,
          totalAmount: 0,
          rewards: []
        };
      }
      if (reward.referrerAmount) {
        acc[postId].totalAmount += reward.referrerAmount;
        acc[postId].rewards.push({
          id: reward.id,
          amount: reward.referrerAmount,
          sender: reward.sender,
          createdAt: reward.createdAt
        });
      }
      return acc;
    }, {});

    return NextResponse.json({
      recipientPosts: Object.values(recipientPosts),
      referrerPosts: Object.values(referrerPosts)
    });
  } catch (error) {
    console.error('Error fetching unclaimed rewards:', error);
    return NextResponse.json({ error: 'Failed to fetch unclaimed rewards' }, { status: 500 });
  }
} 