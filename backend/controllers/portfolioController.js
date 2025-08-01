const pool = require('../db');
const yahooFinance = require('yahoo-finance2').default;

exports.getPortfolio = async (req, res) => {
  // For this app, assume single user with user_id = 1
  const userId = 1;
  try {
    // Get cash balance
    const [userRows] = await pool.query(
      'SELECT cash_balance FROM user_info WHERE user_id = ?',
      [userId]
    );
    const cash = userRows.length > 0 ? userRows[0].cash_balance : 0;

    // Get stock holdings with info
    const [stockRows] = await pool.query(
      `SELECT ush.ticker_symbol, si.company_name, si.short_name, si.exchange, ush.holding_shares, ush.total_cost, ush.total_profit
       FROM user_stock_holding ush
       JOIN stock_info si ON ush.ticker_symbol = si.ticker_symbol
       WHERE ush.user_id = ? AND ush.holding_shares > 0`,
      [userId]
    );

    // Get fund holdings with info
    const [fundRows] = await pool.query(
      `SELECT ufh.fund_symbol, fi.fund_name, ufh.holding_fund, ufh.total_cost, ufh.total_profit
       FROM user_fund_holding ufh
       JOIN fund_info fi ON ufh.fund_symbol = fi.fund_symbol
       WHERE ufh.user_id = ? AND ufh.holding_fund > 0`,
      [userId]
    );

    res.json({
      cash,
      stocks: stockRows,
      funds: fundRows
    });
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

exports.getPerformance = async (req, res) => {
  const userId = 1;
  try {
    // Get cash balance (assume constant for now)
    const [userRows] = await pool.query(
      'SELECT cash_balance FROM user_info WHERE user_id = ?',
      [userId]
    );
    const cash = userRows.length > 0 ? userRows[0].cash_balance : 0;

    // Get stock holdings (ticker, shares)
    const [stockHoldings] = await pool.query(
      'SELECT ticker_symbol, holding_shares FROM user_stock_holding WHERE user_id = ? AND holding_shares > 0',
      [userId]
    );

    // Get fund holdings (symbol, units)
    const [fundHoldings] = await pool.query(
      'SELECT fund_symbol, holding_fund FROM user_fund_holding WHERE user_id = ? AND holding_fund > 0',
      [userId]
    );

    // Get last 30 days
    const [dateRows] = await pool.query(
      `SELECT DISTINCT price_date FROM stock_hist ORDER BY price_date DESC LIMIT 30`
    );
    const dates = dateRows.map(r => r.price_date).sort(); // ascending

    // For each date, calculate total value
    const performance = [];
    for (const date of dates) {
      let total = Number(cash);
      // Stocks: sum shares * close_price
      for (const stock of stockHoldings) {
        const [histRows] = await pool.query(
          'SELECT close_price FROM stock_hist WHERE ticker_symbol = ? AND price_date = ?',
          [stock.ticker_symbol, date]
        );
        if (histRows.length > 0) {
          total += Number(stock.holding_shares) * Number(histRows[0].close_price);
        }
      }
      // Funds: (skip price for now, as fund price table is not in schema)
      // If you add fund price history, you can sum here as well
      performance.push({ date, total_value: total });
    }
    res.json(performance);
  } catch (err) {
    console.error('Error fetching performance:', err);
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
};

exports.addStock = async (req, res) => {
  // Buy stock: expects { ticker_symbol, price, number_of_shares }
  const userId = 1;
  const { ticker_symbol, price, number_of_shares } = req.body;
  if (!ticker_symbol || !price || !number_of_shares) {
    return res.status(400).json({ error: 'ticker_symbol, price, and number_of_shares are required' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Check cash balance
    const [userRows] = await connection.query(
      'SELECT cash_balance FROM user_info WHERE user_id = ?',
      [userId]
    );
    const cash = userRows.length > 0 ? Number(userRows[0].cash_balance) : 0;
    const totalCost = Number(price) * Number(number_of_shares);
    if (cash < totalCost) {
      await connection.rollback();
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    // Insert into stock_transaction_logs (triggers update holding)
    await connection.query(
      `INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
       VALUES (?, ?, 'BUY', ?, ?)`,
      [userId, ticker_symbol, price, number_of_shares]
    );
    // Deduct cash
    await connection.query(
      `UPDATE user_info SET cash_balance = cash_balance - ? WHERE user_id = ?`,
      [totalCost, userId]
    );
    await connection.commit();
    res.json({ message: 'Stock purchased successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error buying stock:', err);
    res.status(500).json({ error: 'Failed to buy stock' });
  } finally {
    connection.release();
  }
};

exports.deleteStock = async (req, res) => {
  // Remove stock holding (set holding_shares to 0)
  const userId = 1;
  const { ticker } = req.params;
  if (!ticker) return res.status(400).json({ error: 'ticker is required' });
  try {
    await pool.query(
      `UPDATE user_stock_holding SET holding_shares = 0 WHERE user_id = ? AND ticker_symbol = ?`,
      [userId, ticker]
    );
    res.json({ message: 'Stock holding deleted' });
  } catch (err) {
    console.error('Error deleting stock holding:', err);
    res.status(500).json({ error: 'Failed to delete stock holding' });
  }
};

exports.sellStock = async (req, res) => {
  // Sell stock: expects { ticker_symbol, price, number_of_shares }
  const userId = 1;
  const { ticker_symbol, price, number_of_shares } = req.body;
  if (!ticker_symbol || !price || !number_of_shares) {
    return res.status(400).json({ error: 'ticker_symbol, price, and number_of_shares are required' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Check holding shares
    const [holdingRows] = await connection.query(
      'SELECT holding_shares FROM user_stock_holding WHERE user_id = ? AND ticker_symbol = ?',
      [userId, ticker_symbol]
    );
    const holding = holdingRows.length > 0 ? Number(holdingRows[0].holding_shares) : 0;
    if (holding < Number(number_of_shares)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Insufficient shares' });
    }
    // Insert into stock_transaction_logs (triggers update holding)
    await connection.query(
      `INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
       VALUES (?, ?, 'SELL', ?, ?)`,
      [userId, ticker_symbol, price, number_of_shares]
    );
    // Add cash
    await connection.query(
      `UPDATE user_info SET cash_balance = cash_balance + ? WHERE user_id = ?`,
      [Number(price) * Number(number_of_shares), userId]
    );
    await connection.commit();
    res.json({ message: 'Stock sold successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error selling stock:', err);
    res.status(500).json({ error: 'Failed to sell stock' });
  } finally {
    connection.release();
  }
};

exports.depositCash = async (req, res) => {
  // Deposit cash: expects { amount }
  const userId = 1;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'amount must be positive' });
  }
  try {
    await pool.query(
      `UPDATE user_info SET cash_balance = cash_balance + ? WHERE user_id = ?`,
      [amount, userId]
    );
    res.json({ message: 'Cash deposited' });
  } catch (err) {
    console.error('Error depositing cash:', err);
    res.status(500).json({ error: 'Failed to deposit cash' });
  }
};

exports.withdrawCash = async (req, res) => {
  // Withdraw cash: expects { amount }
  const userId = 1;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'amount must be positive' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Check balance
    const [rows] = await connection.query(
      `SELECT cash_balance FROM user_info WHERE user_id = ?`,
      [userId]
    );
    if (rows.length === 0 || rows[0].cash_balance < amount) {
      await connection.rollback();
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    await connection.query(
      `UPDATE user_info SET cash_balance = cash_balance - ? WHERE user_id = ?`,
      [amount, userId]
    );
    await connection.commit();
    res.json({ message: 'Cash withdrawn' });
  } catch (err) {
    await connection.rollback();
    console.error('Error withdrawing cash:', err);
    res.status(500).json({ error: 'Failed to withdraw cash' });
  } finally {
    connection.release();
  }
};

exports.getGainLoss = async (req, res) => {
  const userId = 1;
  try {
    // Get all stock holdings
    const [stockHoldings] = await pool.query(
      `SELECT ush.ticker_symbol, si.company_name, si.short_name, si.exchange, 
              ush.holding_shares, ush.total_cost, ush.total_profit
       FROM user_stock_holding ush
       JOIN stock_info si ON ush.ticker_symbol = si.ticker_symbol
       WHERE ush.user_id = ? AND ush.holding_shares > 0`,
      [userId]
    );

    // Get all fund holdings
    const [fundHoldings] = await pool.query(
      `SELECT ufh.fund_symbol, fi.fund_name, fi.fund_name as short_name, 'Fund' as exchange,
              ufh.holding_fund as holding_shares, ufh.total_cost, ufh.total_profit
       FROM user_fund_holding ufh
       JOIN fund_info fi ON ufh.fund_symbol = fi.fund_symbol
       WHERE ufh.user_id = ? AND ufh.holding_fund > 0`,
      [userId]
    );

    // Combine stocks and funds for processing
    const allHoldings = [
      ...stockHoldings.map(h => ({ ...h, type: 'stock' })),
      ...fundHoldings.map(h => ({ ...h, type: 'fund' }))
    ];

    // Get current prices from Yahoo Finance for all holdings, with fallback to stock_hist
    const holdingsWithPrices = await Promise.all(
      allHoldings.map(async (holding) => {
        try {
          // Try Yahoo Finance first
          const quote = await yahooFinance.quote(holding.ticker_symbol);
          const currentPrice = quote.regularMarketPrice;
          const currentValue = Number(holding.holding_shares) * currentPrice;
          const totalGainLoss = currentValue - Number(holding.total_cost);
          const gainLossPercentage = Number(holding.total_cost) > 0 
            ? (totalGainLoss / Number(holding.total_cost)) * 100 
            : 0;

          return {
            ticker_symbol: holding.ticker_symbol,
            company_name: holding.company_name,
            short_name: holding.short_name,
            exchange: holding.exchange,
            holding_shares: Number(holding.holding_shares),
            total_cost: Number(holding.total_cost),
            current_price: currentPrice,
            current_value: currentValue,
            total_gain_loss: totalGainLoss,
            gain_loss_percentage: gainLossPercentage,
            previous_profit: Number(holding.total_profit),
            price_source: 'yahoo_finance',
            type: holding.type
          };
        } catch (yahooError) {
          console.error(`Yahoo Finance failed for ${holding.ticker_symbol}, trying stock_hist:`, yahooError.message);
          
          try {
            // Fallback to stock_hist table - get the most recent price
            const [histRows] = await pool.query(
              `SELECT close_price FROM stock_hist 
               WHERE ticker_symbol = ? 
               ORDER BY price_date DESC 
               LIMIT 1`,
              [holding.ticker_symbol]
            );
            
            if (histRows.length > 0) {
              const currentPrice = Number(histRows[0].close_price);
              const currentValue = Number(holding.holding_shares) * currentPrice;
              const totalGainLoss = currentValue - Number(holding.total_cost);
              const gainLossPercentage = Number(holding.total_cost) > 0 
                ? (totalGainLoss / Number(holding.total_cost)) * 100 
                : 0;

              return {
                ticker_symbol: holding.ticker_symbol,
                company_name: holding.company_name,
                short_name: holding.short_name,
                exchange: holding.exchange,
                holding_shares: Number(holding.holding_shares),
                total_cost: Number(holding.total_cost),
                current_price: currentPrice,
                current_value: currentValue,
                total_gain_loss: totalGainLoss,
                gain_loss_percentage: gainLossPercentage,
                previous_profit: Number(holding.total_profit),
                price_source: 'stock_hist',
                type: holding.type
              };
            } else {
              // No historical data available
              return {
                ticker_symbol: holding.ticker_symbol,
                company_name: holding.company_name,
                short_name: holding.short_name,
                exchange: holding.exchange,
                holding_shares: Number(holding.holding_shares),
                total_cost: Number(holding.total_cost),
                current_price: null,
                current_value: null,
                total_gain_loss: null,
                gain_loss_percentage: null,
                previous_profit: Number(holding.total_profit),
                error: 'No price data available',
                type: holding.type
              };
            }
          } catch (histError) {
            console.error(`Error fetching from stock_hist for ${holding.ticker_symbol}:`, histError.message);
            return {
              ticker_symbol: holding.ticker_symbol,
              company_name: holding.company_name,
              short_name: holding.short_name,
              exchange: holding.exchange,
              holding_shares: Number(holding.holding_shares),
              total_cost: Number(holding.total_cost),
              current_price: null,
              current_value: null,
              total_gain_loss: null,
              gain_loss_percentage: null,
              previous_profit: Number(holding.total_profit),
              error: 'Failed to fetch price from both Yahoo Finance and stock_hist',
              type: holding.type
            };
          }
        }
      })
    );

    // Calculate portfolio summary
    const validHoldings = holdingsWithPrices.filter(h => h.current_price !== null);
    const totalCurrentValue = validHoldings.reduce((sum, h) => sum + Number(h.current_value), 0);
    const totalCost = validHoldings.reduce((sum, h) => sum + Number(h.total_cost), 0);
    const totalGainLoss = validHoldings.reduce((sum, h) => sum + Number(h.total_gain_loss), 0);
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    // Calculate Holding Gain = total_gain_loss + sum(all holdings' profit)
    const totalPreviousProfit = validHoldings.reduce((sum, h) => sum + Number(h.previous_profit), 0);
    const holdingGain = totalGainLoss + totalPreviousProfit;
    const holdingGainPercentage = totalCost > 0 ? (holdingGain / totalCost) * 100 : 0;

    // Count price sources
    const yahooCount = validHoldings.filter(h => h.price_source === 'yahoo_finance').length;
    const histCount = validHoldings.filter(h => h.price_source === 'stock_hist').length;

    // Calculate 30-day historical performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    // Get historical data for each holding
    const historicalData = [];
    let previousDayData = null; // Store previous day's data for fallback
    
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - (29 - i));
      const dateStr = currentDate.toISOString().split('T')[0];
      
      let dailyTotalValue = 0;
      let dailyTotalCost = 0;
      let dailyTotalGainLoss = 0;
      let dailyTotalPreviousProfit = 0;
      let validHoldingsCount = 0;
      let hasDataForThisDay = false;

      // Calculate portfolio value for this date
      for (const holding of validHoldings) {
        try {
          // Get historical price for this date
          const [histRows] = await pool.query(
            `SELECT close_price FROM stock_hist 
             WHERE ticker_symbol = ? AND price_date = ?
             ORDER BY price_date DESC 
             LIMIT 1`,
            [holding.ticker_symbol, dateStr]
          );
          
          if (histRows.length > 0) {
            const historicalPrice = Number(histRows[0].close_price);
            const historicalValue = Number(holding.holding_shares) * historicalPrice;
            const historicalGainLoss = historicalValue - Number(holding.total_cost);
            
            dailyTotalValue += historicalValue;
            dailyTotalCost += Number(holding.total_cost);
            dailyTotalGainLoss += historicalGainLoss;
            dailyTotalPreviousProfit += Number(holding.previous_profit);
            validHoldingsCount++;
            hasDataForThisDay = true;
          }
        } catch (error) {
          console.error(`Error fetching historical data for ${holding.ticker_symbol} on ${dateStr}:`, error);
        }
      }

      // If no data for this day, use previous day's data
      if (!hasDataForThisDay && previousDayData) {
        dailyTotalValue = previousDayData.total_value;
        dailyTotalCost = previousDayData.total_cost;
        dailyTotalGainLoss = previousDayData.total_gain_loss;
        dailyTotalPreviousProfit = previousDayData.total_previous_profit;
        validHoldingsCount = previousDayData.valid_holdings;
        console.log(`Using previous day's data for ${dateStr} due to no data available`);
      }

      // Add cash balance to total value
      const [userRows] = await pool.query(
        'SELECT cash_balance FROM user_info WHERE user_id = ?',
        [userId]
      );
      const cashBalance = userRows.length > 0 ? Number(userRows[0].cash_balance) : 0;
      dailyTotalValue += cashBalance;

      // Calculate daily holding gain = total_gain_loss + sum(all holdings' profit)
      const dailyHoldingGain = dailyTotalGainLoss + dailyTotalPreviousProfit;

      const currentDayData = {
        date: dateStr,
        total_value: dailyTotalValue,
        total_cost: dailyTotalCost,
        total_gain_loss: dailyTotalGainLoss,
        total_gain_loss_percentage: dailyTotalCost > 0 ? (dailyTotalGainLoss / dailyTotalCost) * 100 : 0,
        holding_gain: dailyHoldingGain,
        holding_gain_percentage: dailyTotalCost > 0 ? (dailyHoldingGain / dailyTotalCost) * 100 : 0,
        total_previous_profit: dailyTotalPreviousProfit,
        cash_balance: cashBalance,
        valid_holdings: validHoldingsCount
      };

      historicalData.push(currentDayData);
      
      // Store this day's data for next iteration (fallback for tomorrow)
      if (hasDataForThisDay) {
        previousDayData = currentDayData;
      }
    }

    res.json({
      holdings: holdingsWithPrices,
      summary: {
        total_current_value: totalCurrentValue,
        total_cost: totalCost,
        total_gain_loss: totalGainLoss,
        total_gain_loss_percentage: totalGainLossPercentage,
        holding_gain: holdingGain,
        holding_gain_percentage: holdingGainPercentage,
        total_previous_profit: totalPreviousProfit,
        holdings_count: validHoldings.length,
        failed_fetches: holdingsWithPrices.length - validHoldings.length,
        yahoo_finance_prices: yahooCount,
        stock_hist_prices: histCount
      },
      historical_performance: historicalData
    });
  } catch (err) {
    console.error('Error calculating gain/loss:', err);
    res.status(500).json({ error: 'Failed to calculate gain/loss' });
  }
}; 

exports.getTransactionLogs = async (req, res) => {
  const userId = 1; // Default user ID
  try {
    // Get stock transaction logs with company information
    const [transactionLogs] = await pool.query(
      `SELECT 
        stl.transaction_id,
        stl.ticker_symbol,
        si.company_name,
        si.short_name,
        stl.transaction_type,
        stl.price,
        stl.number_of_shares,
        stl.transaction_time,
        (stl.price * stl.number_of_shares) as total_value
       FROM stock_transaction_logs stl
       JOIN stock_info si ON stl.ticker_symbol = si.ticker_symbol
       WHERE stl.user_id = ?
       ORDER BY stl.transaction_time DESC
       LIMIT 100`,
      [userId]
    );

    // Calculate summary statistics
    const buyTransactions = transactionLogs.filter(t => t.transaction_type === 'BUY');
    const sellTransactions = transactionLogs.filter(t => t.transaction_type === 'SELL');
    
    const totalBuyValue = buyTransactions.reduce((sum, t) => sum + Number(t.total_value), 0);
    const totalSellValue = sellTransactions.reduce((sum, t) => sum + Number(t.total_value), 0);
    const totalBuyShares = buyTransactions.reduce((sum, t) => sum + Number(t.number_of_shares), 0);
    const totalSellShares = sellTransactions.reduce((sum, t) => sum + Number(t.number_of_shares), 0);

    res.json({
      transactions: transactionLogs.map(t => ({
        transaction_id: t.transaction_id,
        ticker_symbol: t.ticker_symbol,
        company_name: t.company_name,
        short_name: t.short_name,
        transaction_type: t.transaction_type,
        price: Number(t.price),
        number_of_shares: Number(t.number_of_shares),
        total_value: Number(t.total_value),
        transaction_time: t.transaction_time
      })),
      summary: {
        total_transactions: transactionLogs.length,
        buy_transactions: buyTransactions.length,
        sell_transactions: sellTransactions.length,
        total_buy_value: totalBuyValue,
        total_sell_value: totalSellValue,
        total_buy_shares: totalBuyShares,
        total_sell_shares: totalSellShares,
        net_value: totalSellValue - totalBuyValue
      }
    });
  } catch (err) {
    console.error('Error fetching transaction logs:', err);
    res.status(500).json({ error: 'Failed to fetch transaction logs' });
  }
}; 