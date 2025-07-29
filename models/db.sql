CREATE DATABASE financial_db;

USE financial_db;

# stock information
CREATE TABLE stock_info (
    stock_id INT PRIMARY KEY AUTO_INCREMENT,
    ticker_symbol VARCHAR(10) NOT NULL UNIQUE,       -- "symbol": "AAPL"
    company_name VARCHAR(255) NOT NULL,              -- "longName": "Apple Inc."
    exchange_name VARCHAR(100),                      -- "fullExchangeName": "NasdaqGS"
    market_cap BIGINT,                               -- "marketCap"
    currency VARCHAR(10),                            -- "currency": "USD"
    regular_market_price DECIMAL(10,2),              -- "regularMarketPrice"
    regular_market_change_percent DECIMAL(6,4),      -- "regularMarketChangePercent"
    dividend_rate DECIMAL(6,2),                      -- "dividendRate"
    trailing_pe DECIMAL(10,4),                       -- "trailingPE"
    eps_ttm DECIMAL(10,4),                           -- "epsTrailingTwelveMonths"
    price_to_book DECIMAL(10,4),                     -- "priceToBook"
    fifty_two_week_high DECIMAL(10,2),               -- "fiftyTwoWeekHigh"
    fifty_two_week_low DECIMAL(10,2),                -- "fiftyTwoWeekLow"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# stock historical information price
CREATE TABLE stock_hist (
    hist_id INT PRIMARY KEY AUTO_INCREMENT,
    stock_id INT NOT NULL,
    price_date DATE NOT NULL,
    open_price DECIMAL(12,9),
    close_price DECIMAL(12,9),
    high_price DECIMAL(12,9),
    low_price DECIMAL(12,9),
    volume BIGINT DEFAULT 0,
    FOREIGN KEY (stock_id) REFERENCES stock_info(stock_id),
    UNIQUE (stock_id, price_date)
);


# bonds information
CREATE TABLE bonds_info (
    bond_id INT PRIMARY KEY AUTO_INCREMENT,
    bond_name VARCHAR(255) NOT NULL,
    issuer VARCHAR(100),
    maturity_date DATE,
    coupon_rate DECIMAL(5,2),
    face_value DECIMAL(10,2),
    market VARCHAR(50)
);

# basic user information
CREATE TABLE user_info (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(100) NOT NULL,
    user_contact VARCHAR(100) NOT NULL UNIQUE, -- Email
    cash_balance DECIMAL(15,2) DEFAULT 0.00, -- Total cash available
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


# stock transaction log
CREATE TABLE stock_transaction_logs (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    stock_id INT NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    number_of_shares INT NOT NULL,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (stock_id) REFERENCES stock_info(stock_id)
);

# user current stock holding
CREATE TABLE user_stock_holding (
    user_id INT NOT NULL,
    stock_id INT NOT NULL,
    holding_shares INT DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    total_profit DECIMAL(15,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, stock_id),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (stock_id) REFERENCES stock_info(stock_id)
);


# bond transaction log
CREATE TABLE bonds_transaction_logs (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bond_id INT NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    number_of_bonds INT NOT NULL,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (bond_id) REFERENCES bonds_info(bond_id)
);

# user current bond holdings
CREATE TABLE user_bonds_holding (
    user_id INT NOT NULL,
    bond_id INT NOT NULL,
    holding_bonds INT DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    total_profit DECIMAL(15,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, bond_id),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (bond_id) REFERENCES bonds_info(bond_id)
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
    INSERT INTO user_stock_holding (user_id, stock_id, holding_shares, total_cost)
    VALUES (NEW.user_id, NEW.stock_id, NEW.number_of_shares, NEW.price * NEW.number_of_shares)
    ON DUPLICATE KEY UPDATE
      holding_shares = holding_shares + NEW.number_of_shares,
      total_cost = total_cost + (NEW.price * NEW.number_of_shares);

  ELSEIF NEW.transaction_type = 'SELL' THEN
    SELECT total_cost / holding_shares INTO avg_cost
    FROM user_stock_holding
    WHERE user_id = NEW.user_id AND stock_id = NEW.stock_id;

    SET new_total_cost = avg_cost * NEW.number_of_shares;
    SET profit = (NEW.price * NEW.number_of_shares) - new_total_cost;

    UPDATE user_stock_holding
    SET
      holding_shares = holding_shares - NEW.number_of_shares,
      total_cost = total_cost - new_total_cost,
      total_profit = total_profit + profit
    WHERE user_id = NEW.user_id AND stock_id = NEW.stock_id;
  END IF;
END;
//

DELIMITER ;


# bond change
DELIMITER //

CREATE TRIGGER update_bond_holding_after_transaction
AFTER INSERT ON bonds_transaction_logs
FOR EACH ROW
BEGIN
  DECLARE avg_cost DECIMAL(15,2);
  DECLARE new_total_cost DECIMAL(15,2);
  DECLARE profit DECIMAL(15,2);

  IF NEW.transaction_type = 'BUY' THEN
    INSERT INTO user_bonds_holding (user_id, bond_id, holding_bonds, total_cost)
    VALUES (NEW.user_id, NEW.bond_id, NEW.number_of_bonds, NEW.price * NEW.number_of_bonds)
    ON DUPLICATE KEY UPDATE
      holding_bonds = holding_bonds + NEW.number_of_bonds,
      total_cost = total_cost + (NEW.price * NEW.number_of_bonds);

  ELSEIF NEW.transaction_type = 'SELL' THEN
    SELECT total_cost / holding_bonds INTO avg_cost
    FROM user_bonds_holding
    WHERE user_id = NEW.user_id AND bond_id = NEW.bond_id;

    SET new_total_cost = avg_cost * NEW.number_of_bonds;
    SET profit = (NEW.price * NEW.number_of_bonds) - new_total_cost;

    UPDATE user_bonds_holding
    SET
      holding_bonds = holding_bonds - NEW.number_of_bonds,
      total_cost = total_cost - new_total_cost,
      total_profit = total_profit + profit
    WHERE user_id = NEW.user_id AND bond_id = NEW.bond_id;
  END IF;
END;
//

DELIMITER ;

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // 根据你的实际密码填写
  database: 'financial_db'
});

module.exports = pool;


