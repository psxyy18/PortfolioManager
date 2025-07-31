'use client';
import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Link from 'next/link';
import StatCard, { StatCardProps } from '../components/StatCard';
import PortfolioBubbleChart from '../components/PortfolioBubbleChart';
import SingleStockLineChart from '../components/SingleStockLineChart';
import { useGlobalPortfolio } from '../../contexts/GlobalPortfolioContext';

export default function DashboardContent() {
  // 使用全局状态
  const { 
    userBalance, 
    portfolioSummary, 
    userHoldings,
    isLoading,
    error 
  } = useGlobalPortfolio();
  
  // 管理选中的股票状态
  const [selectedStock, setSelectedStock] = React.useState<string | null>(null);

  // 格式化货币
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // 基于实时状态生成统计卡片数据
  const data: StatCardProps[] = React.useMemo(() => [
    {
      title: '今日收益',
      value: `${portfolioSummary.todayTotalPnL >= 0 ? '+' : ''}${formatCurrency(Math.abs(portfolioSummary.todayTotalPnL))}`,
      interval: 'Today',
      trend: portfolioSummary.todayTotalPnL > 0 ? 'up' : 'down',
      data: [
        -200, 150, -80, 320, 180, -150, 240, 380, -120, 280, 420, 180, -90, 350, 220, -180, 290, 410, 160, -120, 380, 250, -200, 320, 180, -90, 450, 280, 360, portfolioSummary.todayTotalPnL,
      ],
    },
    {
      title: '持仓收益',
      value: `${portfolioSummary.totalUnrealizedPnL >= 0 ? '+' : ''}${formatCurrency(Math.abs(portfolioSummary.totalUnrealizedPnL))}`,
      interval: 'Current Holdings',
      trend: portfolioSummary.totalUnrealizedPnL > 0 ? 'up' : 'down',
      data: [
        2100, 2300, 2800, 3100, 2900, 3400, 3200, 3800, 4100, 3900, 4300, 4600, 4400, 4800, 4500, 5100, 4900, 5300, 5000, 5400, 5200, 5600, 5300, 5700, 5500, 5800, 5600, 6100, 5900, portfolioSummary.totalUnrealizedPnL,
      ],
    },
    {
      title: '总资产',
      value: formatCurrency(portfolioSummary.totalAssets),
      interval: 'Total Assets',
      trend: portfolioSummary.totalAssets > portfolioSummary.totalCost ? 'up' : 'down',
      data: [
        1200, 1400, 1800, 2100, 1900, 2400, 2200, 2800, 3100, 2900, 3300, 3600, 3400, 3800, 3500, 4100, 3900, 4300, 4000, 4400, 4200, 4600, 4300, 4700, 4500, 4800, 4600, 5100, 4900, portfolioSummary.totalAssets,
      ],
    },
  ], [portfolioSummary, formatCurrency]);

  // 处理气泡图中股票的点击事件
  const handleStockSelect = (symbol: string | null) => {
    setSelectedStock(symbol);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflow: 'auto',
        })}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
            {/* 账户总览 - 全长卡片 */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      投资组合总览
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(portfolioSummary.totalAssets)}
                      </Typography>
                      <Chip
                        label={`${portfolioSummary.totalUnrealizedPnLPercent >= 0 ? '+' : ''}${portfolioSummary.totalUnrealizedPnLPercent.toFixed(2)}%`}
                        color={portfolioSummary.totalUnrealizedPnL >= 0 ? "success" : "error"}
                        variant="outlined"
                        sx={{ fontSize: '1rem', height: '32px' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      总资产 • 总收益率 {portfolioSummary.totalUnrealizedPnLPercent >= 0 ? '+' : ''}{portfolioSummary.totalUnrealizedPnLPercent.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      可用现金
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(userBalance.cashBalance)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 三分格子：昨日收益、持仓收益、累计收益 */}
            <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
              {data.map((card, index) => (
                <Grid key={index} size={{ xs: 12, sm: 4 }}>
                  <StatCard {...card} />
                </Grid>
              ))}
            </Grid>
            
            {/* 图表区域：左边气泡图，右边单股收益走势 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <PortfolioBubbleChart onStockSelect={handleStockSelect} selectedStock={selectedStock} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SingleStockLineChart selectedStock={selectedStock} />
              </Grid>
            </Grid>
            
            {/* Development Test Links */}
            {/* <Box sx={{ mt: 4, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                开发测试工具
              </Typography>
              <Stack direction="row" spacing={2}>
                <Link href="/mock-test" passHref>
                  <Button variant="outlined" size="small">
                    📊 Mock JSON 数据解析测试
                  </Button>
                </Link>
                <Link href="/details" passHref>
                  <Button variant="contained" size="small">
                    Trade Platform
                  </Button>
                </Link>
              </Stack>
            </Box> */}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
