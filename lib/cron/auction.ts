import { prisma } from '../prisma';
import { PostStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';

// 使用自定义字母表生成更短的ID
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export async function processExpiredAuctions() {
  try {
    // 获取所有已到期的竞拍帖子
    const expiredPosts = await prisma.post.findMany({
      where: {
        allowBidding: true,
        biddingDueDate: {
          lte: new Date()
        },
        status: PostStatus.PUBLISHED
      },
      include: {
        bids: {
          orderBy: [
            { amount: 'desc' },
            { createdAt: 'asc' }
          ],
          include: {
            user: true
          }
        },
        lotteryPool: true
      }
    });

    for (const post of expiredPosts) {
      // 如果没有竞拍记录，跳过
      if (post.bids.length === 0) {
        continue;
      }

      // 获取最高出价者（按金额降序，时间升序排序）
      const winningBid = post.bids[0];
      



      // 更新所有竞拍记录，设置轮次并解除与帖子的关联
      await prisma.bid.updateMany({
        where: { postId: post.id },
        data: { 
          round: post.auctionRound,
          isWinner: false,
          postId: undefined,
          lotteryPoolId: undefined
        }
      });

      // 更新获胜者的竞拍记录
      await prisma.bid.update({
        where: { id: winningBid.id },
        data: { 
          isWinner: true,
          postId: undefined,
          lotteryPoolId: undefined
        }
      });

      // 更新创作者的竞拍收益（80%）
      await prisma.user.update({
        where: { id: post.userId },
        data: {
          auctionEarnings: {
            increment: winningBid.amount * 0.8 // 创作者获得80%
          }
        }
      });

      // 如果有推荐人，更新推荐人的竞拍收益（5%）
      if (winningBid.referrerId) {
        await prisma.user.update({
          where: { id: winningBid.referrerId },
          data: {
            auctionEarnings: {
              increment: winningBid.amount * 0.05 // 推荐人获得5%
            }
          }
        });
      }

      // 更新抽奖池金额（5%）
      if (post.lotteryPool) {
        await prisma.lotteryPool.update({
          where: { id: post.lotteryPool.id },
          data: {
            amount: {
              increment: winningBid.amount * 0.05 // 抽奖池获得5%
            }
          }
        });
      } else {
        // 如果没有抽奖池，创建一个新的
        await prisma.lotteryPool.create({
          data: {
            postId: post.id,
            amount: winningBid.amount * 0.05, // 抽奖池获得5%
            round: post.auctionRound // 设置当前轮次
          }
        });
      }

      // 更新帖子所有者和竞拍状态
      await prisma.post.update({
        where: { id: post.id },
        data: {
          userId: winningBid.userId,
          shareCode: nanoid(),
          allowBidding: false,
          biddingDueDate: null,
          startPrice: null,
          status: PostStatus.PUBLISHED,
          auctionRound: {
            increment: 1 // 增加竞拍轮次
          }
        }
      });

      console.log(`Processed expired auction for post ${post.id}, winner: ${winningBid.userId}`);
    }
  } catch (error) {
    console.error('Error processing expired auctions:', error);
  }
} 