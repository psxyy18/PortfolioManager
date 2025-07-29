// Indexes Used in the Tab2 Page
const indices = [
  { name: "SSE Composite", ticker: "000001.SS" },
  { name: "S&P 500", ticker: "^GSPC" },
  { name: "Hang Seng Index", ticker: "^HSI" },
  { name: "Nasdaq Composite", ticker: "^IXIC" }
];

async function fetchQuote(ticker) {
  const res = await fetch(`/api/stocks/quote?ticker=${ticker}`);
  return await res.json();
}

function getChangeDisplay(change, percent) {
  const up = change >= 0;
  const arrow = up ? '📈' : '📉';
  const sign = up ? '+' : '−'; // proper minus
  return `${arrow} ${sign}$${Math.abs(change).toFixed(2)} (${sign}${Math.abs(percent).toFixed(2)}%)`;
}

async function loadIndices() {
  const container = document.getElementById("indices");
  for (const idx of indices) {
    const data = await fetchQuote(idx.ticker);
    const box = document.createElement("div");
    box.className = "index-box";
    box.innerHTML = `
      <h3>${idx.name}</h3>
      <p><strong>${data.regularMarketPrice}</strong></p>
      <p>${getChangeDisplay(data.regularMarketChange, data.regularMarketChangePercent)}</p>
    `;
    container.appendChild(box);
  }
}

async function loadTopTickers(industry, n = 10) {
  const res = await fetch(`/api/stocks/top-tickers?industry=${encodeURIComponent(industry)}&n=${n}`);
  const companies = await res.json();
  const tbody = document.getElementById("company-table");
  tbody.innerHTML = ''; // Clear existing rows

  companies.forEach(company => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${company.symbol}</td>
      <td>${company.name}</td>
      <td>${(company.marketCap / 1e12).toFixed(2)}</td>
      <td>${company.price.toFixed(2)}</td>
      <td>${getChangeDisplay(company.change, company.changePercent)}</td>
    `;
    tbody.appendChild(row);
  });
}

loadIndices();
loadTopTickers("All", 10);
