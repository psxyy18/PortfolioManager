const db = require('./backend/models/db'); // 确保路径正确

async function testDatabase() {
  try {
    console.log("1. 测试基础连接...");
    const basic = await db.query('SELECT 1 + 1 AS result');
    console.log('✓ 基础连接成功:', basic[0]?.result === 2 ? '通过' : '异常');


    console.log("\n2. 测试用户表数据...");
    const users = await db.query('SELECT * FROM user_info LIMIT 1');
    console.log('✓ 用户表数据:', users.length ? `找到 ${users.length} 条` : '无数据');

    console.log("\n3. 测试股票持仓查询...");
    const holdings = await db.query(`
      SELECT h.*, s.ticker_symbol 
      FROM user_stock_holding h
      JOIN stock_info s ON h.stock_id = s.stock_id
      LIMIT 1
    `);
    console.log('✓ 持仓数据:', holdings.length ? '查询成功' : '无持仓数据');

  } catch (err) {
    console.error('❌ 测试失败:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('请检查数据库用户名/密码');
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
      console.log('表不存在，请检查SQL语句或数据库结构');
    }
  }
}

testDatabase();
