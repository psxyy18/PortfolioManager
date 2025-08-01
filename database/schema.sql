DROP DATABASE IF EXISTS financial_db;

CREATE DATABASE financial_db;

USE financial_db;

# stock information
CREATE TABLE stock_info (
    ticker_symbol VARCHAR(10) UNIQUE,       
    company_name VARCHAR(255) NOT NULL,     
    short_name VARCHAR(150),                   
    exchange VARCHAR(50),                   
    industry VARCHAR(100),                    
    sector VARCHAR(100),                     
    market_cap DECIMAL(20,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ticker_symbol)
);

# stock historical information price
CREATE TABLE stock_hist (
    hist_id INT PRIMARY KEY AUTO_INCREMENT,
    ticker_symbol VARCHAR(10) NOT NULL,
    price_date DATE NOT NULL,
    open_price DECIMAL(12,8),
    close_price DECIMAL(12,8),
    high_price DECIMAL(12,8),
    low_price DECIMAL(12,8),
    volume BIGINT DEFAULT 0,
    FOREIGN KEY (ticker_symbol) REFERENCES stock_info(ticker_symbol),
    UNIQUE (ticker_symbol, price_date)
);


# fund information
CREATE TABLE fund_info (
    fund_symbol VARCHAR(10) PRIMARY KEY,
    fund_name VARCHAR(255) NOT NULL,
    -- price DECIMAL(10,2),
    total_net_assets DECIMAL(15,2) DEFAULT 0.00, 
    fund_category VARCHAR(50),
    investment_type VARCHAR(50), 
    size_type VARCHAR(50)
);

# fund historical information price
CREATE TABLE fund_hist (
    hist_id INT PRIMARY KEY AUTO_INCREMENT,
    fund_symbol VARCHAR(10) NOT NULL,
    price_date DATE NOT NULL,
    open_price DECIMAL(12,8),
    close_price DECIMAL(12,8),
    high_price DECIMAL(12,8),
    low_price DECIMAL(12,9),
    volume BIGINT DEFAULT 0,
    FOREIGN KEY (fund_symbol) REFERENCES fund_info(fund_symbol),
    UNIQUE (fund_symbol, price_date)
);

# basic user information
CREATE TABLE user_info (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(100) NOT NULL,
    user_contact VARCHAR(100) NOT NULL UNIQUE, 
    cash_balance DECIMAL(15,2) DEFAULT 0.00, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# stock transaction log
CREATE TABLE stock_transaction_logs (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ticker_symbol VARCHAR(10) NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    number_of_shares INT NOT NULL,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (ticker_symbol) REFERENCES stock_info(ticker_symbol)
);

# user current stock holding
CREATE TABLE user_stock_holding (
    user_id INT NOT NULL,
    ticker_symbol VARCHAR(10) NOT NULL,
    holding_shares INT DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    total_profit DECIMAL(15,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, ticker_symbol),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (ticker_symbol) REFERENCES stock_info(ticker_symbol)
);


# fund transaction log
CREATE TABLE fund_transaction_logs (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    fund_symbol VARCHAR(10) NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    number_of_fund DECIMAL(10,4) NOT NULL,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (fund_symbol) REFERENCES fund_info(fund_symbol)
);

# user current fund holdings
CREATE TABLE user_fund_holding (
    user_id INT NOT NULL,
    fund_symbol VARCHAR(10) NOT NULL,
    holding_fund DECIMAL(10,4) DEFAULT 0.0000,
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    total_profit DECIMAL(15,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, fund_symbol),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (fund_symbol) REFERENCES fund_info(fund_symbol)
);


# trigger

# stock change
DELIMITER //

CREATE TRIGGER update_stock_holding_after_transaction
AFTER INSERT ON stock_transaction_logs
FOR EACH ROW
BEGIN
  DECLARE avg_cost DECIMAL(15,2);
  DECLARE new_total_cost DECIMAL(15,2);
  DECLARE profit DECIMAL(15,2);

  IF NEW.transaction_type = 'BUY' THEN
    INSERT INTO user_stock_holding (user_id, ticker_symbol, holding_shares, total_cost)
    VALUES (NEW.user_id, NEW.ticker_symbol, NEW.number_of_shares, NEW.price * NEW.number_of_shares)
    ON DUPLICATE KEY UPDATE
      holding_shares = holding_shares + NEW.number_of_shares,
      total_cost = total_cost + (NEW.price * NEW.number_of_shares);

  ELSEIF NEW.transaction_type = 'SELL' THEN
    SELECT total_cost / holding_shares INTO avg_cost
    FROM user_stock_holding
    WHERE user_id = NEW.user_id AND ticker_symbol = NEW.ticker_symbol;

    SET new_total_cost = avg_cost * NEW.number_of_shares;
    SET profit = (NEW.price * NEW.number_of_shares) - new_total_cost;

    UPDATE user_stock_holding
    SET
      holding_shares = holding_shares - NEW.number_of_shares,
      total_cost = total_cost - new_total_cost,
      total_profit = total_profit + profit
    WHERE user_id = NEW.user_id AND ticker_symbol = NEW.ticker_symbol;
  END IF;
END;
//

DELIMITER ;


# fund change
DELIMITER //

CREATE TRIGGER update_fund_holding_after_transaction
AFTER INSERT ON fund_transaction_logs
FOR EACH ROW
BEGIN
  DECLARE avg_cost DECIMAL(15,2);
  DECLARE new_total_cost DECIMAL(15,2);
  DECLARE profit DECIMAL(15,2);

  IF NEW.transaction_type = 'BUY' THEN
    INSERT INTO user_fund_holding (user_id, fund_symbol, holding_fund, total_cost)
    VALUES (NEW.user_id, NEW.fund_symbol, NEW.number_of_fund, NEW.price * NEW.number_of_fund)
    ON DUPLICATE KEY UPDATE
      holding_fund = holding_fund + NEW.number_of_fund,
      total_cost = total_cost + (NEW.price * NEW.number_of_fund);

  ELSEIF NEW.transaction_type = 'SELL' THEN
    SELECT total_cost / holding_fund INTO avg_cost
    FROM user_fund_holding
    WHERE user_id = NEW.user_id AND fund_symbol = NEW.fund_symbol;

    SET new_total_cost = avg_cost * NEW.number_of_fund;
    SET profit = (NEW.price * NEW.number_of_fund) - new_total_cost;

    UPDATE user_fund_holding
    SET
      holding_fund = holding_fund - NEW.number_of_fund,
      total_cost = total_cost - new_total_cost,
      total_profit = total_profit + profit
    WHERE user_id = NEW.user_id AND fund_symbol = NEW.fund_symbol;
  END IF;
END;
//

DELIMITER ;

INSERT INTO user_info (user_name, user_contact, cash_balance)
VALUES ('Alice Johnson', 'alice.johnson@example.com', 100000.00);
