const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// 路由映射
router.get('/', portfolioController.getPortfolio);
router.post('/', portfolioController.addItem);
router.delete('/:id', portfolioController.deleteItem);

module.exports = router;
