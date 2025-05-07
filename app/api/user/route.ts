import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GetUserResponse, UserType, UserUpdateInput } from "@/lib/api/types";

export async function GET(request: Request) {
  try {
    const address = request.headers.get('x-user-address');
    
    if (!address) {
      return NextResponse.json<GetUserResponse>({
        success: false,
        error: {
          message: "Unauthorized",
        },
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: address,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json<GetUserResponse>({
        success: false,
        error: {
          message: "User not found",
        },
      }, { status: 404 });
    }

    return NextResponse.json<GetUserResponse>({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email || undefined,
          shareCode: user.shareCode || "",
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          profile: {
            id: user.id,
            name: user.profile?.name,
            avatar: user.profile?.avatar,
            bio: user.profile?.bio,
          },
          auctionEarnings: user.auctionEarnings,
          rewardEarnings: user.rewardEarnings,
          rewardSpent: user.rewardSpent,
          nftCount: user.nftCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json<GetUserResponse>({
      success: false,
      error: {
        message: "Internal server error",
      },
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const address = request.headers.get('x-user-address');
    
    if (!address) {
      return NextResponse.json({
        success: false,
        error: {
          message: "Unauthorized",
        },
      }, { status: 401 });
    }

    const body = await request.json();
    const { userType, txDigest } = body;

    // 验证 userType 是否有效
    if (userType && !Object.values(UserType).includes(userType)) {
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid user type",
        },
      }, { status: 400 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: {
        walletAddress: address,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: "User not found",
        },
      }, { status: 404 });
    }

    const updateData: UserUpdateInput = {};
    if (userType !== undefined) updateData.userType = userType;

    // 使用事务来确保数据一致性
    const [updatedUser] = await prisma.$transaction([
      // 更新用户信息
      prisma.user.update({
        where: {
          walletAddress: address,
        },
        data: updateData,
        include: {
          profile: true,
        },
      }),
      // 记录交易
      prisma.suiTransaction.create({
        data: {
          digest: txDigest,
          userId: user.id,
          type: 'register',
          status: 'success',
          data: {
            userType,
            walletAddress: address,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          walletAddress: updatedUser.walletAddress,
          email: updatedUser.email,
          userType: updatedUser.userType,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
          profile: updatedUser.profile ? {
            id: updatedUser.profile.id,
            name: updatedUser.profile.name,
            avatar: updatedUser.profile.avatar,
            bio: updatedUser.profile.bio,
          } : null,
          auctionEarnings: updatedUser.auctionEarnings,
          rewardEarnings: updatedUser.rewardEarnings,
          rewardSpent: updatedUser.rewardSpent,
          nftCount: updatedUser.nftCount,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: "Internal server error",
      },
    }, { status: 500 });
  }
} 