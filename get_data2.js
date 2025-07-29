import yahooFinance from 'yahoo-finance2';
import mysql from 'mysql2/promise';

// Step 1: Connect to MySQL
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'bryant24',
  database: 'financial_db',
});

async function fetchAndStoreHistorical(symbol) {
  try {
    const options = {
      period1: '2025-07-01',
      period2: '2025-07-29',
      interval: '1d',
    };

    const result = await yahooFinance.chart(symbol, options);
    const meta = result.meta;

    await db.execute(
      `INSERT IGNORE INTO stock_info (ticker_symbol, company_name, short_name, exchange, industry, sector)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        meta.symbol || symbol,
        meta.longName || symbol,
        meta.fullExchangeName || null,
        meta.exchangeName || null,
        null,
        null,
      ]
    );

    for (const quote of result.quotes) {
      if (
        quote.open == null ||
        quote.close == null ||
        quote.high == null ||
        quote.low == null ||
        quote.volume == null ||
        !quote.date
      ) continue;

      await db.execute(
        `INSERT INTO stock_hist 
          (ticker_symbol, price_date, open_price, close_price, high_price, low_price, volume)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            open_price=VALUES(open_price),
            close_price=VALUES(close_price),
            high_price=VALUES(high_price),
            low_price=VALUES(low_price),
            volume=VALUES(volume)`,
        [
          meta.symbol || symbol,
          quote.date,
          quote.open,
          quote.close,
          quote.high,
          quote.low,
          quote.volume || 0,
        ]
      );
    }

    console.log(`Done: ${symbol}`);
  } catch (err) {
    console.error(`Error with ${symbol}:`, err);
  }
}

// run the batch process
async function runBatch() {
  const symbols = ['AAPL', 'GOOGL', 'AMZN'];

  try {
    for (const symbol of symbols) {
      await fetchAndStoreHistorical(symbol);
    }
  } finally {
    await db.end();
    console.log('All done!');
  }
}

runBatch();
