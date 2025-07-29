const db = require('../models/db');
const yahooFinance = require('yahoo-finance2').default;

// 获取实时市场数据（带降级处理）
async function getMarketData(tickerSymbol) {
  try {
    // 先尝试 Yahoo
    const quote = await yahooFinance.quote(tickerSymbol);
    return {
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent
    };
  } catch (err) {
    console.warn(`[Market Data] Yahoo API failed for ${tickerSymbol}: ${err.message}`);
    
    // Yahoo 报错时，回退到 stock_hist 的最新收盘价
    const rows = await db.query(
      `SELECT close_price FROM stock_hist
       WHERE ticker_symbol = ?
       ORDER BY price_date DESC
       LIMIT 1`,
      [tickerSymbol]
    );

    if (rows.length > 0) {
      const fallbackPrice = parseFloat(rows[0].close_price);
      console.log(`[Market Data] Using fallback local price ${fallbackPrice} for ${tickerSymbol}`);
      return { price: fallbackPrice, change: 0, changePercent: 0 };
    } else {
      throw new Error(`Market data unavailable for ${tickerSymbol}`);
    }
  }
}


// 获取投资组合
exports.getPortfolio = async (req, res) => {
  const userId = 1;
  try {
    const holdings = await db.query(`
      SELECT 
        s.ticker_symbol,
        s.company_name,
        s.exchange_name,
        h.holding_shares AS quantity,
        h.total_cost / h.holding_shares AS avg_cost
      FROM user_stock_holding h
      JOIN stock_info s ON h.stock_id = s.stock_id
      WHERE h.user_id = ?
    `, [userId]);

    const symbols = holdings.map(h => h.ticker_symbol);
    const marketData = await Promise.all(
      symbols.map(symbol => getMarketData(symbol).catch(() => null))
    );

    const portfolio = holdings.map((holding, index) => {
      const data = marketData[index];
      return {
        symbol: holding.ticker_symbol,
        name: holding.company_name,
        exchange: holding.exchange_name,
        quantity: holding.quantity,
        costBasis: holding.avg_cost * holding.quantity,
        avgCost: holding.avg_cost,
        currentPrice: data?.price || null,
        marketValue: data ? data.price * holding.quantity : null,
        dailyChange: data?.change || null,
        dailyChangePercent: data?.changePercent || null,
        profitLoss: data ? (data.price - holding.avg_cost) * holding.quantity : null
      };
    });

    res.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      portfolio
    });
  } catch (err) {
    console.error('getPortfolio error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load portfolio',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

// 买入股票
exports.addItem = async (req, res) => {
  const { symbol, quantity } = req.body;
  const userId = 1; // 单用户模式

  try {
    // 0. 验证股票是否存在
    const stockRows = await db.query(
      `SELECT stock_id FROM stock_info WHERE ticker_symbol = ?`,
      [symbol]
    );
    if (stockRows.length === 0) throw new Error('Invalid stock symbol');
    const stock = stockRows[0];

    // 1. 优先从 Yahoo 获取实时价格，失败时回退到 stock_hist
    let price = null;
    try {
      const data = await getMarketData(symbol);
      price = data.price;
    } catch (err) {
      console.warn(`[WARN] Yahoo 数据获取失败，使用 stock_hist 表回退价格: ${err.message}`);
      const histRows = await db.query(
        `SELECT close_price FROM stock_hist 
         WHERE stock_id = ?
         ORDER BY price_date DESC LIMIT 1`,
        [stock.stock_id]
      );
      if (histRows.length === 0) {
        throw new Error('No fallback price available for this stock');
      }
      price = parseFloat(histRows[0].close_price);
    }

    if (!price || price <= 0) {
      throw new Error('Invalid market price');
    }

    const totalCost = price * quantity;

    // 2. 检查现金余额
    const userRows = await db.query(
      `SELECT cash_balance FROM user_info WHERE user_id = ?`,
      [userId]
    );
    const user = userRows[0];
    if (!user || user.cash_balance < totalCost) {
      throw new Error(
        `Insufficient funds. Needed: $${totalCost.toFixed(2)}, Available: $${user?.cash_balance ?? 0}`
      );
    }

    // 3. 开启事务
    const conn = await db.beginTransaction();
    try {
      // 3.1 更新或插入持仓
      const holdingRows = await conn.query(
        `SELECT holding_shares, total_cost 
         FROM user_stock_holding 
         WHERE user_id = ? AND stock_id = ?`,
        [userId, stock.stock_id]
      );
      const existingHolding = holdingRows[0][0]; // 注意事务返回的是 [rows, fields]

      if (existingHolding) {
        await conn.query(
          `UPDATE user_stock_holding
           SET holding_shares = holding_shares + ?,
               total_cost = total_cost + ?
           WHERE user_id = ? AND stock_id = ?`,
          [quantity, totalCost, userId, stock.stock_id]
        );
      } else {
        await conn.query(
          `INSERT INTO user_stock_holding
             (user_id, stock_id, holding_shares, total_cost)
           VALUES (?, ?, ?, ?)`,
          [userId, stock.stock_id, quantity, totalCost]
        );
      }

      // 3.2 扣除现金
      await conn.query(
        `UPDATE user_info
         SET cash_balance = cash_balance - ?
         WHERE user_id = ?`,
        [totalCost, userId]
      );

      // 3.3 插入交易日志
      await conn.query(
        `INSERT INTO stock_transaction_logs 
           (user_id, ticker_symbol, transaction_type, price, number_of_shares)
         VALUES (?, ?, 'BUY', ?, ?, ?)`,
        [userId, symbol, price, quantity]
      );

      // 提交事务
      await db.commit(conn);

      res.json({
        success: true,
        message: `Bought ${quantity} shares of ${symbol} at $${price.toFixed(2)}`
      });
    } catch (txError) {
      await db.rollback(conn);
      throw txError;
    }
  } catch (err) {
    console.error('addItem error:', err);
    res.status(400).json({
      success: false,
      message: `Trade failed: ${err.message}`
    });
  }
};

// 卖出股票
// 卖出股票
exports.sellItem = async (req, res) => {
  const { symbol, quantity } = req.body;
  const userId = 1;

  // 参数检查
  if (!symbol || !quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request: symbol and positive quantity required'
    });
  }

  try {
    // 1. 查找股票信息
    const stockRows = await db.query(
      `SELECT stock_id FROM stock_info WHERE ticker_symbol = ?`,
      [symbol]
    );
    if (stockRows.length === 0) throw new Error(`Stock ${symbol} not found`);
    const stock = stockRows[0];

    // 2. 查询用户持仓
    const holdings = await db.query(
      `SELECT holding_shares, total_cost
       FROM user_stock_holding
       WHERE user_id = ? AND stock_id = ?`,
      [userId, stock.stock_id]
    );
    const holding = holdings[0];
    if (!holding) {
      throw new Error(`You don't hold any shares of ${symbol}`);
    }
    if (holding.holding_shares < quantity) {
      throw new Error(
        `Insufficient shares: requested ${quantity}, held ${holding.holding_shares}`
      );
    }

    // 3. 获取最新市场价格（或数据库降级价格）
    const { price } = await getMarketData(symbol);
    if (!price || price <= 0) {
      throw new Error('Invalid market price');
    }

    // 4. 计算交易金额
    const avgCost = holding.total_cost / holding.holding_shares;
    const costBasis = parseFloat((avgCost * quantity).toFixed(2));
    const saleValue = parseFloat((price * quantity).toFixed(2));
    const realizedGain = parseFloat((saleValue - costBasis).toFixed(2));

    // 5. 开启事务
    const conn = await db.beginTransaction();
    try {
      // 5.1 记录交易日志
      await conn.query(
        `INSERT INTO stock_transaction_logs (
          user_id,
          ticker_symbol,
          transaction_type,
          price,
          number_of_shares,
          realized_gain
        ) VALUES (?, ?, 'SELL', ?, ?, ?)`,
        [userId, symbol, price, quantity, realizedGain]
      );

      // 5.2 更新持仓
      await conn.query(
        `UPDATE user_stock_holding
         SET 
           holding_shares = ROUND(holding_shares - ?, 4),
           total_cost = ROUND(total_cost - ?, 2)
         WHERE user_id = ? AND stock_id = ?`,
        [quantity, costBasis, userId, stock.stock_id]
      );

      // 5.3 删除零持仓
      await conn.query(
        `DELETE FROM user_stock_holding
         WHERE user_id = ? AND stock_id = ? AND holding_shares <= 0`,
        [userId, stock.stock_id]
      );

      // 5.4 更新账户余额
      await conn.query(
        `UPDATE user_info
         SET cash_balance = cash_balance + ?
         WHERE user_id = ?`,
        [saleValue, userId]
      );

      // 提交事务
      await db.commit(conn);

      // 6. 返回结果
      res.json({
        success: true,
        symbol,
        executedPrice: price,
        quantity,
        costBasis,
        proceeds: saleValue,
        realizedGain
      });
    } catch (txError) {
      await db.rollback(conn);
      throw txError;
    }

  } catch (err) {
    console.error('sellItem error:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


// 存款
exports.deposit = async (req, res) => {
  const { amount } = req.body;
  const userId = 1;
  try {
    await db.query(
      `UPDATE user_info SET cash_balance = cash_balance + ? WHERE user_id = ?`,
      [amount, userId]
    );
    const [user] = await db.query(
      `SELECT cash_balance FROM user_info WHERE user_id = ?`,
      [userId]
    );
    res.json({ success: true, newBalance: user.cash_balance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Deposit failed' });
  }
};

// 取款
exports.withdraw = async (req, res) => {
  const { amount } = req.body;
  const userId = 1;
  try {
    await db.query(
      `UPDATE user_info SET cash_balance = cash_balance - ? WHERE user_id = ?`,
      [amount, userId]
    );
    const [user] = await db.query(
      `SELECT cash_balance FROM user_info WHERE user_id = ?`,
      [userId]
    );
    res.json({ success: true, newBalance: user.cash_balance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Withdrawal failed' });
  }
};

// 删除持仓
exports.deleteItem = async (req, res) => {
  const stockId = parseInt(req.params.id, 10);
  const userId = 1;
  if (isNaN(stockId)) return res.status(400).json({ success: false, message: 'Invalid stock id' });

  try {
    const result = await db.query(
      `DELETE FROM user_stock_holding WHERE user_id = ? AND stock_id = ?`,
      [userId, stockId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No holding found for stock_id=${stockId}` });
    }
    res.json({ success: true, message: `Holding with stock_id=${stockId} deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete holding' });
  }
};

exports.getPortfolioDetails = async (req, res) => {
  const userId = 1;
  try {
    // 查询持仓
    const holdings = await db.query(`
      SELECT 
        s.ticker_symbol,
        s.company_name,
        s.exchange_name,
        h.holding_shares AS quantity,
        h.total_cost,
        h.total_profit AS realized_profit
      FROM user_stock_holding h
      JOIN stock_info s ON h.stock_id = s.stock_id
      WHERE h.user_id = ?
    `, [userId]);

    if (holdings.length === 0) {
      return res.json({
        success: true,
        portfolioSummary: { totalHoldingAmount: 0, totalProfit: 0, totalDailyProfit: 0, totalReturnPercent: 0 },
        stockDetails: []
      });
    }

    const symbols = holdings.map(h => h.ticker_symbol);

    // 获取实时市场数据
    const marketData = await Promise.all(
      symbols.map(symbol => getMarketData(symbol).catch(() => null))
    );

    // 计算各股票指标
    const stockDetails = holdings.map((holding, index) => {
      const current = marketData[index];
      const currentPrice = current?.price || holding.total_cost / holding.quantity;

      const marketValue = currentPrice * holding.quantity;
      const costBasis = holding.total_cost;
      const unrealizedProfit = marketValue - costBasis;

      return {
        symbol: holding.ticker_symbol,
        name: holding.company_name,
        exchange: holding.exchange_name,
        holdingAmount: marketValue,
        totalProfit: unrealizedProfit + (holding.realized_profit || 0),
        breakdown: {
          realized: holding.realized_profit || 0,
          unrealized: unrealizedProfit,
          costBasis
        }
      };
    });

    // 计算整体指标
    const portfolioSummary = stockDetails.reduce((acc, s) => {
      acc.totalHoldingAmount += s.holdingAmount;
      acc.totalProfit += s.totalProfit;
      acc.totalCostBasis += s.breakdown.costBasis;
      return acc;
    }, { totalHoldingAmount: 0, totalProfit: 0, totalCostBasis: 0 });

    portfolioSummary.totalReturnPercent =
      portfolioSummary.totalCostBasis > 0
        ? (portfolioSummary.totalProfit / portfolioSummary.totalCostBasis) * 100
        : 0;

    res.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      portfolioSummary,
      stockDetails
    });
  } catch (err) {
    console.error('getPortfolioDetails error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load portfolio details'
    });
  }
};

