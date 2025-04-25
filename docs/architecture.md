# Sphere App 系统架构设计

## 1. 整体架构图

```mermaid
graph TD
    subgraph 前端层
        A[Web应用] --> B[移动应用]
    end

    subgraph 后端层
        C[API服务] --> D[数据库]
        C --> E[缓存服务]
    end

    subgraph 区块链层
        F[智能合约] --> G[SUI网络]
        H[事件监听器] --> F
    end

    subgraph 存储层
        I[文件存储] --> J[图片/视频]
    end

    A --> C
    B --> C
    C --> F
    H --> C
    C --> I
```

## 2. 系统组件说明

### 2.1 前端层
- **Web应用**
  - 用户界面
  - 钱包连接
  - 内容展示
  - 交互功能

- **移动应用**
  - 移动端适配

### 2.2 后端层
- **API服务**
  - RESTful API
  - 身份验证
  - 数据同步

- **数据库**
  - PostgreSQL
  - 用户数据
  - 内容数据
  - 关系数据

### 2.3 区块链层
- **智能合约**
  - 用户管理
  - 内容管理
  - 打赏系统
  - NFT系统

- **SUI网络**
  - 交易处理
  - 状态同步
  - 共识机制

- **事件监听器**
  - 链上事件监听
  - 数据同步
  - 状态更新

### 2.4 存储层
- **文件存储**
  - 图片存储
  - 内容分发

## 3. 数据流向图

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Blockchain
    participant Database

    %% 用户注册流程
    User->>Frontend: 1. 连接钱包
    Frontend->>Backend: 2. 请求注册
    Backend->>Blockchain: 3. 调用注册合约
    Blockchain->>Backend: 4. 返回链上ID
    Backend->>Database: 5. 保存用户数据
    Backend->>Frontend: 6. 返回注册结果
    Frontend->>User: 7. 显示注册成功

    %% 发布内容流程
    User->>Frontend: 1. 创建内容
    Frontend->>Backend: 2. 上传内容
    Backend->>Database: 3. 保存内容
    Backend->>Blockchain: 4. 生成内容哈希
    Blockchain->>Backend: 5. 返回链上ID
    Backend->>Frontend: 6. 返回发布结果
    Frontend->>User: 7. 显示发布成功

    %% 打赏流程
    User->>Frontend: 1. 发起打赏
    Frontend->>Blockchain: 2. 调用打赏合约
    Blockchain->>Blockchain: 3. 执行分成计算
    Blockchain->>Backend: 4. 触发打赏事件
    Backend->>Database: 5. 更新打赏记录
    Backend->>Frontend: 6. 返回打赏结果
    Frontend->>User: 7. 显示打赏成功
```

## 4. 链上链下数据同步

### 4.1 用户数据同步
```mermaid
graph LR
    A[用户注册] --> B[链上创建用户]
    B --> C[生成链上ID]
    C --> D[保存到数据库]
    D --> E[关联钱包地址]
```

### 4.2 内容数据同步
```mermaid
graph LR
    A[发布内容] --> B[保存到数据库]
    B --> C[生成内容哈希]
    C --> D[链上记录哈希]
    D --> E[关联链上ID]
```

### 4.3 打赏数据同步
```mermaid
graph LR
    A[发起打赏] --> B[链上执行]
    B --> C[计算分成]
    C --> D[执行转账]
    D --> E[触发事件]
    E --> F[更新数据库]
```

## 5. 关键数据流说明

### 5.1 用户注册流程
1. 用户连接钱包
2. 调用注册合约
3. 生成链上用户记录
4. 保存用户数据到数据库
5. 关联链上ID和钱包地址

### 5.2 内容发布流程
1. 用户创建内容
2. 保存内容到数据库
3. 生成内容哈希
4. 调用合约记录哈希
5. 关联链上ID

### 5.3 打赏流程
1. 用户发起打赏
2. 验证打赏金额
3. 计算分成比例
4. 执行链上转账
5. 触发打赏事件
6. 更新数据库记录

### 5.4 NFT流程
1. 创建NFT
2. 记录所有权
3. 更新用户NFT数量
4. 同步到数据库

## 6. 安全考虑

### 6.1 数据验证
- 内容哈希验证
- 签名验证
- 权限验证

### 6.2 同步机制
- 事件驱动同步
- 定时同步
- 手动同步

### 6.3 错误处理
- 交易回滚
- 数据修复
- 状态恢复 