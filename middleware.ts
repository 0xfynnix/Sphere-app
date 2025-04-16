import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface UserData {
  clerkId: string;
  email?: string;
}

// 定义公共路由
const isPublicRoute = createRouteMatcher([
  "/",                    // 首页
  "/api/webhook(.*)",     // webhook
  "/_next/image(.*)",     // Next.js 图片优化
  "/img.clerk.com(.*)",   // Clerk 图片代理
  "/images.clerk.dev(.*)",// Clerk 图片代理
  "/sso-callback(.*)",    // SSO 回调
  "/api/clerk(.*)",       // Clerk API
  "/_next/static(.*)",    // Next.js 静态资源
  "/favicon.ico",         // 网站图标
  "/manifest.json",       // PWA 清单
  "/robots.txt"           // 爬虫规则
]);

// 定义需要保护的路由
const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",         // 用户资料
  "/my-page(.*)",         // 个人页面
  "/create(.*)"           // 创建内容
]);

export default clerkMiddleware(async (auth, request) => {
  // 如果是公共路由，直接放行
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }
  
  // 如果是受保护的路由，需要验证登录状态
  if (isProtectedRoute(request)) {
    try {
      const clerkUser = await auth.protect();
      
      // 同步用户数据
      if (clerkUser.userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.userId }
          });

          if (!user) {
            // 创建用户，邮箱是可选的
            const userData: UserData = {
              clerkId: clerkUser.userId
            };
            
            // 如果有邮箱，就添加到用户数据中
            const email = clerkUser.sessionClaims?.email as string;
            if (email) {
              userData.email = email;
            }
            
            // 创建用户并同时创建空的 Profile
            await prisma.user.create({
              data: {
                ...userData,
                profile: {
                  create: {} // 创建空的 Profile
                }
              }
            });
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error("Auth protection error:", error);
      // 让 Clerk 处理重定向
      return NextResponse.next();
    }
  }
}, { 
  debug: process.env.NODE_ENV === 'development'
});

export const config = {
  matcher: [
    // 跳过静态文件和 Next.js 内部文件
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)',
    // 匹配所有 API 路由
    '/(api|trpc)(.*)',
  ],
}; 