'use client';
import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StatCard, { StatCardProps } from '../components/StatCard';
import HighlightedCard from '../components/HiglightedCard';
import PortfolioReturnChart from '../components/PortfolioReturnChart';
import StockHoldingsBubbleChart from '../components/StockHoldingsBubbleChart';
import CustomTreeView from '../components/CustomTreeView';
import ChartUserByCountry from '../components/ChartUserByCountry';

const data: StatCardProps[] = [
  {
    title: 'Portfolio Value',
    value: '$164.5k',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      45000, 46200, 47100, 48500, 47800, 49200, 48600, 50100, 51200, 49800, 52300, 53100, 52800, 54200, 53900, 55800, 54600, 56300, 55900, 57800, 56400, 58900, 57200, 59600, 58800, 61200, 60100, 63500, 62800, 64568,
    ],
  },
  {
    title: 'Today\'s P&L',
    value: '+$1.26k',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      -200, 150, -80, 320, 180, -150, 240, 380, -120, 280, 420, 180, -90, 350, 220, -180, 290, 410, 160, -120, 380, 250, -200, 320, 180, -90, 450, 280, 360, 1260,
    ],
  },
  {
    title: 'Total Return',
    value: '+4.95%',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      2.1, 2.3, 2.8, 3.1, 2.9, 3.4, 3.2, 3.8, 4.1, 3.9, 4.3, 4.6, 4.4, 4.8, 4.5, 5.1, 4.9, 5.3, 5.0, 5.4, 5.2, 5.6, 5.3, 5.7, 5.5, 5.8, 5.6, 6.1, 5.9, 4.95,
    ],
  },
];

export default function DashboardContent() {
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
            {/* cards */}
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              Portfolio Overview
            </Typography>
            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
              {data.map((card, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard {...card} />
                </Grid>
              ))}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <HighlightedCard />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <PortfolioReturnChart />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <StockHoldingsBubbleChart />
              </Grid>
            </Grid>
            <Grid container spacing={2} columns={12}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Stack gap={2} direction={{ xs: 'column', sm: 'row' }}>
                  <CustomTreeView />
                  <ChartUserByCountry />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
