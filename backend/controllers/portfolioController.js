const PortfolioItem = require('../models/portfolioItem');

// 暂时用内存数组代替数据库
let portfolio = [];

exports.getPortfolio = (req, res) => {
  res.json(portfolio);
};

exports.addItem = (req, res) => {
  const { stockTicker, volume } = req.body;
  const newItem = new PortfolioItem(Date.now().toString(), stockTicker, volume);
  portfolio.push(newItem);
  res.status(201).json(newItem);
};

exports.deleteItem = (req, res) => {
  const { id } = req.params;
  portfolio = portfolio.filter(item => item.id !== id);
  res.status(204).end();
};
