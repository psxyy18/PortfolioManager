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