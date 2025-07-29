import pandas as pd
import mysql.connector

# Load CSV
df = pd.read_csv('stock_data.csv')  

# Connect to MySQL
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='001201kattyA',
    database='financial_db'
)
cursor = conn.cursor()

# Loop through rows
for _, row in df.iterrows():
    try:
        ticker = row['ticker']
        company_name = row['company name']
        short_name = row.get('short name', None)
        exchange = row.get('exchange', None)
        industry = row.get('industry', None)
        sector = row.get('sector', None)
        market_cap = row.get('market cap', None)

        cursor.execute("""
            INSERT INTO stock_info (
                ticker_symbol, company_name, short_name, exchange, industry, sector, market_cap
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                company_name = VALUES(company_name),
                short_name = VALUES(short_name),
                exchange = VALUES(exchange),
                industry = VALUES(industry),
                sector = VALUES(sector),
                market_cap = VALUES(market_cap)
        """, (ticker, company_name, short_name, exchange, industry, sector, market_cap))

    except Exception as e:
        print(f"❌ Error inserting {row['ticker']}: {e}")

# Commit & close
conn.commit()
cursor.close()
conn.close()

print("✅ All done!")
