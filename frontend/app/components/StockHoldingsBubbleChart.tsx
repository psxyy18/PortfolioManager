import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { useTheme } from '@mui/material/styles';

export default function StockHoldingsBubbleChart() {
  const theme = useTheme();
  
  // 股票持仓数据：x=持仓量, y=收益率, size=市值
  const stockData = [
    {
      id: 'AAPL',
      x: 50,           // 持仓量
      y: 16.7,         // 收益率%
      size: 8765,      // 市值
      name: 'Apple'
    },
    {
      id: 'GOOGL', 
      x: 25,
      y: 4.9,
      size: 69512,
      name: 'Google'
    },
    {
      id: 'TSLA',
      x: 30,
      y: -11.6,
      size: 5856,
      name: 'Tesla'
    },
    {
      id: 'MSFT',
      x: 40,
      y: 8.1,
      size: 13430,
      name: 'Microsoft'
    },
    {
      id: 'AMZN',
      x: 20,
      y: 4.7,
      size: 67005,
      name: 'Amazon'
    },
    {
      id: 'NVDA',
      x: 15,
      y: 15.4,
      size: 7284,
      name: 'NVIDIA'
    }
  ];

  // 转换数据为ScatterChart格式
  const scatterData = stockData.map(stock => ({
    x: stock.x,
    y: stock.y,
    id: stock.id,
    // 将市值映射到气泡大小 (10-100像素)
    size: Math.max(10, Math.min(100, (stock.size / 1000) + 10))
  }));

  // 根据收益率确定颜色
  const getColor = (returnRate: number) => {
    if (returnRate > 0) {
      return theme.palette.success.main;
    } else {
      return theme.palette.error.main;
    }
  };

  // 创建正收益和负收益的两个系列
  const positiveReturns = scatterData.filter(item => item.y > 0);
  const negativeReturns = scatterData.filter(item => item.y <= 0);

  const totalGain = stockData
    .filter(stock => stock.y > 0)
    .reduce((sum, stock) => sum + stock.y, 0);

  const averageReturn = stockData.reduce((sum, stock) => sum + stock.y, 0) / stockData.length;

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Holdings Performance
        </Typography>
        <Stack sx={{ justifyContent: 'space-between', mb: 2 }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {averageReturn.toFixed(1)}%
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: averageReturn >= 0 ? 'success.main' : 'error.main',
                fontWeight: 'medium'
              }}
            >
              Avg Return
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Bubble size shows market value, position shows shares vs returns
          </Typography>
        </Stack>
        
        <ScatterChart
          width={undefined}
          height={250}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          series={[
            {
              label: 'Positive Returns',
              data: positiveReturns,
              color: theme.palette.success.main,
            },
            {
              label: 'Negative Returns', 
              data: negativeReturns,
              color: theme.palette.error.main,
            },
          ]}
          xAxis={[{
            label: 'Shares Held',
            min: 0,
            max: Math.max(...scatterData.map(d => d.x)) + 10,
          }]}
          yAxis={[{
            label: 'Return %',
            min: Math.min(...scatterData.map(d => d.y)) - 2,
            max: Math.max(...scatterData.map(d => d.y)) + 2,
          }]}
          grid={{ horizontal: true, vertical: true }}
        />
      </CardContent>
    </Card>
  );
}
