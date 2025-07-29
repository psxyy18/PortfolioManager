import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{ height: '100%' }} variant="outlined">
      <CardContent>
        <TrendingUpIcon />
        <Typography component="h2" variant="subtitle2" gutterBottom sx={{ fontWeight: '600' }}>
          Market Insights
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          Discover investment opportunities and optimize your portfolio performance.
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
        >
          View Analysis
        </Button>
      </CardContent>
    </Card>
  );
}
