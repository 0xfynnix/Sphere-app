# Sphere App 区块链设计文档

## 1. 链上数据结构

### 1.1 用户信息 (User)
```move
struct User {
    id: String,          // 用户ID（与链下数据库对应）
    wallet_address: address,  // 用户钱包地址
    nft_count: u64,      // 拥有的NFT数量
    total_earnings: u64, // 总收益（SUI）
    created_at: u64,     // 创建时间
    updated_at: u64,     // 更新时间
}
```

### 1.2 帖子信息 (Post)
```move
struct Post {
    id: String,          // 帖子ID（与链下数据库对应）
    author: address,     // 作者钱包地址
    content_hash: String, // 内容哈希
    audience_count: u64, // 观众数量
    total_rewards: u64,  // 总打赏金额
    post_type: u8,       // 帖子类型（0: 普通, 1: Meme Lord）
    created_at: u64,     // 创建时间
    updated_at: u64,     // 更新时间
}
```

### 1.3 NFT信息 (NFT)
```move
struct NFT {
    id: String,          // NFT ID
    owner: address,      // 所有者地址
    post_id: String,     // 关联的帖子ID
    created_at: u64,     // 创建时间
    metadata: String,    // NFT元数据
}
```

### 1.4 打赏记录 (Reward)
```move
struct Reward {
    id: String,          // 打赏记录ID
    post_id: String,     // 帖子ID
    amount: u64,         // 打赏金额
    author_share: u64,   // 作者分成
    platform_share: u64, // 平台分成
    referrer_share: u64, // 推荐人分成
    referrer: address,   // 推荐人地址
    created_at: u64,     // 创建时间
}
```

## 2. 智能合约设计

### 2.1 合约结构
```move
module sphere::sphere {
    // 合约所有者
    struct Sphere has key {
        id: ID,
        owner: address,
        platform_pool: u64,
        total_posts: u64,
        total_users: u64,
    }

    // 错误码
    const ENotAuthorized: u64 = 1;
    const EInvalidAmount: u64 = 2;
    const EPostNotFound: u64 = 3;
    const EUserNotFound: u64 = 4;
}
```

### 2.2 主要功能

#### 2.2.1 打赏功能
```move
public fun reward_post(
    post_id: String,
    amount: u64,
    referrer: address
) {
    // 验证打赏金额
    assert!(validate_reward_amount(amount), EInvalidAmount);
    
    // 计算分成
    let (author_share, platform_share, referrer_share) = calculate_shares(
        amount,
        get_post_type(post_id)
    );
    
    // 执行转账
    transfer_rewards(
        author_share,
        platform_share,
        referrer_share,
        referrer
    );
    
    // 记录打赏
    create_reward_record(
        post_id,
        amount,
        author_share,
        platform_share,
        referrer_share,
        referrer
    );
}
```

#### 2.2.2 分成计算
```move
fun calculate_shares(amount: u64, post_type: u8): (u64, u64, u64) {
    let author_share = amount * 80 / 100;
    let platform_share = amount * 10 / 100;
    let referrer_share = if (post_type == 1) {
        amount * 15 / 100  // Meme Lord 类型
    } else {
        amount * 10 / 100  // 普通类型
    };
    
    (author_share, platform_share, referrer_share)
}
```

#### 2.2.3 观众数量验证
```move
fun validate_reward_amount(amount: u64): bool {
    if (amount == 1 && audience_count >= 1 && audience_count <= 120) {
        true
    } else if (amount == 3 && audience_count > 120 && audience_count <= 360) {
        true
    } else if (amount == 10 && audience_count > 360 && audience_count <= 1200) {
        true
    } else if (amount == 30 && audience_count > 1200 && audience_count <= 3600) {
        true
    } else {
        false
    }
}
```

## 3. 链上链下数据同步

### 3.1 数据同步机制
1. 用户注册时，同时在链上和链下创建记录
2. 发布帖子时，内容存储在链下，哈希和关键信息存储在链上
3. 打赏操作完全在链上执行，链下数据库通过事件监听同步数据
4. NFT 信息同时存储在链上和链下

### 3.2 事件监听
```move
struct PostCreated has copy, drop {
    post_id: String,
    author: address,
    content_hash: String,
    timestamp: u64
}

struct RewardPaid has copy, drop {
    post_id: String,
    amount: u64,
    author: address,
    referrer: address,
    timestamp: u64
}
```

## 4. 安全考虑

### 4.1 权限控制
- 只有合约所有者可以更新平台参数
- 用户只能修改自己的信息
- 打赏金额必须符合预设规则

### 4.2 防重放攻击
- 所有交易包含时间戳
- 使用递增的ID防止重放

### 4.3 数据验证
- 链下数据通过哈希验证
- 关键操作需要多重签名

## 5. 扩展性考虑

### 5.1 未来可扩展功能
1. 支持多种代币打赏
2. 动态调整分成比例
3. NFT 交易市场
4. 社区治理机制

### 5.2 性能优化
1. 使用批量处理减少交易数量
2. 实现数据分片
3. 优化存储结构 

## 6. 智能合约功能实现

### 6.1 合约初始化
```move
module sphere::sphere {
    // 初始化合约
    public fun init(owner: &signer) {
        let sphere = Sphere {
            id: object::new(owner),
            owner: signer::address_of(owner),
            platform_pool: 0,
            total_posts: 0,
            total_users: 0,
        };
        move_to(owner, sphere);
    }
}
```

### 6.2 用户管理
```move
module sphere::sphere {
    // 注册用户
    public fun register_user(
        sphere: &mut Sphere,
        user: &signer,
        user_id: String
    ) {
        let user_address = signer::address_of(user);
        let user = User {
            id: user_id,
            wallet_address: user_address,
            nft_count: 0,
            total_earnings: 0,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
        };
        move_to(user, user);
        sphere.total_users = sphere.total_users + 1;
    }

    // 更新用户信息
    public fun update_user_earnings(
        user: &mut User,
        amount: u64
    ) {
        user.total_earnings = user.total_earnings + amount;
        user.updated_at = timestamp::now_seconds();
    }
}
```

### 6.3 帖子管理
```move
module sphere::sphere {
    // 创建帖子
    public fun create_post(
        sphere: &mut Sphere,
        author: &signer,
        post_id: String,
        content_hash: String,
        post_type: u8
    ) {
        let post = Post {
            id: post_id,
            author: signer::address_of(author),
            content_hash,
            audience_count: 0,
            total_rewards: 0,
            post_type,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
        };
        move_to(author, post);
        sphere.total_posts = sphere.total_posts + 1;
    }

    // 更新帖子观众数量
    public fun update_audience_count(
        post: &mut Post,
        count: u64
    ) {
        post.audience_count = count;
        post.updated_at = timestamp::now_seconds();
    }
}
```

### 6.4 打赏功能
```move
module sphere::sphere {
    // 打赏帖子
    public fun reward_post(
        sphere: &mut Sphere,
        sender: &signer,
        post: &mut Post,
        amount: u64,
        referrer: address
    ) {
        // 验证打赏金额
        assert!(validate_reward_amount(post.audience_count, amount), EInvalidAmount);
        
        // 计算分成
        let (author_share, platform_share, referrer_share) = calculate_shares(
            amount,
            post.post_type
        );
        
        // 执行转账
        transfer_rewards(
            sender,
            post.author,
            referrer,
            author_share,
            platform_share,
            referrer_share
        );
        
        // 更新数据
        post.total_rewards = post.total_rewards + amount;
        sphere.platform_pool = sphere.platform_pool + platform_share;
        
        // 记录打赏
        let reward = Reward {
            id: object::new(sender),
            post_id: post.id,
            amount,
            author_share,
            platform_share,
            referrer_share,
            referrer,
            created_at: timestamp::now_seconds(),
        };
        move_to(sender, reward);
    }

    // 验证打赏金额
    fun validate_reward_amount(audience_count: u64, amount: u64): bool {
        if (amount == 1 && audience_count >= 1 && audience_count <= 120) {
            true
        } else if (amount == 3 && audience_count > 120 && audience_count <= 360) {
            true
        } else if (amount == 10 && audience_count > 360 && audience_count <= 1200) {
            true
        } else if (amount == 30 && audience_count > 1200 && audience_count <= 3600) {
            true
        } else {
            false
        }
    }

    // 计算分成
    fun calculate_shares(amount: u64, post_type: u8): (u64, u64, u64) {
        let author_share = amount * 80 / 100;
        let platform_share = amount * 10 / 100;
        let referrer_share = if (post_type == 1) {
            amount * 15 / 100  // Meme Lord 类型
        } else {
            amount * 10 / 100  // 普通类型
        };
        
        (author_share, platform_share, referrer_share)
    }
}
```

### 6.5 NFT管理
```move
module sphere::sphere {
    // 创建NFT
    public fun create_nft(
        owner: &signer,
        nft_id: String,
        post_id: String,
        metadata: String
    ) {
        let nft = NFT {
            id: nft_id,
            owner: signer::address_of(owner),
            post_id,
            created_at: timestamp::now_seconds(),
            metadata,
        };
        move_to(owner, nft);
    }

    // 转移NFT
    public fun transfer_nft(
        sender: &signer,
        nft: &mut NFT,
        new_owner: address
    ) {
        let old_owner = nft.owner;
        nft.owner = new_owner;
        nft.updated_at = timestamp::now_seconds();
        
        // 触发转移事件
        emit_nft_transferred(nft.id, old_owner, new_owner);
    }
}
```

### 6.6 事件系统
```move
module sphere::sphere {
    // 事件定义
    struct PostCreated has copy, drop {
        post_id: String,
        author: address,
        content_hash: String,
        timestamp: u64
    }

    struct RewardPaid has copy, drop {
        post_id: String,
        amount: u64,
        author: address,
        referrer: address,
        timestamp: u64
    }

    struct NFTTransferred has copy, drop {
        nft_id: String,
        from: address,
        to: address,
        timestamp: u64
    }

    // 事件触发函数
    fun emit_post_created(
        post_id: String,
        author: address,
        content_hash: String
    ) {
        event::emit(PostCreated {
            post_id,
            author,
            content_hash,
            timestamp: timestamp::now_seconds()
        });
    }

    fun emit_reward_paid(
        post_id: String,
        amount: u64,
        author: address,
        referrer: address
    ) {
        event::emit(RewardPaid {
            post_id,
            amount,
            author,
            referrer,
            timestamp: timestamp::now_seconds()
        });
    }

    fun emit_nft_transferred(
        nft_id: String,
        from: address,
        to: address
    ) {
        event::emit(NFTTransferred {
            nft_id,
            from,
            to,
            timestamp: timestamp::now_seconds()
        });
    }
}
```

### 6.7 权限控制
```move
module sphere::sphere {
    // 管理员权限
    public fun only_owner(sphere: &Sphere, caller: address) {
        assert!(sphere.owner == caller, ENotAuthorized);
    }

    // 用户权限
    public fun only_user(user: &User, caller: address) {
        assert!(user.wallet_address == caller, ENotAuthorized);
    }

    // 帖子作者权限
    public fun only_author(post: &Post, caller: address) {
        assert!(post.author == caller, ENotAuthorized);
    }
}
```

### 6.8 错误处理
```move
module sphere::sphere {
    // 错误码定义
    const ENotAuthorized: u64 = 1;
    const EInvalidAmount: u64 = 2;
    const EPostNotFound: u64 = 3;
    const EUserNotFound: u64 = 4;
    const EInsufficientBalance: u64 = 5;
    const EInvalidPostType: u64 = 6;
    const ENFTNotFound: u64 = 7;
    const EInvalidMetadata: u64 = 8;
}
``` 