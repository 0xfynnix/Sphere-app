import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { GetUserResponse } from "@/lib/api/types";
import jwt from 'jsonwebtoken';

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'sphere-secret-key';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<GetUserResponse>({
        success: false,
        error: {
          message: "Unauthorized",
        },
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { walletAddress: string };
    
    if (!decoded?.walletAddress) {
      return NextResponse.json<GetUserResponse>({
        success: false,
        error: {
          message: "Invalid token",
        },
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: decoded.walletAddress,
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