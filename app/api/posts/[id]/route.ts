import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// 获取帖子详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // 先获取帖子基本信息以获取轮次信息
    const postBasic = await prisma.post.findUnique({
      where: { id },
      select: {
        lotteryRound: true,
        auctionRound: true
      }
    });

    if (!postBasic) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        comments: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        likes: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        walrusImages: true,
        vercelBlobImages: true,
        filebaseImages: true,
        lotteryPools: {
          where: {
            round: postBasic.lotteryRound
          },
          include: {
            winner: {
              include: {
                profile: true
              }
            }
          }
        },
        auctionHistory: {
          where: {
            round: postBasic.auctionRound
          },
          include: {
            winner: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.user.id,
        name: post.user.profile?.name || 'Anonymous',
        walletAddress: post.user.walletAddress,
        avatar: post.user.profile?.avatar
      },
      status: post.status,
      likes: post.likes.length,
      comments: post.comments.map((comment: Prisma.CommentGetPayload<{
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      }>) => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.user.id,
          name: comment.user.profile?.name || 'Anonymous',
          walletAddress: comment.user.walletAddress,
          avatar: comment.user.profile?.avatar
        },
        timestamp: comment.createdAt
      })),
      rewardCount: post.rewardCount,
      images: [
        ...post.walrusImages.map((img: { url: string }) => ({
          url: img.url,
          type: 'walrus'
        })),
        ...post.vercelBlobImages.map((img: { url: string }) => ({
          url: img.url,
          type: 'vercel'
        })),
        ...post.filebaseImages.map((img: { url: string }) => ({
          url: img.url,
          type: 'filebase'
        }))
      ],
      allowBidding: post.allowBidding,
      biddingDueDate: post.biddingDueDate,
      currentHighestBid: post.currentHighestBid,
      startPrice: post.startPrice,
      shareCode: post.shareCode,
      nftObjectId: post.nftObjectId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      // 添加当前轮次的奖池信息
      currentLotteryPool: post.lotteryPools[0] ? {
        id: post.lotteryPools[0].id,
        amount: post.lotteryPools[0].amount,
        round: post.lotteryPools[0].round,
        claimed: post.lotteryPools[0].claimed,
        winner: post.lotteryPools[0].winner ? {
          id: post.lotteryPools[0].winner.id,
          walletAddress: post.lotteryPools[0].winner.walletAddress,
          name: post.lotteryPools[0].winner.profile?.name || 'Anonymous',
          avatar: post.lotteryPools[0].winner.profile?.avatar
        } : null
      } : null,
      // 添加当前轮次的拍卖信息
      currentAuction: post.auctionHistory[0] ? {
        id: post.auctionHistory[0].id,
        round: post.auctionHistory[0].round,
        startPrice: post.auctionHistory[0].startPrice,
        finalPrice: post.auctionHistory[0].finalPrice,
        totalBids: post.auctionHistory[0].totalBids,
        biddingDueDate: post.auctionHistory[0].biddingDueDate,
        auctionObjectId: post.auctionHistory[0].auctionObjectId,
        auctionCapObjectId: post.auctionHistory[0].auctionCapObjectId,
        winner: post.auctionHistory[0].winner ? {
          id: post.auctionHistory[0].winner.id,
          walletAddress: post.auctionHistory[0].winner.walletAddress,
          name: post.auctionHistory[0].winner.profile?.name || 'Anonymous',
          avatar: post.auctionHistory[0].winner.profile?.avatar
        } : null
      } : null
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
} 