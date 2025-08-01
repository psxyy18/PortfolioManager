USE financial_db;
-- INSERT INTO user_info (user_name, user_contact, cash_balance) VALUES
-- ('StarVest', 'starvest@example.com', 180000.00);

INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
VALUES (1, 'AAPL', 'BUY', 220.00, 150);

INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
VALUES (1, 'GOOGL', 'BUY', 100.00, 30);

INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
VALUES (1, 'NVDA', 'BUY', 120.00, 150);

INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
VALUES (1, 'AMZN', 'BUY', 250.00, 30);

INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
VALUES (1, 'NFLX', 'BUY', 1000.00, 10);

INSERT INTO stock_transaction_logs (user_id, ticker_symbol, transaction_type, price, number_of_shares)
VALUES (1, 'META', 'BUY', 500.00, 130);