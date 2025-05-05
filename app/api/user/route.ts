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
    const { userType, email } = body;

    // 验证 userType 是否有效
    if (userType && !Object.values(UserType).includes(userType)) {
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid user type",
        },
      }, { status: 400 });
    }

    const updateData: UserUpdateInput = {};
    if (userType !== undefined) updateData.userType = userType;
    if (email !== undefined) updateData.email = email;

    const user = await prisma.user.update({
      where: {
        walletAddress: address,
      },
      data: updateData,
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          profile: user.profile ? {
            id: user.profile.id,
            name: user.profile.name,
            avatar: user.profile.avatar,
            bio: user.profile.bio,
          } : null,
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