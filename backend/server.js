const express = require('express');
const cors = require('cors');
const app = express();

const portfolioRoutes = require('./routes/portfolioRoutes');

app.use(cors());
app.use(express.json());

// 临时测试用中间件，固定一个 user
app.use((req, res, next) => {
  req.user = { id: 1 };  // 固定 user_id=1
  next();
});


// 临时加一个 mock 登录用户，后面接入真正的用户系统时再去掉
app.use((req, res, next) => {
  req.user = { id: 1 }; // 假设测试用户 ID=1
  next();
});

app.use('/portfolio', portfolioRoutes);

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
