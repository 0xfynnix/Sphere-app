# Sphere App 数据模型文档

## 1. 数据库配置
- 数据库类型：PostgreSQL
- 使用环境变量配置数据库连接：
  - `DATABASE_URL`：主数据库连接 URL
  - `DIRECT_URL`：直接数据库连接 URL

## 2. 数据模型

### 2.1 用户模型 (User)
- **主键**：`id` (String, CUID)
- **唯一标识**：`clerkId` (String, 唯一)
- **基本信息**：
  - `email` (String, 可选)：用户邮箱
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间
- **关联关系**：
  - `profile`：一对一关联到用户资料
  - `posts`：一对多关联到用户发布的帖子

### 2.2 用户资料模型 (Profile)
- **主键**：`id` (String, CUID)
- **关联字段**：
  - `userId` (String, 唯一)：关联到用户 ID
  - `user`：一对一关联到用户
- **用户信息**：
  - `name` (String, 可选)：用户名称
  - `bio` (String, 可选)：个人简介
  - `avatar` (String, 可选)：头像 URL
  - `wallets` (String[])：钱包地址列表
- **时间戳**：
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间

### 2.3 帖子模型 (Post)
- **主键**：`id` (String, CUID)
- **内容字段**：
  - `title` (String)：帖子标题
  - `content` (String)：帖子内容
  - `image` (String, 可选)：帖子图片URL
  - `status` (PostStatus)：帖子状态（草稿/发布/归档/删除）
- **关联关系**：
  - `userId` (String)：发布者用户 ID
  - `user`：多对一关联到用户
  - `category`：多对一关联到分类
  - `tags`：多对多关联到标签
  - `comments`：一对多关联到评论
  - `likes`：一对多关联到点赞
- **时间戳**：
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间

### 2.4 帖子状态 (PostStatus)
- **枚举值**：
  - `DRAFT`：草稿状态
  - `PUBLISHED`：已发布状态
  - `ARCHIVED`：已归档状态
  - `DELETED`：已删除状态

### 2.5 分类模型 (Category)
- **主键**：`id` (String, CUID)
- **基本信息**：
  - `name` (String)：分类名称
  - `description` (String, 可选)：分类描述
- **关联关系**：
  - `posts`：一对多关联到帖子
- **时间戳**：
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间

### 2.6 标签模型 (Tag)
- **主键**：`id` (String, CUID)
- **基本信息**：
  - `name` (String, 唯一)：标签名称
- **关联关系**：
  - `posts`：多对多关联到帖子
- **时间戳**：
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间

### 2.7 评论模型 (Comment)
- **主键**：`id` (String, CUID)
- **内容字段**：
  - `content` (String)：评论内容
- **关联关系**：
  - `postId` (String)：关联的帖子 ID
  - `post`：多对一关联到帖子
  - `userId` (String)：评论者用户 ID
  - `user`：多对一关联到用户
  - `parentId` (String, 可选)：父评论 ID（用于回复功能）
  - `parent`：自关联到父评论
  - `replies`：自关联到子评论
- **时间戳**：
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间

### 2.8 点赞模型 (Like)
- **主键**：`id` (String, CUID)
- **关联关系**：
  - `postId` (String)：被点赞的帖子 ID
  - `post`：多对一关联到帖子
  - `userId` (String)：点赞用户 ID
  - `user`：多对一关联到用户
- **约束**：
  - 用户对同一帖子只能点赞一次（通过唯一索引实现）
- **时间戳**：
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间

### 2.9 关注模型 (Follow)
- **主键**：`id` (String, CUID)
- **关联关系**：
  - `followerId` (String)：关注者用户 ID
  - `follower`：多对一关联到关注者
  - `followingId` (String)：被关注者用户 ID
  - `following`：多对一关联到被关注者
- **约束**：
  - 用户不能重复关注同一用户（通过唯一索引实现）
- **时间戳**：
  - `createdAt` (DateTime)：创建时间
  - `updatedAt` (DateTime)：更新时间

## 3. 关系说明
- 用户(User)和资料(Profile)是一对一关系
- 用户(User)和帖子(Post)是一对多关系
- 用户(User)和评论(Comment)是一对多关系
- 用户(User)和点赞(Like)是一对多关系
- 用户(User)和关注(Follow)是多对多关系（通过 Follow 模型实现）
- 帖子(Post)和分类(Category)是多对一关系
- 帖子(Post)和标签(Tag)是多对多关系
- 帖子(Post)和评论(Comment)是一对多关系
- 帖子(Post)和点赞(Like)是一对多关系
- 评论(Comment)支持多级回复（通过自关联实现）
- 所有模型都包含创建时间和更新时间字段
- 用户通过 Clerk 进行身份验证，使用 `clerkId` 作为唯一标识

## 4. 建议扩展方向
根据现有模型，可以考虑添加以下功能：
1. 用户权限管理
2. 内容审核系统
3. 帖子搜索功能
4. 用户通知系统
5. 数据统计和分析功能

## 5. 链上链下数据关联

### 5.1 用户数据关联
- **链上数据**：
  - 用户钱包地址
  - NFT数量
  - 总收益
  - 链上用户ID
- **链下数据**：
  - 用户基本信息
  - 社交关系
  - 内容创作
- **同步机制**：
  - 用户注册时同时创建链上链下记录
  - 通过 `chainId` 字段关联链上数据
  - 通过 `walletAddress` 关联钱包地址

### 5.2 帖子数据关联
- **链上数据**：
  - 内容哈希
  - 观众数量
  - 打赏记录
  - 帖子类型
- **链下数据**：
  - 帖子内容
  - 图片
  - 分类标签
  - 评论互动
- **同步机制**：
  - 发布帖子时生成内容哈希
  - 通过 `chainId` 关联链上记录
  - 通过 `contentHash` 验证内容完整性

### 5.3 NFT数据关联
- **链上数据**：
  - NFT所有权
  - 元数据
  - 创建时间
- **链下数据**：
  - 关联的帖子信息
  - 所有者信息
- **同步机制**：
  - 通过 `chainId` 关联链上NFT
  - 通过 `ownerId` 和 `postId` 关联用户和帖子

### 5.4 打赏数据关联
- **链上数据**：
  - 打赏金额
  - 分成比例
  - 推荐人信息
- **链下数据**：
  - 关联的帖子
  - 用户关系
- **同步机制**：
  - 通过 `chainId` 关联链上交易
  - 通过 `postId` 和 `referrerId` 关联帖子和推荐人

### 5.5 数据同步策略
1. **实时同步**：
   - 打赏操作
   - NFT转移
   - 用户注册

2. **定时同步**：
   - 用户收益统计
   - 帖子观众数量
   - NFT数量统计

3. **事件驱动**：
   - 监听链上事件
   - 更新相关数据
   - 触发通知

### 5.6 数据一致性保证
1. **验证机制**：
   - 内容哈希验证
   - 交易签名验证
   - 余额验证

2. **回滚机制**：
   - 交易失败回滚
   - 数据不一致修复
   - 错误处理策略

3. **监控告警**：
   - 数据同步状态
   - 异常交易监控
   - 性能指标监控 