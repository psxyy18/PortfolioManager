import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
  trendValue?: string; // 可选的动态百分比值
};

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

// 获取当前月份的日期
function getCurrentMonthDays() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() 返回 0-11，所以需要 +1
  const currentYear = now.getFullYear();
  return getDaysInMonth(currentMonth, currentYear);
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({ title, value, interval, trend, data, trendValue }: StatCardProps) {
  const theme = useTheme();
  const daysInWeek = getCurrentMonthDays();

  const trendColors = {
    up: theme.palette.mode === 'light' ? theme.palette.success.main : theme.palette.success.dark,
    down: theme.palette.mode === 'light' ? theme.palette.error.main : theme.palette.error.dark,
    neutral: theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[700],
  };

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  const trendValues = { up: '+25.00%', down: '-25.00%', neutral: '+5.00%' };
  
  // 使用传入的trendValue或默认的placeholder值
  const displayTrendValue = trendValue || trendValues[trend];

  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack direction="column" sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}>
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="p">
                {value}
              </Typography>
              <Chip size="small" color={color} label={displayTrendValue} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {interval}
            </Typography>
          </Stack>
          <Box sx={{ width: '100%', height: 50 }}>
            <SparkLineChart
              color={chartColor}
              data={data}
              area
              showHighlight
              showTooltip
              valueFormatter={(value: number | null) => {
                if (value === null) return '';
                // 为持仓收益（包含收益数据）显示两位小数
                if (title === '持仓收益' || title === '累计收益') {
                  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
                }
                return value.toString();
              }}
              xAxis={{
                scaleType: 'band',
                data: daysInWeek, // Use the correct property 'data' for xAxis
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${value})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
