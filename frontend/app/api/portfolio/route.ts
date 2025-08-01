// 📁 app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/portfolio`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data from backend');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json(
      { error: 'Failed to load portfolio data' },
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
