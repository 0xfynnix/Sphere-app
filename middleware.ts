import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { PrismaClient } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'sphere-secret-key'
const prisma = new PrismaClient()

export async function middleware(request: NextRequest) {
  // 检查是否是 API 路由
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 对于 /api/content 的非 POST 请求直接放行
  if (request.nextUrl.pathname.startsWith('/api/content') && request.method !== 'POST') {
    return NextResponse.next()
  }
  if ((request.nextUrl.pathname === '/api/bids' || request.nextUrl.pathname === '/api/bids/history' )&& request.method !== 'POST') {
    return NextResponse.next()
  }

  // 对于 /api/posts/:path* 的非 POST 请求直接放行
  if (request.nextUrl.pathname.startsWith('/api/posts/') && request.method !== 'POST') {
    return NextResponse.next()
  }

  // 获取 Authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const token = authHeader.split(' ')[1]
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    // 将用户地址添加到请求头中
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-address', payload.walletAddress as string)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}

// 配置需要鉴权的路由
export const config = {
  matcher: [
    '/api/content/:path*',
    '/api/user/:path*',
    '/api/bids/:path*',
    '/api/rewards/:path*',
    '/api/auction/process-expired',
    '/api/posts/:path*',
    '/api/lottery-pool/:path*',
  ],
}

export async function middlewareAdmin(request: NextRequest) {
  const userAddress = request.headers.get('x-user-address')
  
  // 检查是否是管理员路由
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    if (!userAddress) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 从数据库检查用户是否是管理员
    const user = await prisma.user.findUnique({
      where: { walletAddress: userAddress },
      select: { isAdmin: true }
    })

    if (!user || !user.isAdmin) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return NextResponse.next()
}

// 配置中间件匹配的路由
export const configAdmin = {
  matcher: '/api/admin/:path*',
} 