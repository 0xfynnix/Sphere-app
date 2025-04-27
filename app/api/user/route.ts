import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { GetUserResponse } from "@/lib/api/types";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token?.sub) {
      return NextResponse.json<GetUserResponse>({
        success: false,
        error: {
          message: "Unauthorized",
        },
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: token.sub,
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
          email: user.email,
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