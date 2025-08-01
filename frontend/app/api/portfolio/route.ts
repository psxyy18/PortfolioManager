// 📁 app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 这里模拟后端API调用，实际使用时替换为真实的后端API
export async function GET(request: NextRequest) {
  try {
    // 替换为你的真实后端API地址
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${BACKEND_API_URL}/api/portfolio`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken(request)}`,
        'Content-Type': 'application/json',
      },
      // 设置超时
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 确保返回数据格式与mock数据一致
    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      portfolio: data.portfolio || data, // 适配不同的后端响应格式
    });
    
  } catch (error) {
    console.error('Portfolio API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load portfolio data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbol, quantity, price } = body;
    
    // 验证请求数据
    if (!action || !symbol || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${BACKEND_API_URL}/api/portfolio/transaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken(request)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, symbol, quantity, price }),
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Transaction failed: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Transaction API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Transaction failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 辅助函数：获取认证token
function getAuthToken(request: NextRequest): string {
  // 方法1: 从Authorization header获取
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 方法2: 从环境变量获取（用于服务端API调用）
  const apiToken = process.env.BACKEND_API_TOKEN;
  if (apiToken) {
    return apiToken;
  }
  
  // 方法3: 从NextAuth session获取（如果使用NextAuth）
  // 这里需要根据你的认证方案进行调整
  
  return '';
}
