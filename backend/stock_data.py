import yfinance as yf
import mysql.connector

# 连接数据库
conn = mysql.connector.connect(
    host='localhost',      
    user='root',          
    password='',  
    database='abb'   
)
cursor = conn.cursor()

def insert_company(info):
    cursor.execute("""
        INSERT IGNORE INTO companies (symbol, name, sector, industry, exchange, country, currency, website)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        info.get("symbol"),
        info.get("longName"),
        info.get("sector"),
        info.get("industry"),
        info.get("exchange"),
        info.get("country"),
        info.get("currency"),
        info.get("website")
    ))
    conn.commit()
    cursor.execute("SELECT id FROM companies WHERE symbol = %s", (info["symbol"],))
    return cursor.fetchone()[0]

def insert_price(company_id, row):
    cursor.execute("""
        INSERT IGNORE INTO stock_prices (company_id, date, open, high, low, close, volume, dividends, stock_splits)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        company_id,
        row.name.date(),
        row['Open'],
        row['High'],
        row['Low'],
        row['Close'],
        row['Volume'],
        row['Dividends'],
        row['Stock Splits']
    ))

def save_stock(symbol):
    t = yf.Ticker(symbol)
    info = t.info
    company_id = insert_company(info)
    hist = t.history(period="1y")
    for _, row in hist.iterrows():
        insert_price(company_id, row)
    conn.commit()
    print(f"✅ 已保存 {symbol} 的数据")

# 示例：保存苹果(AAPL)和微软(MSFT)的数据
save_stock("AAPL")
save_stock("MSFT")
save_stock("GOOG")
save_stock("AMZN")
# 关闭连接
cursor.close()
conn.close()