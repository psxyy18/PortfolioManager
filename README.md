# Portfolio Manager

A full-stack web application for managing a financial portfolio, including stocks, funds, and cash. The project features a RESTful backend (Node.js/Express + MySQL) and a modern, responsive frontend (HTML/CSS/JS, no build tools required).

---

## Features

- **Browse Portfolio:** View your cash, stock, and fund holdings.
- **Performance Chart:** Visualize your portfolio value over time.
- **Buy Stocks:** Add stocks to your portfolio.
- **Market Dashboard:** View major indices and top companies by market cap, filterable by industry.
- **Live Data:** Real-time stock data via Yahoo Finance API.

---

## Project Structure

```
RE/
├── backend/                  # Express API server
│   ├── app.js
│   ├── db.js
│   ├── controllers/
│   ├── routes/
│   └── ...
├── frontend/
│   └── portfolio-frontend/
│       ├── index.html        # Portfolio page
│       ├── stock.html        # Market dashboard
│       ├── stock.js          # Dashboard JS logic
│       └── tab2.js           # (or stock.js) Dashboard JS logic
└── README.md
```

---

## Backend Setup (Express + MySQL)

### 1. **Install dependencies**
```sh
cd backend
npm install
```

### 2. **Configure MySQL**
- Create a MySQL database using the provided schema (see below or in your project).
- Set up your `.env` file in `backend/`:
  ```
  DB_HOST=localhost
  DB_USER=your_mysql_user
  DB_PASS=your_mysql_password
  DB_NAME=financial_db
  PORT=3001
  ```

### 3. **Run the backend server**
```sh
node app.js
```

---

## Frontend Setup (HTML/JS)

No build tools required! Just open the HTML files in your browser.

- **Portfolio:** `frontend/portfolio-frontend/index.html`
- **Market Dashboard:** `frontend/portfolio-frontend/stock.html`

> **Note:** The backend must be running at `http://localhost:3001` for the frontend to work.

---

## API Endpoints

### **Portfolio Endpoints**
- `GET    /api/portfolio` — Get current portfolio (cash, stocks, funds)
- `GET    /api/portfolio/performance` — Get historical portfolio value
- `POST   /api/portfolio/stock` — Buy stock (body: `{ ticker_symbol, price, number_of_shares }`)
- `POST   /api/portfolio/stock/sell` — Sell stock (body: `{ ticker_symbol, price, number_of_shares }`)
- `DELETE /api/portfolio/stock/:ticker` — Remove stock holding
- `POST   /api/portfolio/cash/deposit` — Deposit cash (body: `{ amount }`)
- `POST   /api/portfolio/cash/withdraw` — Withdraw cash (body: `{ amount }`)

### **Stock Endpoints**
- `GET /api/stock/:ticker/current` — Get current quote for a stock
- `GET /api/stock/:ticker/history?period1=YYYY-MM-DD&period2=YYYY-MM-DD` — Get historical data
- `GET /api/stock/top-stocks?industry=Technology&n=10` — Top N stocks by market cap (optionally filtered by industry/sector)

---

## Database Schema

See the schema in the project root or in the original project description. Includes tables for users, stocks, funds, transactions, and triggers for automatic holding updates.

---

## Example Usage

- **Portfolio Page:**
  - View your cash, stocks, and funds
  - Buy stocks using the form
  - See a chart of your portfolio value
- **Market Dashboard:**
  - View live index data (S&P 500, Nasdaq, etc.)
  - See top companies by market cap, filter by industry

---

## Developer Notes

- **Backend:** Node.js, Express, MySQL, yahoo-finance2
- **Frontend:** HTML, CSS, JS, Chart.js, Axios (via CDN)
- **No build tools required for frontend**
- **CORS:** Backend uses CORS for local development
- **Testing:** Backend includes Jest/Supertest tests (see `backend/__tests__`)

---

## Credits

- [Chart.js](https://www.chartjs.org/)
- [Yahoo Finance API (yahoo-finance2)](https://github.com/gadicc/node-yahoo-finance2)
- [Axios](https://axios-http.com/)

---

## License

MIT 