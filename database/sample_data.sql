INSERT INTO user_info (user_name, user_contact, cash_balance) VALUES
('Alice Smith', 'alice@example.com', 10000.00),
('Bob Johnson', 'bob@example.com', 15000.00),
('Carol Lee', 'carol@example.com', 12000.00);

INSERT INTO bonds_info (bond_name, issuer, maturity_date, coupon_rate, face_value, market) VALUES
('US Treasury 10Y', 'US Government', '2033-01-01', 1.5, 1000.00, 'NYSE'),
('Corporate Bond A', 'Corp A', '2028-06-30', 2.5, 1000.00, 'NYSE');

INSERT INTO stock_transaction_logs (user_id, stock_id, transaction_type, price, number_of_shares) VALUES
(1, 1, 'BUY', 150.00, 10),
(1, 2, 'BUY', 100.00, 5),
(2, 1, 'BUY', 145.00, 8),
(2, 1, 'SELL', 160.00, 3),
(3, 3, 'BUY', 200.00, 15),
(3, 3, 'SELL', 210.00, 5);

INSERT INTO bonds_transaction_logs (user_id, bond_id, transaction_type, price, number_of_bonds) VALUES
(1, 1, 'BUY', 1000.00, 2),
(2, 1, 'BUY', 1005.00, 1),
(3, 2, 'BUY', 980.00, 3),
(3, 2, 'SELL', 990.00, 1);
