'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { usePortfolio } from '../../hooks/usePortfolio';

interface AccountManagementProps {
  showTitle?: boolean;
  compact?: boolean;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ 
  showTitle = true,
  compact = false 
}) => {
  const { data: portfolioData, loading: isLoading, error } = usePortfolio();
  
  // Transform API data to match expected format
  const userBalance = {
    cashBalance: portfolioData?.cash || 0,
    currency: 'USD'
  };

  const portfolioSummary = {
    totalValue: portfolioData?.stocks?.reduce((sum, stock) => sum + Number(stock.total_cost || 0), 0) || 0,
    totalCost: portfolioData?.stocks?.reduce((sum, stock) => sum + Number(stock.total_cost || 0), 0) || 0,
    totalUnrealizedPnL: portfolioData?.stocks?.reduce((sum, stock) => sum + Number(stock.total_profit || 0), 0) || 0,
    totalUnrealizedPnLPercent: 0,
    todayTotalPnL: 0,
    todayTotalPnLPercent: 0,
    cashBalance: portfolioData?.cash || 0,
    totalAssets: (portfolioData?.cash || 0) + (portfolioData?.stocks?.reduce((sum, stock) => sum + Number(stock.total_cost || 0), 0) || 0),
    weightedAverageReturn: 0
  };

  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Real API functions for cash operations
  const addCash = async (amount: number) => {
    try {
      setIsProcessing(true);
      setActionError(null);
      
      const response = await fetch('/api/portfolio/cash/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deposit cash');
      }

      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      console.error('Error depositing cash:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to deposit cash');
    } finally {
      setIsProcessing(false);
    }
  };

  const withdrawCash = async (amount: number): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setActionError(null);
      
      const response = await fetch('/api/portfolio/cash/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to withdraw cash');
      }

      // Refresh the page to update the data
      window.location.reload();
      return true;
    } catch (error) {
      console.error('Error withdrawing cash:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to withdraw cash');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshPortfolio = async () => {
    window.location.reload();
  };

  // 格式化货币
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // 处理存款
  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setActionError('请输入有效的金额');
      return;
    }

    await addCash(depositAmount);
    setDepositDialogOpen(false);
    setAmount('');
    setActionError(null);
  };

  // 处理提现
  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setActionError('请输入有效的金额');
      return;
    }

    const success = await withdrawCash(withdrawAmount);
    if (success) {
      setWithdrawDialogOpen(false);
      setAmount('');
      setActionError(null);
    }
  };

  // 快速金额按钮
  const quickAmounts = [100, 500, 1000, 5000, 10000];

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* <AccountBalanceIcon sx={{ color: 'primary.main' }} /> */}
          {/* <Typography variant="h6" fontWeight="bold">
            {formatCurrency(userBalance.cashBalance)}
          </Typography> */}
          {/* <Typography variant="body2" color="text.secondary">
            可用资金
          </Typography> */}
        </Box>
        
        <Tooltip title="Deposit">
  <IconButton 
    color="success" 
    size="small"
    onClick={() => setDepositDialogOpen(true)}
  >
    <AddIcon />
  </IconButton>
</Tooltip>

<Tooltip title="Withdraw">
  <IconButton 
    color="error" 
    size="small"
    onClick={() => setWithdrawDialogOpen(true)}
  >
    <RemoveIcon />
  </IconButton>
</Tooltip>

<Tooltip title="Refresh Data">
  <IconButton 
    color="primary" 
    size="small"
    onClick={refreshPortfolio}
    disabled={isLoading || isProcessing}
  >
    <RefreshIcon />
  </IconButton>
</Tooltip>


        {/* 对话框保持不变 */}
        {renderDialogs()}
      </Box>
    );
  }

  function renderDialogs() {
  return (
    <>
      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {actionError && (
              <Alert severity="error" onClose={() => setActionError(null)}>
                {actionError}
              </Alert>
            )}

            <TextField
              label="Deposit Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              placeholder="Enter deposit amount"
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick Select:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {quickAmounts.map((quickAmount) => (
                  <Chip
                    key={quickAmount}
                    label={formatCurrency(quickAmount)}
                    onClick={() => setAmount(quickAmount.toString())}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeposit}
            variant="contained"
            color="success"
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Deposit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {actionError && (
              <Alert severity="error" onClose={() => setActionError(null)}>
                {actionError}
              </Alert>
            )}

            <Alert severity="info">
              Available Balance: {formatCurrency(userBalance.cashBalance)}
            </Alert>

            <TextField
              label="Withdrawal Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              inputProps={{ min: 0, max: userBalance.cashBalance, step: 0.01 }}
              placeholder="Enter withdrawal amount"
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick Select:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {quickAmounts
                  .filter(amount => amount <= userBalance.cashBalance)
                  .map((quickAmount) => (
                    <Chip
                      key={quickAmount}
                      label={formatCurrency(quickAmount)}
                      onClick={() => setAmount(quickAmount.toString())}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                {userBalance.cashBalance > 0 && (
                  <Chip
                    label="Withdraw All"
                    onClick={() => setAmount(userBalance.cashBalance.toString())}
                    variant="outlined"
                    size="small"
                    color="error"
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            color="error"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance.cashBalance || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

return (
  <Card>
    <CardContent>
      {showTitle && (
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon color="primary" />
          Account Management
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Balance Section */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Available Cash
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton
              size="small"
              onClick={refreshPortfolio}
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Typography variant="h4" fontWeight="bold" color="primary.main">
          {formatCurrency(userBalance.cashBalance)}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Total Assets: {formatCurrency(portfolioSummary.totalAssets)}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => setDepositDialogOpen(true)}
          fullWidth
        >
          Deposit
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<RemoveIcon />}
          onClick={() => setWithdrawDialogOpen(true)}
          disabled={userBalance.cashBalance <= 0}
          fullWidth
        >
          Withdraw
        </Button>
      </Stack>

      {/* Portfolio Summary */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Portfolio Summary
        </Typography>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Market Value</Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatCurrency(portfolioSummary.totalValue)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Total P&L</Typography>
            <Typography
              variant="body2"
              fontWeight="medium"
              color={portfolioSummary.totalUnrealizedPnL >= 0 ? 'success.main' : 'error.main'}
            >
              {portfolioSummary.totalUnrealizedPnL >= 0 ? '+' : ''}
              {formatCurrency(portfolioSummary.totalUnrealizedPnL)}
              ({portfolioSummary.totalUnrealizedPnLPercent.toFixed(2)}%)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Today's P&L</Typography>
            <Typography
              variant="body2"
              fontWeight="medium"
              color={portfolioSummary.todayTotalPnL >= 0 ? 'success.main' : 'error.main'}
            >
              {portfolioSummary.todayTotalPnL >= 0 ? '+' : ''}
              {formatCurrency(portfolioSummary.todayTotalPnL)}
              ({portfolioSummary.todayTotalPnLPercent.toFixed(2)}%)
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Dialogs */}
      {renderDialogs()}
    </CardContent>
  </Card>
);
}

export default AccountManagement;
