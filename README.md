
#### .env file
`
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=financial_db`

`
npm init -y
npm install express mysql2 dotenv
node server.js`

- /api/stocks : Get all stocks
- /api/stocks/quote : Get tickers data by symbol
- /api/stocks/top-tickers : Get top tickers based on a specific criteria
- /tab2 : Tab2