import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const { ref, amount, postId } = await req.json();
    
    if (!amount || !postId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Find post
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        user: true,
        lotteryPool: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

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
      // Create reward record
      const reward = await tx.reward.create({
        data: {
          postId: post.id,
          amount: amount,
          referrerId: referrer?.id
        }
      });

      // If we have a valid referrer and post share code, use the original split
      if (referrer && postShareCode) {
        // Update post owner's earnings (80%)
        await tx.user.update({
          where: { id: post.userId },
          data: {
            rewardEarnings: {
              increment: amount * 0.8
            }
          }
        });

        // Update referrer's earnings (5%)
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            rewardEarnings: {
              increment: amount * 0.05
            }
          }
        });

        // Update or create lottery pool (5%)
        if (post.lotteryPool) {
          await tx.lotteryPool.update({
            where: { id: post.lotteryPool.id },
            data: {
              amount: {
                increment: amount * 0.05
              }
            }
          });
        } else {
          await tx.lotteryPool.create({
            data: {
              postId: post.id,
              amount: amount * 0.05
            }
          });
        }
      } else {
        // If no valid referrer or post share code, give 85% to creator
        await tx.user.update({
          where: { id: post.userId },
          data: {
            rewardEarnings: {
              increment: amount * 0.85
            }
          }
        });

        // Update or create lottery pool (5%)
        if (post.lotteryPool) {
          await tx.lotteryPool.update({
            where: { id: post.lotteryPool.id },
            data: {
              amount: {
                increment: amount * 0.05
              }
            }
          });
        } else {
          await tx.lotteryPool.create({
            data: {
              postId: post.id,
              amount: amount * 0.05
            }
          });
        }
      }

      return reward;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing reward:', error);
    return NextResponse.json({ error: 'Failed to process reward' }, { status: 500 });
  }
} 