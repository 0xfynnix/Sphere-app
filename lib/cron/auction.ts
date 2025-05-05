import { prisma } from '../prisma';
import { PostStatus } from '@prisma/client';

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
        }
      }
    });

    for (const post of expiredPosts) {
      // 如果没有竞拍记录，跳过
      if (post.bids.length === 0) {
        continue;
      }

      // 获取最高出价者（按金额降序，时间升序排序）
      const winningBid = post.bids[0];
      
      // 创建竞拍历史记录
      await prisma.auctionHistory.create({
        data: {
          postId: post.id,
          winnerId: winningBid.userId,
          finalPrice: winningBid.amount,
          totalBids: post.bids.length,
          startPrice: post.startPrice || 0,
          biddingDueDate: post.biddingDueDate || new Date()
        }
      });

      // 更新帖子所有者和竞拍状态
      await prisma.post.update({
        where: { id: post.id },
        data: {
          userId: winningBid.userId, // 更新所有者
          allowBidding: false, // 关闭竞拍，等待新所有者设置
          biddingDueDate: null, // 清空截止日期
          startPrice: null, // 清空起拍价
          status: PostStatus.PUBLISHED // 保持发布状态
        }
      });

      // 清空竞拍记录
      await prisma.bid.deleteMany({
        where: { postId: post.id }
      });

      console.log(`Processed expired auction for post ${post.id}, winner: ${winningBid.userId}`);
    }
  } catch (error) {
    console.error('Error processing expired auctions:', error);
  }
} 