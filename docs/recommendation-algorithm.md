# 帖子推荐算法设计文档

## 概述

Sphered的推荐算法设计。该算法基于帖子的打赏金额、观众数量、发布时间和用户互动等多个因素，通过加权随机选择的方式为用户推荐内容。在系统初始阶段或权重数据不足时，会采用完全随机推荐机制确保内容分发。

## 推荐策略

### 1. 多维度查询策略

系统采用多个维度的查询策略来获取候选帖子：

```typescript
const QUERY_STRATEGIES = {
  RECENT: {
    weight: 0.3,  // 权重0.3
    query: {
      orderBy: { updatedAt: 'desc' },
      take: 100
    }
  },
  POPULAR: {
    weight: 0.3,  // 权重0.3
    query: {
      orderBy: { totalRewards: 'desc' },
      take: 100
    }
  },
  ENGAGED: {
    weight: 0.2,  // 权重0.2
    query: {
      orderBy: { audienceCount: 'desc' },
      take: 100
    }
  },
  BOOKMARKED: {
    weight: 0.2,  // 权重0.2
    query: {
      orderBy: { bookmarks: { _count: 'desc' } },
      take: 100
    }
  }
};
```

每个策略的特点：
- RECENT：获取最新更新的帖子
- POPULAR：获取打赏金额最高的帖子
- ENGAGED：获取观众数最多的帖子
- BOOKMARKED：获取收藏数最多的帖子

### 2. 基础权重

为了确保新帖子和无打赏的帖子也能获得推荐机会，引入了基础权重机制：

```typescript
const BASE_WEIGHTS = {
  NEW_POST: 2.0,        // 新帖子基础权重（24小时内）
  NORMAL_POST: 1.0,     // 普通帖子基础权重
  MIN_REWARD: 0.5,      // 最小打赏权重
  MAX_REWARD: 5.0,      // 最大打赏权重
  TIME_DECAY_DAYS: 7,   // 时间衰减天数
  MIN_TIME_DECAY: 0.5,  // 最小时间衰减
  BOOKMARK_WEIGHT: 0.5  // 收藏权重
};
```

### 3. 打赏金额权重

- 使用对数函数处理打赏金额，避免金额差异过大
- 设置最小和最大权重限制
- 计算公式：`Math.min(MAX_REWARD, Math.max(MIN_REWARD, Math.log10(post.totalRewards + 1) * 2))`
- 特点：
  - 无打赏帖子获得最小权重（0.5）
  - 高额打赏帖子权重上限为5.0
  - 随着打赏金额增加，权重增长逐渐放缓

### 4. 观众数权重

根据帖子的观众数量（audienceCount）分为5个等级：

```typescript
TIER_1: 1-120 观众 = 权重1
TIER_2: 121-360 观众 = 权重2
TIER_3: 361-1200 观众 = 权重3
TIER_4: 1201-3600 观众 = 权重4
TIER_5: 3601+ 观众 = 权重5
```

### 5. 时间衰减因子

- 最近7天的帖子获得更高权重
- 权重随时间线性衰减，最低不低于0.5
- 计算公式：`Math.max(MIN_TIME_DECAY, 1 - (daysSinceCreation / TIME_DECAY_DAYS))`

### 6. 互动权重

考虑帖子的评论和收藏数据：
- 评论权重：0.3
- 收藏权重：0.5
- 计算公式：`1 + (comments * 0.3 + bookmarks * 0.5) / 100`

## 推荐流程

### 1. 多策略查询
- 并行执行多个查询策略
- 每个策略获取100条帖子
- 合并所有策略的结果并去重
- 对重复出现的帖子累加其策略权重

### 2. 数据量处理
- 如果总数据量少于20条，直接返回所有数据
- 如果总数据量大于20条，进行加权随机选择
- 如果加权随机选择后不足20条，从剩余未选择的帖子中随机补充

### 3. 权重计算

最终权重计算公式：
```typescript
最终权重 = 基础权重 * 打赏权重 * 观众权重 * 时间衰减 * 互动权重 * 策略权重
```

### 4. 加权随机选择

1. 特殊情况处理：
   - 如果没有帖子，返回空数组
   - 如果所有权重都是0，使用完全随机选择
   - 如果帖子数量少于请求数量，返回所有可用帖子

2. 正常情况处理：
   - 计算所有帖子的权重
   - 计算总权重
   - 生成随机数
   - 根据权重比例选择帖子
   - 移除已选择的帖子，避免重复

## API 接口

### 获取推荐帖子

```
GET /api/posts/recommend
```

### 返回数据格式

```typescript
{
  posts: [
    {
      id: string,
      title: string,
      content: string,
      totalRewards: number,
      audienceCount: number,
      user: {
        id: string,
        walletAddress: string,
        profile: {
          name: string,
          avatar: string
        }
      },
      category: Category,
      tags: Tag[],
      _count: {
        comments: number,
        bookmarks: number
      }
    }
    // ... 更多帖子
  ],
  total: number // 总帖子数
}
```

## TODO

1. 权重调整
   - 可以根据实际运行效果调整各策略的权重值
   - 可以调整时间衰减的周期（当前是7天）
   - 可以修改打赏权重的计算方式
   - 可以调整新帖子的基础权重

2. 新增因素
   - 可以考虑添加用户画像匹配度
   - 可以考虑添加内容相似度
   - 可以考虑添加用户历史行为数据

3. 性能优化
   - 可以添加缓存机制
   - 可以预计算部分权重
   - 可以限制参与计算的帖子数量
   - 可以优化多策略查询的性能