const express = require('express');
const cors = require('cors');
const app = express();

const portfolioRoutes = require('./routes/portfolioRoutes');

app.use(cors());
app.use(express.json());

app.use('/portfolio', portfolioRoutes);

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
