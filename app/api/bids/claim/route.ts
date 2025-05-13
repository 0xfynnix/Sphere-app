import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 领取竞拍奖励
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
      // Find all unclaimed bids based on type
      const unclaimedBids = await tx.bid.findMany({
        where: {
          ...(type === 'creator' ? {
            creatorId: user.id,
            creatorClaimed: false,
            creatorAmount: {
              gt: 0
            }
          } : {
            referrerId: user.id,
            referrerClaimed: false,
            referrerAmount: {
              gt: 0
            }
          }),
        },
        include: {
          post: {
            include: {
              user: true
            }
          },
          referrer: true,
        }
      });

      if (unclaimedBids.length === 0) {
        throw new Error('No unclaimed rewards found');
      }

      let totalAmount = 0;

      // Process each bid
      for (const bid of unclaimedBids) {
        const updateData = {
          creatorClaimed: false,
          referrerClaimed: false,
        };

        if (type === 'creator') {
          if (bid.creatorClaimed) {
            continue; // Skip if already claimed
          }
          if (!bid.creatorAmount) {
            continue; // Skip if no amount available
          }
          totalAmount += bid.creatorAmount;
          updateData.creatorClaimed = true;
        } else {
          if (bid.referrerId !== user.id) {
            continue; // Skip if not authorized
          }
          if (bid.referrerClaimed) {
            continue; // Skip if already claimed
          }
          if (!bid.referrerAmount) {
            continue; // Skip if no amount available
          }
          totalAmount += bid.referrerAmount;
          updateData.referrerClaimed = true;
        }

        // Update bid claim status
        await tx.bid.update({
          where: { id: bid.id },
          data: updateData
        });
      }

      // Update user earnings
      if (type === 'creator') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            auctionEarnings: {
              increment: totalAmount
            }
          }
        });
      } else if (type === 'referrer') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            referredAuctionEarnings: {
              increment: totalAmount
            }
          }
        });
      }

      // Create SuiTransaction record
      const transaction = await tx.suiTransaction.create({
        data: {
          digest,
          type: type === 'creator' ? 'claim creator bid' : 'claim referrer bid',
          status: 'SUCCESS',
          userId: user.id,
          data: {
            totalAmount,
            processedCount: unclaimedBids.length,
            type
          }
        }
      });

      return { 
        success: true, 
        totalAmount, 
        processedCount: unclaimedBids.length,
        transaction 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error claiming bid rewards:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to claim bid rewards' }, { status: 500 });
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
        creatorId: user.id,
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
        },
        auctionHistory: {
          select: {
            id: true,
            auctionObjectId: true
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
        },
        auctionHistory: {
          select: {
            id: true,
            auctionObjectId: true
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