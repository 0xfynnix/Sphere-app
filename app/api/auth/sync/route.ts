import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { SyncUserResponse } from "@/lib/api/types";

export async function POST(): Promise<NextResponse<SyncUserResponse>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED"
        }
      }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      // 创建用户
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          profile: {
            create: {} // 创建空的 Profile
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          user: newUser
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: dbUser
      }
    });
  } catch (error) {
    console.error("Error in user sync:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR"
      }
    }, { status: 500 });
  }
} 