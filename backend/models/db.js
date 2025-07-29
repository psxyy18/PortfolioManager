const mysql = require('mysql2/promise');

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'bryant24',
  database: 'financial_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 封装常用方法
module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  beginTransaction: async () => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    return conn;
  },
  commit: async (conn) => {
    await conn.commit();
    conn.release();
  },
  rollback: async (conn) => {
    await conn.rollback();
    conn.release();
  }
};
