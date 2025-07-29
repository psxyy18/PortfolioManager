import express from 'express';
import { pool } from '../db.js';
import yahooFinance from 'yahoo-finance2';

async function getTopNTickersByIndustry(industry, n) {
    const topN = parseInt(n, 10); // Ensure it's a number

    if (industry === 'All') {
        const query = `
            SELECT ticker_symbol
            FROM stock_info
            ORDER BY market_cap DESC
            LIMIT ${topN};
        `;

        const [rows] = await pool.query(query);
        return rows.map(row => row.ticker_symbol);
        
    }
    else {
        const query = `
            SELECT ticker_symbol
            FROM stock_info
            WHERE sector = ?
            ORDER BY market_cap DESC
            LIMIT ${topN};
        `;

        const [rows] = await pool.query(query, [industry, n]);
        return rows.map(row => row.ticker_symbol);
    }
}

const router = express.Router();

// Get top tickers based on a specific criteria
router.get('/', async (req, res) => {
    const { industry, n } = req.query;

    if (!industry || !n) {
        return res.status(400).json({ error: 'Missing industry or n parameter' });
    }

    try {
        const topTickers = await getTopNTickersByIndustry(industry, n);
        // console.log(`Top ${n} tickers in ${industry} industry:`, data);
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
});

export default router;