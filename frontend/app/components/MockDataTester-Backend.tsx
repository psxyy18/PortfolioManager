// 📁 app/components/MockDataTester-Backend.tsx
// 这是修改后的版本，展示如何从mock数据迁移到真实后端

'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import { usePortfolio } from '../../hooks/usePortfolio';

// 保持原有的类型定义
interface PortfolioItem {
  symbol: string;
  name: string;
  exchange: string;
  quantity: number;
  costBasis: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  profitLoss: number;
}

export default function BackendDataTester() {
  // 使用自定义Hook替换直接导入mock数据
  const { data: portfolioData, loading, error, refetch } = usePortfolio();
  const [testResults, setTestResults] = useState<any[]>([]);

  // 保持原有的JSON解析测试逻辑
  const testJSONParsing = (data: any, name: string) => {
    try {
      const jsonString = JSON.stringify(data);
      const parsedData = JSON.parse(jsonString);
      
      const isValid = JSON.stringify(parsedData) === JSON.stringify(data);
      
      const result = {
        name,
        success: true,
        isValid,
        dataSize: jsonString.length,
        parsed: parsedData,
        error: null
      };
      
      setTestResults(prev => [...prev, result]);
      return result;
    } catch (error) {
      const result = {
        name,
        success: false,
        isValid: false,
        dataSize: 0,
        parsed: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setTestResults(prev => [...prev, result]);
      return result;
    }
  };

  // 测试真实数据
  const runRealDataTests = () => {
    if (!portfolioData) return;
    
    setTestResults([]);
    testJSONParsing(portfolioData, '真实投资组合数据');
    
    // 测试单个投资项
    if (portfolioData.portfolio.length > 0) {
      testJSONParsing(portfolioData.portfolio[0], '单个投资项数据');
    }
  };

  // 格式化函数保持不变
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // Loading状态
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>加载真实数据中...</Typography>
        </Stack>
      </Box>
    );
  }

  // Error状态
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              重试
            </Button>
          }
        >
          <Typography variant="h6">数据加载失败</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  // 无数据状态
  if (!portfolioData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          暂无投资组合数据
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* 标题和操作按钮 */}
        <Box>
          <Typography variant="h4" gutterBottom>
            真实后端数据测试器
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            连接到真实后端API，测试数据解析和完整性
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={runRealDataTests}>
              运行数据测试
            </Button>
            <Button variant="outlined" onClick={refetch}>
              刷新数据
            </Button>
          </Stack>
        </Box>

        {/* 数据概览 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              数据概览
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip 
                label={`总持仓: ${portfolioData.portfolio.length} 项`} 
                color="primary" 
              />
              <Chip 
                label={`最后更新: ${new Date(portfolioData.lastUpdated).toLocaleString()}`} 
                color="secondary" 
              />
              <Chip 
                label={portfolioData.success ? '数据有效' : '数据异常'} 
                color={portfolioData.success ? 'success' : 'error'} 
              />
            </Stack>
          </CardContent>
        </Card>

        {/* 投资组合数据表格 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              投资组合详情
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>股票代码</TableCell>
                    <TableCell>股票名称</TableCell>
                    <TableCell>数量</TableCell>
                    <TableCell>当前价格</TableCell>
                    <TableCell>市值</TableCell>
                    <TableCell>日涨跌</TableCell>
                    <TableCell>盈亏</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolioData.portfolio.map((item: PortfolioItem, index: number) => (
                    <TableRow key={`${item.symbol}-${index}`}>
                      <TableCell>{item.symbol}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.currentPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.marketValue)}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatPercent(item.dailyChangePercent)}
                          color={item.dailyChangePercent >= 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={item.profitLoss >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {formatCurrency(item.profitLoss)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                数据解析测试结果
              </Typography>
              <Stack spacing={2}>
                {testResults.map((result, index) => (
                  <Alert
                    key={index}
                    severity={result.success ? 'success' : 'error'}
                  >
                    <Typography variant="subtitle2">{result.name}</Typography>
                    <Typography variant="body2">
                      {result.success
                        ? `✅ 解析成功 (${result.dataSize} bytes) - 数据${result.isValid ? '完整' : '不完整'}`
                        : `❌ 解析失败: ${result.error}`
                      }
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
