// backend/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const portfolioRoutes = require('./routes/portfolio');
const stockRoutes = require('./routes/stock');
const fundRoutes = require('./routes/fund');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/portfolio', portfolioRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/fund', fundRoutes);

module.exports = app; // <-- add this line
if (require.main === module) {
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
}