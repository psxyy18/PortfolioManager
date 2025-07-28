const db = require('../models/db');
const yahooFinance = require('yahoo-finance2').default; // 引入yahoo-finance2

// 辅助函数：通过API获取实时股价
async function getRealTimePrice(tickerSymbol) {
  try {
    const quote = await yahooFinance.quote(tickerSymbol);
    return quote.regularMarketPrice; // 返回最新市价
  } catch (err) {
    console.error(`Failed to fetch price for ${tickerSymbol}:`, err);
    throw new Error(`Price unavailable for ${tickerSymbol}`);
  }
}

// 获取用户投资组合（带实时价格）
exports.getPortfolio = async (req, res) => {
  try {
    // 1. 从数据库获取基础持仓数据
    const [holdings] = await db.query(`
      SELECT 
        s.ticker_symbol AS stockTicker,
        h.holding_shares AS volume,
        h.total_cost / h.holding_shares AS avgPrice
      FROM user_stock_holding h
      JOIN stock_info s ON h.stock_id = s.stock_id
      WHERE h.user_id = ?
    `, [req.user.id]);

    // 2. 并行获取所有股票的实时价格
    const holdingsWithPrice = await Promise.all(
      holdings.map(async (item) => {
        const currentPrice = await getRealTimePrice(item.stockTicker);
        return {
          ...item,
          currentPrice,
          unrealizedProfit: (currentPrice * item.volume) - (item.avgPrice * item.volume)
        };
      })
    );

    res.json(holdingsWithPrice);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch portfolio',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

// 买入股票（使用实时价格）
exports.addItem = async (req, res) => {
  const { stockTicker, volume } = req.body;
  
  try {
    await db.beginTransaction();

    // 1. 获取股票ID（从数据库）
    const [[stock]] = await db.query(
      `SELECT stock_id FROM stock_info WHERE ticker_symbol = ?`,
      [stockTicker]
    );
    if (!stock) throw new Error('Stock not found in database');

    // 2. 获取实时价格（从API）
    const currentPrice = await getRealTimePrice(stockTicker);

    // 3. 记录交易
    await db.query(
      `INSERT INTO stock_transaction_logs 
       (user_id, stock_id, transaction_type, price, number_of_shares)
       VALUES (?, ?, 'BUY', ?, ?)`,
      [req.user.id, stock.stock_id, currentPrice, volume]
    );

    // 4. 更新现金余额
    await db.query(
      `UPDATE user_info 
       SET cash_balance = cash_balance - ?
       WHERE user_id = ?`,
      [currentPrice * volume, req.user.id]
    );

    await db.commit();
    res.status(201).json({ 
      success: true,
      purchasePrice: currentPrice,
      totalCost: currentPrice * volume
    });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ 
      error: `Trade failed: ${err.message}` 
    });
  }
};

// 卖出股票（使用实时价格）
exports.deleteItem = async (req, res) => {
  const { stockTicker, volume } = req.body;

  try {
    await db.beginTransaction();

    // 1. 获取股票ID和持仓
    const [[stock]] = await db.query(
      `SELECT stock_id FROM stock_info WHERE ticker_symbol = ?`,
      [stockTicker]
    );
    const [[holding]] = await db.query(
      `SELECT holding_shares FROM user_stock_holding 
       WHERE user_id = ? AND stock_id = ?`,
      [req.user.id, stock.stock_id]
    );
    if (!holding || holding.holding_shares < volume) {
      throw new Error('Insufficient shares');
    }

    // 2. 获取实时价格
    const currentPrice = await getRealTimePrice(stockTicker);

    // 3. 记录交易
    await db.query(
      `INSERT INTO stock_transaction_logs 
       (user_id, stock_id, transaction_type, price, number_of_shares)
       VALUES (?, ?, 'SELL', ?, ?)`,
      [req.user.id, stock.stock_id, currentPrice, volume]
    );

    // 4. 更新现金
    await db.query(
      `UPDATE user_info 
       SET cash_balance = cash_balance + ?
       WHERE user_id = ?`,
      [currentPrice * volume, req.user.id]
    );

    await db.commit();
    res.json({ 
      success: true,
      sellPrice: currentPrice,
      proceeds: currentPrice * volume
    });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ 
      error: `Sell failed: ${err.message}` 
    });
  }
};

// ============= 收益计算（使用实时价格）=============
exports.getHoldingProfit = async (req, res) => {
  try {
    // 1. 获取持仓数据
    const [holdings] = await db.query(`
      SELECT 
        s.ticker_symbol,
        h.holding_shares,
        h.total_cost,
        h.total_profit
      FROM user_stock_holding h
      JOIN stock_info s ON h.stock_id = s.stock_id
      WHERE h.user_id = ?
    `, [req.user.id]);

    // 2. 获取所有股票的实时价格
    const symbols = holdings.map(h => h.ticker_symbol);
    const quotes = await yahooFinance.quote(symbols);

    // 3. 计算收益
    let realizedProfit = 0;
    let unrealizedProfit = 0;

    holdings.forEach(holding => {
      const quote = quotes.find(q => q.symbol === holding.ticker_symbol);
      if (quote) {
        const currentValue = quote.regularMarketPrice * holding.holding_shares;
        unrealizedProfit += currentValue - holding.total_cost;
      }
      realizedProfit += holding.total_profit;
    });

    res.json({ 
      realizedProfit,
      unrealizedProfit,
      totalProfit: realizedProfit + unrealizedProfit
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Profit calculation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};