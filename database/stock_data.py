import yfinance as yf
import pandas as pd
import mysql.connector

# 获取股票数据
symbol = "AAPL"
ticker = yf.Ticker(symbol)

# 获取基本信息
info = ticker.info
company_data = {
    "symbol": symbol,
    "name": info.get("longName"),
    "sector": info.get("sector"),
    "industry": info.get("industry"),
    "exchange": info.get("exchange")
}

# 获取历史价格数据
history = ticker.history(period="1y")
history.reset_index(inplace=True)

# 连接数据库
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="bryant24",
    database="portfolio_manager"
)
cursor = conn.cursor()

# 插入公司信息
insert_company = """
    INSERT INTO companies (symbol, name, sector, industry, exchange)
    VALUES (%s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE name=VALUES(name)
"""
cursor.execute(insert_company, tuple(company_data.values()))

# 插入价格信息
insert_price = """
    INSERT INTO stock_prices (symbol, date, open, high, low, close, volume)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
"""

for _, row in history.iterrows():
    cursor.execute(insert_price, (
        symbol, row["Date"].date(), row["Open"], row["High"],
        row["Low"], row["Close"], row["Volume"]
    ))

conn.commit()
cursor.close()
conn.close()
