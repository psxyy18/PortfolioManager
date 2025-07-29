const pool = require('../db');

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