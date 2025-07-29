const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Get current status of a specific stock
router.get('/:ticker/current', stockController.getCurrentStockStatus);

// Get historical data for a specific stock in a specific period
router.get('/:ticker/history', stockController.getStockHistory);

// Get top N stocks by market cap (optionally filtered by industry)
router.get('/top-stocks', stockController.getTopStocks);

// TODO: Add more stock endpoints

module.exports = router; 