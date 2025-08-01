const yahooFinance = require('yahoo-finance2').default;
const pool = require('../db');

exports.getCurrentStockStatus = async (req, res) => {
  const { ticker } = req.params;
  if (!ticker) {
    return res.status(400).json({ error: 'ticker is required' });
  }
  try {
    const quote = await yahooFinance.quote(ticker);
    res.json(quote);
  } catch (err) {
    console.error(`Error fetching current price for ${ticker}:`, err);
    res.status(500).json({ error: 'Failed to fetch stock status' });
  }
};

exports.getStockHistory = async (req, res) => {
  const { ticker } = req.params;
  const { period1, period2 } = req.query; // Expecting YYYY-MM-DD
  if (!ticker) {
    return res.status(400).json({ error: 'ticker is required' });
  }
  if (!period1 || !period2) {
    return res.status(400).json({ error: 'period1 and period2 are required (YYYY-MM-DD)' });
  }
  try {
    const result = await yahooFinance.historical(ticker, {
      period1,
      period2,
      interval: '1d',
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching stock history:', err);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
};

exports.getStockHistoryFallback = async (req, res) => {
  const { ticker } = req.params;
  const { start_date, end_date } = req.query;
  
  if (!ticker) {
    return res.status(400).json({ error: 'ticker is required' });
  }
  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required (YYYY-MM-DD)' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT price_date as date, close_price as price 
       FROM stock_hist 
       WHERE ticker_symbol = ? 
       AND price_date BETWEEN ? AND ?
       ORDER BY price_date ASC`,
      [ticker, start_date, end_date]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No historical data found for this ticker' });
    }

    // Format the data to match Yahoo Finance format
    const formattedData = rows.map(row => ({
      date: row.date,
      close: row.price,
      price: row.price
    }));

    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching stock history from database:', err);
    res.status(500).json({ error: 'Failed to fetch stock history from database' });
  }
};

async function getTopNTickersByIndustry(industry, n) {
  const topN = parseInt(n, 10);
  if (industry === 'All') {
    const query = `
      SELECT ticker_symbol
      FROM stock_info
      ORDER BY market_cap DESC
      LIMIT ?;
    `;
    const [rows] = await pool.query(query, [topN]);
    return rows.map(row => row.ticker_symbol);
  } else {
    const query = `
      SELECT ticker_symbol
      FROM stock_info
      WHERE sector = ?
      ORDER BY market_cap DESC
      LIMIT ?;
    `;
    const [rows] = await pool.query(query, [industry, topN]);
    return rows.map(row => row.ticker_symbol);
  }
}

exports.getTopStocks = async (req, res) => {
  const { industry, n } = req.query;
  if (!industry || !n) {
    return res.status(400).json({ error: 'Missing industry or n parameter' });
  }
  try {
    const topTickers = await getTopNTickersByIndustry(industry, n);
    const results = await Promise.all(topTickers.map(t => yahooFinance.quote(t)));
    const formatted = results.map(q => ({
      symbol: q.symbol,
      name: q.shortName,
      marketCap: q.marketCap,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = exports; 