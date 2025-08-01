import yahooFinance from 'yahoo-finance2';
import mysql from 'mysql2/promise';

// Step 1: Connect to MySQL
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '001201kattyA',
  database: 'financial_db',
});

async function fetchAndStoreFundHistory(symbol) {
  try {
    const options = { period1: '2025-07-01', interval: '1d' };

    const result = await yahooFinance.historical(symbol, options);

    for (const row of result) {
      const { date, open, high, low, close, volume } = row;

      if (
        open == null ||
        close == null ||
        high == null ||
        low == null ||
        volume == null ||
        !date
      ) continue;

      await db.execute(
        `INSERT IGNORE INTO fund_hist 
          (fund_symbol, price_date, open_price, close_price, high_price, low_price, volume)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            open_price=VALUES(open_price),
            close_price=VALUES(close_price),
            high_price=VALUES(high_price),
            low_price=VALUES(low_price),
            volume=VALUES(volume)`,
        [
          symbol,
          new Date(date),
          open,
          close,
          high,
          low,
          volume || 0,
        ]
      );
    }

    console.log(`Done: ${symbol}`);
  } catch (err) {
    console.error(`Error with ${symbol}:`, err);
  }
}

// Step 2: Run a batch of funds
async function runBatch() {
  const symbols = [
    'ESMSX', 'AIDZX', 'EPLKX', 'MXCJX', 'OTTRX',
    'FCFCX', 'SPMCX', 'RSSCX', 'BCITX', 'IBNCX',
    'IPNIX', 'GEGTX', 'JDBRX', 'ACLKX', 'DWATX',
    'NBRAX', 'CHMCX', 'RBMTX', 'PKTWX', 'GSORX'
  ];

  try {
    for (const symbol of symbols) {
      await fetchAndStoreFundHistory(symbol);
    }
  } finally {
    await db.end();
    console.log('All done!');
  }
}

runBatch();
