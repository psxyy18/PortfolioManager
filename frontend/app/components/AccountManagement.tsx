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
import { useGlobalPortfolio } from '../../contexts/GlobalPortfolioContext';

interface AccountManagementProps {
  showTitle?: boolean;
  compact?: boolean;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ 
  showTitle = true,
  compact = false 
}) => {
  const {
    userBalance,
    portfolioSummary,
    addCash,
    withdrawCash,
    refreshPortfolio,
    isLoading,
    error
  } = useGlobalPortfolio();

  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // 格式化货币
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // 处理存款
  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setActionError('请输入有效的金额');
      return;
    }

    addCash(depositAmount);
    setDepositDialogOpen(false);
    setAmount('');
    setActionError(null);
  };

  // 处理提现
  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setActionError('请输入有效的金额');
      return;
    }

    const success = withdrawCash(withdrawAmount);
    if (success) {
      setWithdrawDialogOpen(false);
      setAmount('');
      setActionError(null);
    } else {
      setActionError('余额不足');
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
        
        <Tooltip title="存款">
          <IconButton 
            color="success" 
            size="small"
            onClick={() => setDepositDialogOpen(true)}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="提现">
          <IconButton 
            color="error" 
            size="small"
            onClick={() => setWithdrawDialogOpen(true)}
          >
            <RemoveIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="刷新数据">
          <IconButton 
            color="primary" 
            size="small"
            onClick={refreshPortfolio}
            disabled={isLoading}
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
        {/* 存款对话框 */}
        <Dialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>存入资金</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {actionError && (
                <Alert severity="error" onClose={() => setActionError(null)}>
                  {actionError}
                </Alert>
              )}
              
              <TextField
                label="存入金额"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="请输入存入金额"
              />
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  快速选择:
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
            <Button onClick={() => setDepositDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleDeposit} 
              variant="contained" 
              color="success"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              确认存入
            </Button>
          </DialogActions>
        </Dialog>

        {/* 提现对话框 */}
        <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>提取资金</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {actionError && (
                <Alert severity="error" onClose={() => setActionError(null)}>
                  {actionError}
                </Alert>
              )}
              
              <Alert severity="info">
                当前可用余额: {formatCurrency(userBalance.cashBalance)}
              </Alert>
              
              <TextField
                label="提现金额"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                inputProps={{ min: 0, max: userBalance.cashBalance, step: 0.01 }}
                placeholder="请输入提现金额"
              />
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  快速选择:
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
                      label="全部提现"
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
            <Button onClick={() => setWithdrawDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleWithdraw} 
              variant="contained" 
              color="error"
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance.cashBalance}
            >
              确认提现
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
            账户管理
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 账户余额展示 */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              可用现金
            </Typography>
            <Tooltip title="刷新数据">
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
            总资产: {formatCurrency(portfolioSummary.totalAssets)}
          </Typography>
        </Box>

        {/* 操作按钮 */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setDepositDialogOpen(true)}
            fullWidth
          >
            存入资金
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<RemoveIcon />}
            onClick={() => setWithdrawDialogOpen(true)}
            disabled={userBalance.cashBalance <= 0}
            fullWidth
          >
            提取资金
          </Button>
        </Stack>

        {/* 投资组合摘要 */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            投资组合摘要
          </Typography>
          
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">持仓市值</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(portfolioSummary.totalValue)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">总盈亏</Typography>
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
              <Typography variant="body2">今日盈亏</Typography>
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

        {/* 对话框 */}
        {renderDialogs()}
      </CardContent>
    </Card>
  );
};

export default AccountManagement;
