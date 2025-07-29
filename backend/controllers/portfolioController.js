const db = require('../models/db');
const yahooFinance = require('yahoo-finance2').default;

// 辅助函数：获取实时市场数据
async function getMarketData(tickerSymbol) {
  try {
    const quote = await yahooFinance.quote(tickerSymbol);
    return {
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent
    };
  } catch (err) {
    console.error(`[Market Data] Failed to fetch ${tickerSymbol}:`, err.message);
    throw new Error(`Market data unavailable for ${tickerSymbol}`);
  }
}

// 获取完整投资组合（带实时市场数据）
exports.getPortfolio = async (req, res) => {
  try {
    // 1. 获取基础持仓数据
    const [holdings] = await db.query(`
      SELECT 
        s.ticker_symbol,
        s.company_name,
        s.exchange,
        s.sector,
        h.holding_shares AS quantity,
        h.total_cost / h.holding_shares AS avg_cost
      FROM user_stock_holding h
      JOIN stock_info s ON h.ticker_symbol = s.ticker_symbol
      WHERE h.user_id = ?
    `, [req.user.id]);

    // 2. 批量获取实时市场数据
    const symbols = holdings.map(h => h.ticker_symbol);
    const marketData = await Promise.all(
      symbols.map(symbol => getMarketData(symbol).catch(e => null))
    );

    // 3. 组合数据
    const portfolio = holdings.map((holding, index) => {
      const data = marketData[index];
      return {
        symbol: holding.ticker_symbol,
        name: holding.company_name,
        exchange: holding.exchange,
        sector: holding.sector,
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
    res.status(500).json({
      success: false,
      message: 'Failed to load portfolio',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

// 买入股票（实时价格）
exports.addItem = async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    // 0. 验证股票是否存在
    const [[stock]] = await db.query(
      `SELECT ticker_symbol FROM stock_info WHERE ticker_symbol = ?`, 
      [symbol]
    );
    if (!stock) throw new Error('Invalid stock symbol');

    // 1. 获取实时价格
    const { price } = await getMarketData(symbol);
    const totalCost = price * quantity;

    // 2. 检查现金余额（关键新增步骤）
    const [[user]] = await db.query(
      `SELECT cash_balance FROM user_info WHERE user_id = ?`,
      [req.user.id]
    );
    
    if (user.cash_balance < totalCost) {
      throw new Error(`Insufficient funds. Needed: $${totalCost.toFixed(2)}, Available: $${user.cash_balance.toFixed(2)}`);
    }

    // 3. 执行交易（原有逻辑）
    await db.beginTransaction();
    // ...后续数据库操作不变...
    
  } catch (err) {
    await db.rollback();
    res.status(400).json({ 
      success: false,
      message: err.message.includes('Insufficient') ? 
               err.message : 
               `Trade failed: ${err.message}`
    });
  }
};

// 卖出股票（带增强检查）
exports.sellItem = async (req, res) => {
  const { symbol, quantity } = req.body;

  // 验证参数
  if (!symbol || !quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request: symbol and positive quantity required'
    });
  }

  try {
    // ===== 检查阶段（事务外部） =====
    // 1. 验证股票是否存在
    const [[stock]] = await db.query(
      `SELECT ticker_symbol FROM stock_info WHERE ticker_symbol = ?`,
      [symbol]
    );
    if (!stock) throw new Error(`Stock ${symbol} not found`);

    // 2. 检查持仓情况（带详细错误信息）
    const [[holding]] = await db.query(
      `SELECT 
         holding_shares, 
         total_cost,
         (SELECT COUNT(*) FROM stock_info WHERE ticker_symbol = ?) AS stock_exists
       FROM user_stock_holding 
       WHERE user_id = ? AND ticker_symbol = ?`,
      [symbol, req.user.id, symbol]
    );

    if (!holding) {
      throw new Error(`You don't hold any shares of ${symbol}`);
    }
    if (holding.holding_shares < quantity) {
      throw new Error(
        `Insufficient shares. ` +
        `Requested: ${quantity}, ` +
        `Held: ${holding.holding_shares}`
      );
    }

    // 3. 获取实时市场数据
    const { price } = await getMarketData(symbol);
    if (!price || price <= 0) {
      throw new Error('Invalid market price');
    }

    // ===== 执行阶段（事务内部） =====
    await db.beginTransaction();

    try {
      // 4. 计算精确收益（考虑浮点数精度）
      const avgCost = holding.total_cost / holding.holding_shares;
      const costBasis = parseFloat((avgCost * quantity).toFixed(2));
      const saleValue = parseFloat((price * quantity).toFixed(2));
      const realizedGain = parseFloat((saleValue - costBasis).toFixed(2));

      // 5. 记录交易
      await db.query(
        `INSERT INTO stock_transaction_logs (
          user_id, 
          ticker_symbol, 
          transaction_type, 
          price, 
          number_of_shares,
          realized_gain
        ) VALUES (?, ?, 'SELL', ?, ?, ?)`,
        [req.user.id, symbol, price, quantity, realizedGain]
      );

      // 6. 更新持仓
      await db.query(
        `UPDATE user_stock_holding
         SET 
           holding_shares = ROUND(holding_shares - ?, 4),
           total_cost = ROUND(total_cost - ?, 2)
         WHERE user_id = ? AND ticker_symbol = ?`,
        [quantity, costBasis, req.user.id, symbol]
      );

      // 7. 清理零持仓
      await db.query(
        `DELETE FROM user_stock_holding 
         WHERE user_id = ? AND ticker_symbol = ? AND holding_shares <= 0`,
        [req.user.id, symbol]
      );

      // 8. 更新现金（原子操作）
      await db.query(
        `UPDATE user_info 
         SET cash_balance = ROUND(cash_balance + ?, 2)
         WHERE user_id = ?`,
        [saleValue, req.user.id]
      );

      await db.commit();

      // 返回完整交易详情
      res.json({
        success: true,
        symbol,
        executedPrice: price,
        quantity,
        costBasis,
        proceeds: saleValue,
        realizedGain,
        remainingCash: await getCurrentCashBalance(req.user.id) // 辅助函数
      });

    } catch (txError) {
      await db.rollback();
      throw txError; // 重新抛出给外部catch处理
    }

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      details: {
        symbol,
        attemptedQuantity: quantity,
        ...(err.message.includes('Insufficient') && {
          heldQuantity: holding?.holding_shares || 0
        }
      },
      timestamp: new Date().toISOString()
    });
  }
};

// 新增方法：获取组合详情（包含个股详细收益和整体数据）
exports.getPortfolioDetails = async (req, res) => {
  try {
    // 1. 获取基础持仓数据
    const [holdings] = await db.query(`
      SELECT 
        s.ticker_symbol,
        s.company_name,
        h.holding_shares AS quantity,
        h.total_cost,
        h.total_profit AS realized_profit
      FROM user_stock_holding h
      JOIN stock_info s ON h.ticker_symbol = s.ticker_symbol
      WHERE h.user_id = ?
    `, [req.user.id]);

    // 2. 批量获取实时和历史数据
    const symbols = holdings.map(h => h.ticker_symbol);
    const [marketData, yesterdayData] = await Promise.all([
      // 实时市场数据
      Promise.all(symbols.map(symbol => 
        getMarketData(symbol).catch(() => null)
      ),
      // 昨日收盘数据（需要stock_hist表支持）
      db.query(`
        SELECT 
          s.ticker_symbol,
          sh.close_price AS yesterday_close
        FROM stock_hist sh
        JOIN stock_info s ON sh.stock_id = s.stock_id
        WHERE sh.price_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          AND s.ticker_symbol IN (?)
      `, [symbols])
    ]);

    // 3. 计算个股详细指标
    const stockDetails = holdings.map((holding, index) => {
      const currentData = marketData[index];
      const yesterdayClose = yesterdayData.find(
        y => y.ticker_symbol === holding.ticker_symbol
      )?.yesterday_close || holding.avg_cost; // 降级处理

      // 关键计算
      const marketValue = currentData?.price * holding.quantity || 0;
      const costBasis = holding.total_cost;
      const unrealizedProfit = marketValue - costBasis;
      const yesterdayValue = yesterdayClose * holding.quantity;
      const dailyProfit = marketValue - yesterdayValue;
      const totalReturnPercent = (unrealizedProfit + holding.realized_profit) / costBasis * 100;

      return {
        symbol: holding.ticker_symbol,
        name: holding.company_name,
        holdingAmount: marketValue,           // 持有金额
        dailyProfit,                         // 昨日收益
        totalProfit: unrealizedProfit + holding.realized_profit, // 持有收益
        totalReturnPercent,                  // 持有收益率
        breakdown: {
          realized: holding.realized_profit,
          unrealized: unrealizedProfit,
          costBasis
        }
      };
    });

    // 4. 计算整体组合指标
    const portfolioSummary = stockDetails.reduce((acc, curr) => ({
      totalHoldingAmount: acc.totalHoldingAmount + curr.holdingAmount,
      totalDailyProfit: acc.totalDailyProfit + curr.dailyProfit,
      totalProfit: acc.totalProfit + curr.totalProfit,
      totalCostBasis: acc.totalCostBasis + curr.breakdown.costBasis
    }), {
      totalHoldingAmount: 0,
      totalDailyProfit: 0,
      totalProfit: 0,
      totalCostBasis: 0
    });

    // 添加整体收益率
    portfolioSummary.totalReturnPercent = 
      portfolioSummary.totalProfit / portfolioSummary.totalCostBasis * 100;

    res.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      portfolioSummary, // 整体数据
      stockDetails     // 个股详细数据
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to load portfolio details',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

// 辅助函数：获取当前现金余额
async function getCurrentCashBalance(userId) {
  const [[user]] = await db.query(
    `SELECT cash_balance FROM user_info WHERE user_id = ?`,
    [userId]
  );
  return user?.cash_balance || 0;
}