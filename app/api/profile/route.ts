import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/vercelBlob";

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

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const avatar = formData.get('avatar') as File;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: "User not found",
        },
      }, { status: 404 });
    }

    // 处理头像上传
    let avatarUrl = user.profile?.avatar;
    if (avatar && avatar.size > 0) {
      try {
        const result = await uploadImage(avatar);
        avatarUrl = result.url;
      } catch (error) {
        console.error('Error uploading avatar:', error);
        return NextResponse.json({
          success: false,
          error: {
            message: "Failed to upload avatar",
          },
        }, { status: 500 });
      }
    }

    // 更新用户资料
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        name: name || undefined,
        bio: bio || undefined,
        avatar: avatarUrl,
      },
      create: {
        userId: user.id,
        name: name || undefined,
        bio: bio || undefined,
        avatar: avatarUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: updatedProfile.id,
          name: updatedProfile.name,
          bio: updatedProfile.bio,
          avatar: updatedProfile.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: "Internal server error",
      },
    }, { status: 500 });
  }
} 