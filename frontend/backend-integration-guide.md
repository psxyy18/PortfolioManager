# 🔄 从Mock数据迁移到真实后端 - 完整指南

## 📋 迁移概览

### 需要修改的核心内容:
1. **API路由创建** - 创建Next.js API routes
2. **数据获取层** - 替换静态导入为API调用
3. **状态管理** - 添加loading/error状态
4. **自定义Hooks** - 封装数据获取逻辑
5. **错误处理** - 完善错误边界
6. **类型定义** - 确保API响应类型安全

## 🛠️ 具体修改步骤

### 第1步: 创建API路由

#### 1.1 投资组合API
```typescript
// 📁 /app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 替换为真实的后端API调用
    const response = await fetch('http://your-backend-api.com/api/portfolio', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load portfolio' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbol, quantity, price } = body;
    
    const response = await fetch('http://your-backend-api.com/api/portfolio/transaction', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, symbol, quantity, price }),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Transaction failed' },
      { status: 500 }
    );
  }
}

function getAuthToken() {
  // 从session或其他地方获取认证token
  return process.env.API_TOKEN || '';
}
```

#### 1.2 市场数据API
```typescript
// 📁 /app/api/market/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    const endpoint = symbol 
      ? `http://your-backend-api.com/api/market/stock/${symbol}`
      : 'http://your-backend-api.com/api/market/stocks';
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load market data' },
      { status: 500 }
    );
  }
}
```

### 第2步: 创建自定义Hooks

#### 2.1 投资组合数据Hook
```typescript
// 📁 /hooks/usePortfolio.ts
import { useState, useEffect } from 'react';

interface PortfolioData {
  success: boolean;
  lastUpdated: string;
  portfolio: PortfolioItem[];
}

interface UsePortfolioReturn {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePortfolio = (): UsePortfolioReturn => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/portfolio');
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      
      const portfolioData = await response.json();
      setData(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchPortfolio,
  };
};
```

#### 2.2 市场数据Hook
```typescript
// 📁 /hooks/useMarketData.ts
import { useState, useEffect } from 'react';

export const useMarketData = (symbol?: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const url = symbol ? `/api/market?symbol=${symbol}` : '/api/market';
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const marketData = await response.json();
        setData(marketData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [symbol]);

  return { data, loading, error };
};
```

### 第3步: 修改现有组件

#### 3.1 修改MockDataTester组件
```typescript
// 📁 /app/components/MockDataTester.tsx
'use client';

import React from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';

export default function DataTester() {
  const { data: portfolioData, loading, error, refetch } = usePortfolio();

  if (loading) {
    return <LoadingSpinner message="加载投资组合数据..." />;
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={refetch} />;
  }

  if (!portfolioData) {
    return <div>没有数据</div>;
  }

  // 原有的测试逻辑，但使用真实数据
  const testJSONParsing = (data: any, name: string) => {
    // 保持原有逻辑不变
  };

  return (
    <div>
      {/* 原有UI，但数据来源从mock改为API */}
      <h2>真实数据解析测试</h2>
      <button onClick={refetch}>刷新数据</button>
      {/* 其他组件内容 */}
    </div>
  );
}
```

#### 3.2 修改DashboardContent组件
```typescript
// 📁 /app/(dashboard)/DashboardContent.tsx
'use client';

import React from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useMarketData } from '../../hooks/useMarketData';

export default function DashboardContent() {
  const { data: portfolioData, loading: portfolioLoading, error: portfolioError } = usePortfolio();
  const { data: marketData, loading: marketLoading } = useMarketData();

  // 加载状态处理
  if (portfolioLoading) {
    return <div>加载中...</div>;
  }

  // 错误状态处理
  if (portfolioError) {
    return <div>错误: {portfolioError}</div>;
  }

  // 使用真实数据而不是mock数据
  const data = portfolioData ? [
    {
      title: '昨日收益',
      value: `+$${portfolioData.portfolio.reduce((sum, item) => sum + item.dailyChange, 0).toLocaleString()}`,
      // ... 其他逻辑
    },
    // ... 其他数据项
  ] : [];

  return (
    <div>
      {/* 原有UI结构保持不变 */}
    </div>
  );
}
```

### 第4步: 创建通用组件

#### 4.1 加载组件
```typescript
// 📁 /app/components/LoadingSpinner.tsx
import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = '加载中...' }: LoadingSpinnerProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
    >
      <CircularProgress />
      <Typography variant="body2" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};
```

#### 4.2 错误处理组件
```typescript
// 📁 /app/components/ErrorAlert.tsx
import { Alert, Button, Box } from '@mui/material';

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="error" 
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              重试
            </Button>
          )
        }
      >
        {error}
      </Alert>
    </Box>
  );
};
```

### 第5步: 环境配置

#### 5.1 环境变量
```bash
# 📁 .env.local
NEXT_PUBLIC_API_BASE_URL=http://your-backend-api.com
API_TOKEN=your-backend-api-token
NEXTAUTH_SECRET=your-nextauth-secret
```

#### 5.2 API配置
```typescript
// 📁 /lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
};
```

## 🔄 迁移检查清单

### ✅ 必须完成的修改:

- [ ] **创建API路由** (`/app/api/portfolio/route.ts`, `/app/api/market/route.ts`)
- [ ] **创建自定义Hooks** (`usePortfolio`, `useMarketData`)
- [ ] **修改组件导入** (从mock导入改为Hook调用)
- [ ] **添加Loading/Error状态** (所有数据获取的地方)
- [ ] **创建通用组件** (`LoadingSpinner`, `ErrorAlert`)
- [ ] **配置环境变量** (API地址、认证token等)
- [ ] **更新类型定义** (确保API响应类型正确)

### ⚠️ 需要注意的点:

1. **数据结构一致性**: 确保后端API返回的数据结构与mock数据一致
2. **错误处理**: 完善网络错误、超时、认证失败等场景
3. **缓存策略**: 考虑使用SWR或React Query来优化数据获取
4. **实时数据**: 如需要实时价格更新，考虑WebSocket连接
5. **认证状态**: 确保API调用包含正确的认证信息

## 🚀 渐进式迁移建议

### 阶段1: 基础API替换
- 先替换投资组合数据获取
- 保持UI和业务逻辑不变

### 阶段2: 完善错误处理
- 添加Loading状态
- 完善错误边界

### 阶段3: 优化用户体验  
- 添加数据缓存
- 实现乐观更新
- 添加实时数据更新

### 阶段4: 高级功能
- WebSocket实时价格
- 离线支持
- 数据预加载

这样分阶段迁移可以确保系统稳定性，同时逐步提升用户体验。
