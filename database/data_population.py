import pandas as pd
import mysql.connector

# Load CSV
df_stock = pd.read_csv('stock_data.csv')  
df_fund = pd.read_csv('funds_data.csv')

# Connect to MySQL
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='001201kattyA',
    database='financial_db'
)
cursor = conn.cursor()

##################################################
# STOCK
##################################################
for _, row in df_stock.iterrows():
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

##################################################
# FUND
##################################################
for _, row in df_fund.iterrows():
    try:
        fund_symbol = row['fund_symbol']
        fund_name = row['fund_short_name']  
        total_net_assets = row.get('total_net_assets', 0.00)
        fund_category = row.get('fund_category', None)
        investment_type = row.get('investment_type', None)
        size_type = row.get('size_type', None)

        cursor.execute("""
            INSERT INTO fund_info (
                fund_symbol, fund_name, total_net_assets, fund_category, investment_type, size_type
            ) VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                fund_name = VALUES(fund_name),
                total_net_assets = VALUES(total_net_assets),
                fund_category = VALUES(fund_category),
                investment_type = VALUES(investment_type),
                size_type = VALUES(size_type)
        """, (fund_symbol, fund_name, total_net_assets, fund_category, investment_type, size_type))

    except Exception as e:
        print(f"Error inserting fund {row['fund_symbol']}: {e}")


# Commit & close
conn.commit()
cursor.close()
conn.close()

print("✅ All done!")
