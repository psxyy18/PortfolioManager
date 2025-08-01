const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// GET /api/portfolio
router.get('/', portfolioController.getPortfolio);
// GET /api/portfolio/performance
router.get('/performance', portfolioController.getPerformance);
// GET /api/portfolio/gain-loss - Get current gain/loss for all holdings
router.get('/gain-loss', portfolioController.getGainLoss);
// Add stock to portfolio (buy)
router.post('/stock', portfolioController.addStock);
// Delete stock from portfolio (remove holding)
router.delete('/stock/:ticker', portfolioController.deleteStock);
// Sell stock (record a sell transaction)
router.post('/stock/sell', portfolioController.sellStock);
// Deposit cash
router.post('/cash/deposit', portfolioController.depositCash);
// Withdraw cash
router.post('/cash/withdraw', portfolioController.withdrawCash);
// Get transaction logs
router.get('/transactions', portfolioController.getTransactionLogs);

module.exports = router; 