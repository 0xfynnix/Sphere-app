import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 领取竞拍奖励
export async function POST(req: Request) {
  try {
    const address = req.headers.get('x-user-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bidId, type } = await req.json();
    
    if (!bidId || !type) {
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
      // Find bid
      const bid = await tx.bid.findUnique({
        where: { id: bidId },
        include: {
          post: {
            include: {
              user: true
            }
          },
          referrer: true,
        }
      });

      if (!bid) {
        throw new Error('Bid not found');
      }

      let amount = 0;
      const updateData = {
        creatorClaimed: false,
        referrerClaimed: false,
      };

      // 根据类型处理不同的领取逻辑
      switch (type) {
        case 'creator':
          if (bid.post?.user.id !== user.id) {
            throw new Error('Not authorized to claim this reward');
          }
          if (bid.creatorClaimed) {
            throw new Error('Reward already claimed');
          }
          if (!bid.creatorAmount) {
            throw new Error('No creator amount available');
          }
          amount = bid.creatorAmount;
          updateData.creatorClaimed = true;
          break;

        case 'referrer':
          if (bid.referrerId !== user.id) {
            throw new Error('Not authorized to claim this reward');
          }
          if (bid.referrerClaimed) {
            throw new Error('Reward already claimed');
          }
          if (!bid.referrerAmount) {
            throw new Error('No referrer amount available');
          }
          amount = bid.referrerAmount;
          updateData.referrerClaimed = true;
          break;

        default:
          throw new Error('Invalid claim type');
      }

      // Update bid claim status
      await tx.bid.update({
        where: { id: bidId },
        data: updateData
      });

      // Update user earnings
      if (type === 'creator') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            auctionEarnings: {
              increment: amount
            }
          }
        });
      } else if (type === 'referrer') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            referredAuctionEarnings: {
              increment: amount
            }
          }
        });
      }

      return { success: true, amount };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error claiming bid reward:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to claim bid reward' }, { status: 500 });
  }
}

// 获取未领取的竞拍奖励
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

    // Get unclaimed bids as creator
    const unclaimedCreatorBids = await prisma.bid.findMany({
      where: {
        post: {
          userId: user.id
        },
        creatorClaimed: false,
        creatorAmount: {
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
        user: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    // Get unclaimed bids as referrer
    const unclaimedReferrerBids = await prisma.bid.findMany({
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
        user: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    return NextResponse.json({
      creatorBids: unclaimedCreatorBids,
      referrerBids: unclaimedReferrerBids
    });
  } catch (error) {
    console.error('Error fetching unclaimed bid rewards:', error);
    return NextResponse.json({ error: 'Failed to fetch unclaimed bid rewards' }, { status: 500 });
  }
} 