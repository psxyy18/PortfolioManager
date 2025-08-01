import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

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

export default function PortfolioReturnChart() {
  const theme = useTheme();
  const data = getDaysInMonth(7, 2025); // July 2025

  const colorPalette = [
    theme.palette.success.main,
  ];

  // Portfolio value progression data (30 days)
  const portfolioData = [
    156805, 157420, 158150, 159200, 158900, 160100, 159800, 161200, 162300, 161900,
    163400, 164100, 163800, 165200, 164900, 166800, 165600, 167300, 166900, 168800,
    167400, 169900, 168200, 170600, 169800, 172200, 171100, 173500, 172800, 164568
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Portfolio Returns
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              $164.5k
            </Typography>
            <Chip size="small" color="success" label="+4.95%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Portfolio value for the last 30 days
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data,
              tickInterval: (index, i) => (i + 1) % 5 === 0,
            },
          ]}
          series={[
            {
              id: 'portfolio',
              label: 'Portfolio Value',
              showMark: false,
              curve: 'linear',
              area: true,
              data: portfolioData,
            },
          ]}
          width={undefined}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true, vertical: true }}
        >
          <AreaGradient color={theme.palette.success.main} id="portfolio" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
