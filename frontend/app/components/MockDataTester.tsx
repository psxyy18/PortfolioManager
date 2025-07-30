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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  portfolioMockData,
  portfolioDetailsMockData,
  transactionMockData,
  errorMockData,
} from '../../mock/portfolioMockData';

// 类型定义
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

interface PortfolioResponse {
  success: boolean;
  lastUpdated: string;
  portfolio: PortfolioItem[];
}

export default function MockDataTester() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [dataType, setDataType] = useState<string>('');

  // JSON 解析测试函数
  const testJSONParsing = (data: any, name: string) => {
    try {
      // 测试序列化和反序列化
      const jsonString = JSON.stringify(data);
      const parsedData = JSON.parse(jsonString);
      
      // 验证数据完整性
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

  // 测试所有数据
  const runAllTests = () => {
    setTestResults([]);
    
    testJSONParsing(portfolioMockData, '投资组合数据');
    testJSONParsing(portfolioDetailsMockData, '投资组合详情');
    testJSONParsing(transactionMockData.buySuccess, '买入成功响应');
    testJSONParsing(transactionMockData.sellSuccess, '卖出成功响应');
    testJSONParsing(transactionMockData.depositSuccess, '存款响应');
    testJSONParsing(transactionMockData.withdrawSuccess, '取款响应');
    testJSONParsing(errorMockData.insufficientFunds, '资金不足错误');
    testJSONParsing(errorMockData.serverError, '服务器错误');
  };

  // 显示特定数据详情
  const showDataDetails = (data: any, type: string) => {
    setSelectedData(data);
    setDataType(type);
  };

  // 格式化货币
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // 格式化百分比
  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mock JSON 数据解析测试
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        此页面用于测试前端对后端 JSON 数据的解析能力
      </Alert>

      {/* 控制按钮 */}
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={runAllTests}
          sx={{ mr: 2 }}
        >
          运行所有测试
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => setTestResults([])}
        >
          清除结果
        </Button>
      </Box>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              测试结果 ({testResults.length} 项)
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>测试项目</TableCell>
                    <TableCell>解析状态</TableCell>
                    <TableCell>数据完整性</TableCell>
                    <TableCell>数据大小</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={result.success ? '成功' : '失败'} 
                          color={result.success ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={result.isValid ? '有效' : '无效'} 
                          color={result.isValid ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{result.dataSize} bytes</TableCell>
                      <TableCell>
                        {result.success && (
                          <Button 
                            size="small" 
                            onClick={() => showDataDetails(result.parsed, result.name)}
                          >
                            查看详情
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Mock 数据预览 */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                快速数据预览
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>投资组合数据 ({portfolioMockData.portfolio.length} 项)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => showDataDetails(portfolioMockData, '投资组合数据')}
                  >
                    查看投资组合数据解析
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>投资组合详情</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => showDataDetails(portfolioDetailsMockData, '投资组合详情')}
                  >
                    查看详情数据解析
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>交易响应数据</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => showDataDetails(transactionMockData, '交易响应')}
                  >
                    查看交易数据解析
                  </Button>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Box>

        {/* 数据详情显示 */}
        <Box sx={{ flex: 1 }}>
          {selectedData && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {dataType} - 解析结果
                </Typography>
                
                {dataType === '投资组合数据' && selectedData.portfolio && (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>股票</TableCell>
                          <TableCell>市值</TableCell>
                          <TableCell>盈亏</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedData.portfolio.map((item: PortfolioItem) => (
                          <TableRow key={item.symbol}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.symbol}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatCurrency(item.marketValue)}</TableCell>
                            <TableCell>
                              <Typography 
                                color={item.profitLoss >= 0 ? 'success.main' : 'error.main'}
                              >
                                {formatCurrency(item.profitLoss)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {dataType === '投资组合详情' && selectedData.portfolioSummary && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      投资组合概览
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="body2">总持仓金额:</Typography>
                        <Typography variant="h6">
                          {formatCurrency(selectedData.portfolioSummary.totalHoldingAmount)}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="body2">总收益:</Typography>
                        <Typography 
                          variant="h6"
                          color={selectedData.portfolioSummary.totalProfit >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(selectedData.portfolioSummary.totalProfit)}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="body2">收益率:</Typography>
                        <Typography variant="h6">
                          {formatPercent(selectedData.portfolioSummary.totalReturnPercent)}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="body2">日收益:</Typography>
                        <Typography 
                          variant="h6"
                          color={selectedData.portfolioSummary.totalDailyProfit >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(selectedData.portfolioSummary.totalDailyProfit)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* JSON 原始数据 */}
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">查看原始 JSON</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box 
                      component="pre" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        overflow: 'auto',
                        backgroundColor: 'grey.100',
                        p: 1,
                        borderRadius: 1
                      }}
                    >
                      {JSON.stringify(selectedData, null, 2)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
