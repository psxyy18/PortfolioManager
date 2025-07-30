// get_data.js
import yahooFinance from 'yahoo-finance2';
import mysql from 'mysql2/promise';

// 连接 MySQL
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'bryant24',
  database: 'financial_db'
});

async function fetchAndStoreHistorical(symbol) {
  try {
    console.log(`Fetching data for ${symbol}...`);
    const result = await yahooFinance.chart(symbol, {
      period1: '2024-07-01',
      period2: '2025-07-28',
      interval: '1d'
    });

    // 插入数据库
    for (const item of result.quotes) {
      await connection.execute(
        `INSERT INTO stock_hist 
         (ticker_symbol, price_date, open_price, close_price, high_price, low_price, volume)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           open_price = VALUES(open_price),
           close_price = VALUES(close_price),
           high_price = VALUES(high_price),
           low_price = VALUES(low_price),
           volume = VALUES(volume)`,
        [
          symbol,
          item.date.toISOString().slice(0, 10),
          item.open,
          item.close,
          item.high,
          item.low,
          item.volume
        ]
      );
    }
    console.log(`Done: ${symbol}`);
  } catch (err) {
    // Yahoo API 失败，回退到数据库
    console.error(`Error with ${symbol}: ${err}`);
    console.log(`Using local stock_hist data instead for ${symbol}`);
    const [rows] = await connection.execute(
      `SELECT * FROM stock_hist WHERE ticker_symbol = ? ORDER BY price_date DESC LIMIT 5`,
      [symbol]
    );
    console.log(rows);
  }
}

async function runBatch() {
  const symbols = ['AAPL', 'GOOGL', 'AMZN'];
  for (const symbol of symbols) {
    await fetchAndStoreHistorical(symbol);
  }
  await connection.end();
  console.log('All done!');
}

runBatch();
