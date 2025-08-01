# STARVEST - Stock Portfolio Management System

A comprehensive full-stack stock portfolio management application built with Next.js, Express.js, and MySQL. The system provides real-time portfolio tracking, trading capabilities, and advanced analytics.

## 🏗️ Project Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with MySQL database
- **Port**: 3001 (default)
- **Key Features**:
  - RESTful API endpoints for portfolio management
  - Real-time stock data integration via Yahoo Finance API
  - Transaction logging and portfolio tracking
  - User authentication and session management

### Frontend (Next.js/React)
- **Framework**: Next.js 15 with React 19
- **UI Library**: Material-UI (MUI) v7 with Toolpad Core
- **Port**: 3050 (development)
- **Key Features**:
  - Modern, responsive dashboard
  - Real-time portfolio visualization
  - Interactive charts and analytics
  - Authentication with NextAuth.js

### Database (MySQL)
- **Schema**: Comprehensive financial database with triggers
- **Tables**: Stock info, fund info, user data, transaction logs, holdings
- **Features**: Automatic portfolio updates via database triggers

## 📁 Project Structure

```
Final/
├── backend/                 # Express.js API server
│   ├── controllers/        # Business logic controllers
│   ├── routes/            # API route definitions
│   ├── __tests__/         # Jest test files
│   └── app.js             # Main server file
├── frontend/              # Next.js React application
│   ├── app/               # App Router pages
│   │   ├── (dashboard)/   # Dashboard components
│   │   ├── api/           # API routes
│   │   └── components/    # Reusable UI components
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Data services
│   └── theme/             # MUI theme customization
└── database/              # Database schema and data
    ├── schema.sql         # Database schema
    └── sample_data.sql    # Sample data
```

## 🚀 Key Features

### Portfolio Management
- **Real-time Portfolio Tracking**: Monitor stock and fund holdings with live price updates
- **Transaction History**: Complete buy/sell transaction logging
- **Performance Analytics**: 30-day performance tracking with charts
- **Gain/Loss Calculation**: Automatic P&L calculations for all holdings

### Trading Platform
- **Stock Trading**: Buy/sell stocks with real-time pricing
- **Fund Management**: ETF and mutual fund trading capabilities
- **Cash Management**: Deposit/withdraw cash functionality
- **Order Management**: Track pending and completed orders

### Analytics & Visualization
- **Portfolio Bubble Chart**: Visual representation of holdings by size
- **Performance Line Charts**: Historical performance tracking
- **Revenue Calendar Heatmap**: Daily performance visualization
- **Stock Watchlist**: Monitor favorite stocks
- **Sector Analysis**: Portfolio diversification insights

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Authentication**: Secure login with NextAuth.js
- **Real-time Updates**: Live price updates and portfolio changes
- **Modern UI**: Material-UI components with custom theming

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MySQL with mysql2 driver
- **Finance API**: Yahoo Finance 2 for real-time data
- **Testing**: Jest with Supertest
- **CORS**: Cross-origin resource sharing enabled

### Frontend
- **Framework**: Next.js 15 with React 19
- **UI Library**: Material-UI (MUI) v7
- **Charts**: MUI X Charts for data visualization
- **Data Grid**: MUI X Data Grid for tabular data
- **Authentication**: NextAuth.js v5
- **Styling**: Emotion with MUI theme system
- **Core**: Toolpad Core for enhanced functionality

### Database
- **Engine**: MySQL
- **Features**: 
  - Foreign key constraints
  - Database triggers for automatic updates
  - Transaction logging
  - Historical price data storage

## 📊 Database Schema

### Core Tables
- **stock_info**: Stock metadata (symbol, company name, sector, etc.)
- **stock_hist**: Historical stock price data
- **fund_info**: Fund metadata and information
- **fund_hist**: Historical fund price data
- **user_info**: User account information and cash balance

### Transaction Tables
- **stock_transaction_logs**: Buy/sell transaction records
- **fund_transaction_logs**: Fund trading records
- **user_stock_holding**: Current stock holdings
- **user_fund_holding**: Current fund holdings

### Database Triggers
- **update_stock_holding_after_transaction**: Automatically updates holdings after trades
- **update_fund_holding_after_transaction**: Automatically updates fund holdings after trades

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=3001
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=financial_db
```

### Database Setup
```bash
# Connect to MySQL and run schema
mysql -u your_username -p < database/schema.sql
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env.local` file in frontend directory:
```env
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3050
```

### Running the Application

1. **Start the backend server**:
```bash
cd backend
npm start
```

2. **Start the frontend development server**:
```bash
cd frontend
npm run dev
```

3. **Access the application**:
- Frontend: http://localhost:3050
- Backend API: http://localhost:3001

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Development
The frontend includes comprehensive component testing and mock data for development.

## 📈 API Endpoints

### Portfolio Management
- `GET /api/portfolio` - Get user portfolio summary
- `GET /api/portfolio/performance` - Get 30-day performance data
- `GET /api/portfolio/gain-loss` - Get current gain/loss for all holdings
- `POST /api/portfolio/stock` - Buy stock
- `POST /api/portfolio/stock/sell` - Sell stock
- `DELETE /api/portfolio/stock/:ticker` - Remove stock holding
- `POST /api/portfolio/cash/deposit` - Deposit cash
- `POST /api/portfolio/cash/withdraw` - Withdraw cash

### Stock Data
- `GET /api/stock` - Get available stocks
- `GET /api/stock/:symbol` - Get specific stock data
- `GET /api/stock/:symbol/history` - Get stock price history

### Fund Data
- `GET /api/fund` - Get available funds
- `GET /api/fund/:symbol` - Get specific fund data
- `GET /api/fund/:symbol/history` - Get fund price history

## 🔐 Authentication

The application uses NextAuth.js for authentication with:
- Session-based authentication
- Secure token management
- Protected API routes
- User session persistence

## 📱 Features in Detail

### Dashboard
- Portfolio overview with key metrics
- Real-time stock price updates
- Performance charts and analytics
- Quick trading interface

### Trading Platform
- Stock and fund trading interface
- Real-time price feeds
- Order management system
- Transaction history

### Analytics
- Portfolio performance tracking
- Sector allocation analysis
- Risk assessment tools
- Historical data visualization

### Watchlist
- Custom stock watchlists
- Price alerts and notifications
- Market news integration
- Portfolio comparison tools

## 🚀 Deployment

### Backend Deployment
- Configure environment variables
- Set up MySQL database
- Deploy to cloud platform (Heroku, AWS, etc.)

### Frontend Deployment
- Build for production: `npm run build`
- Deploy to Vercel, Netlify, or other platforms
- Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the existing documentation
2. Review the API integration guide
3. Check the test files for usage examples
4. Create an issue in the repository

---

**STARVEST** - Your comprehensive solution for modern portfolio management and trading. 