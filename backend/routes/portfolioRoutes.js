const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// 获取投资组合
router.get('/', portfolioController.getPortfolio);

// （可选）组合详情
if (typeof portfolioController.getPortfolioDetails === 'function') {
  router.get('/details', portfolioController.getPortfolioDetails);
} else {
  // 如果没有实现 getPortfolioDetails，就返回提示
  router.get('/details', (req, res) => {
    res.json({
      success: false,
      message: 'Portfolio details API not implemented'
    });
  });
}

// 买入
router.post('/', portfolioController.addItem);

// 删除持仓
router.delete('/:id', portfolioController.deleteItem);

// 存款
router.post('/deposit', portfolioController.deposit);

// 取款
router.post('/withdraw', portfolioController.withdraw);

// 卖出股票
router.post('/sell', portfolioController.sellItem);

router.get('/details', portfolioController.getPortfolioDetails);


module.exports = router;
