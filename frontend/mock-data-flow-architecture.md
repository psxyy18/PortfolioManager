# PortfolioManager Frontend - Mock数据流转架构图

## 📊 数据流向概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Mock数据源层                               │
├─────────────────────────────────────────────────────────────┤
│ /mock/portfolioMockData.ts                                 │
│ ├── portfolioMockData (投资组合数据)                        │
│ ├── portfolioDetailsMockData (详细信息)                     │
│ ├── transactionMockData (交易响应数据)                      │
│ └── errorMockData (错误响应数据)                            │
│                                                             │
│ /mock/dashboardMockData.ts                                 │
│ ├── currentHoldings (当前持仓)                              │
│ ├── stockPriceHistories (价格历史)                          │
│ ├── marketTabs (市场标签)                                   │
│ └── accountOverview (账户概览)                              │
│                                                             │
│ /mock/marketMockData.ts                                    │
│ ├── marketTop10Stocks (市场股票)                           │
│ ├── mockUserBalance (用户余额)                              │
│ └── mockPurchaseResponse (购买响应)                         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   组件数据导入层                             │
├─────────────────────────────────────────────────────────────┤
│ import { portfolioMockData } from '../../mock/...'         │
│                                                             │
│ 📁 /app/components/                                        │
│ ├── MockDataTester.tsx ──► 数据解析测试                    │
│ ├── PortfolioBubbleChart.tsx ──► 投资组合气泡图             │
│ ├── PortfolioLineChart.tsx ──► 投资组合折线图               │
│ ├── MarketStocksPage.tsx ──► 市场股票页面(旧版购物车)       │
│ ├── StockWatchlistPage.tsx ──► 股票自选界面(基础版)        │
│ ├── TradingPlatform.tsx ──► 专业股票交易平台(新版)         │
│ └── DashboardContent.tsx ──► 仪表盘内容                     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   状态管理层                                 │
├─────────────────────────────────────────────────────────────┤
│ React useState Hooks:                                      │
│                                                             │
│ const [portfolioData, setPortfolioData] = useState(mock)   │
│ const [selectedData, setSelectedData] = useState(null)     │
│ const [testResults, setTestResults] = useState([])         │
│ const [userBalance, setUserBalance] = useState(mockBal)    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据处理层                                 │
├─────────────────────────────────────────────────────────────┤
│ 📋 JSON解析函数:                                            │
│ ├── testJSONParsing() - 测试序列化/反序列化                │
│ ├── formatCurrency() - 货币格式化                          │
│ ├── formatPercent() - 百分比格式化                          │
│ └── 数据验证和完整性检查                                     │
│                                                             │
│ 📊 数据转换:                                                │
│ ├── Mock数据 → 组件Props                                   │
│ ├── 原始数据 → 图表数据格式                                 │
│ └── API响应格式模拟                                         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   UI渲染层                                   │
├─────────────────────────────────────────────────────────────┤
│ 📱 页面组件:                                                │
│ ├── /app/(dashboard)/page.tsx                              │
│ ├── /app/mock-test/page.tsx                                │
│ ├── /app/watchlist/page.tsx ──► 专业交易平台页面           │
│ └── /app/(dashboard)/details/page.tsx                      │
│                                                             │
│ 🎨 UI组件:                                                  │
│ ├── Material-UI Tables                                     │
│ ├── Charts (@mui/x-charts)                                │
│ ├── Cards & Accordions                                     │
│ └── Buttons & Dialogs                                      │
└─────────────────────────────────────────────────────────────┘

## 🔄 数据流转详细路径

### 1. 投资组合数据流
```
portfolioMockData.ts
    │
    ├── MockDataTester.tsx
    │   ├── testJSONParsing() ──► 解析测试
    │   ├── showDataDetails() ──► 详情展示
    │   └── 表格渲染 ──► UI展示
    │
    └── DashboardContent.tsx
        └── StatCard组件 ──► 统计卡片展示
```

### 2. 图表数据流
```
dashboardMockData.ts
    │
    ├── PortfolioBubbleChart.tsx
    │   ├── currentHoldings ──► 气泡图数据
    │   ├── marketTabs ──► 市场切换
    │   └── 筛选逻辑 ──► 图表渲染
    │
    └── PortfolioLineChart.tsx
        ├── stockPriceHistories ──► 折线图数据
        ├── 时间序列处理 ──► LineChart组件
        └── Tab切换 ──► 多市场展示
```

### 3. 市场数据流
```
marketMockData.ts
    │
    ├── MarketStocksPage.tsx (旧版)
    │   ├── marketTop10Stocks ──► 股票列表
    │   ├── mockUserBalance ──► 用户余额
    │   ├── 购物车逻辑 ──► 交易模拟
    │   └── mockPurchaseResponse ──► 响应模拟
    │
    └── TradingPlatform.tsx (专业版)
        ├── marketTop10Stocks ──► 专业行情展示
        ├── 实时状态栏 ──► 资金/自选/订单状态
        ├── 四大功能模块 ──► 行情/自选/订单/分析
        ├── 智能搜索筛选 ──► 多维度数据筛选
        ├── 专业交易系统 ──► 市价单/限价单
        ├── 订单管理 ──► 完整交易生命周期
        ├── 可视化设计 ──► 涨跌幅进度条/趋势图标
        └── 响应式布局 ──► 移动端完美适配
```

## 🔧 关键处理函数路径

### MockDataTester组件核心函数:
```typescript
// 位置: /app/components/MockDataTester.tsx

1. testJSONParsing(data: any, name: string)
   ├── JSON.stringify(data) ──► 序列化
   ├── JSON.parse(jsonString) ──► 反序列化  
   ├── 数据完整性验证
   └── 结果存储到state

2. runAllTests()
   ├── 清空测试结果
   ├── 遍历所有mock数据
   ├── 调用testJSONParsing()
   └── 更新UI状态

3. showDataDetails(data: any, type: string)
   ├── 设置选中数据
   ├── 设置数据类型
   └── 触发详情面板渲染

4. formatCurrency(amount: number)
   └── Intl.NumberFormat ──► 货币格式化

5. formatPercent(percent: number)  
   └── 百分比格式化
```

## 📡 未来后端集成路径

### 当前架构扩展建议:
```
┌─────────────────────────────────────────────────────────────┐
│                   API服务层 (Future)                        │
├─────────────────────────────────────────────────────────────┤
│ /app/api/portfolio/route.ts                               │
│ ├── GET /api/portfolio ──► 获取投资组合                    │
│ ├── POST /api/portfolio/buy ──► 买入股票                   │
│ └── POST /api/portfolio/sell ──► 卖出股票                  │
│                                                             │
│ /app/api/market/route.ts                                   │
│ ├── GET /api/market/stocks ──► 获取市场数据                │
│ └── GET /api/market/realtime ──► 实时价格                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据获取层 (Future)                        │
├─────────────────────────────────────────────────────────────┤
│ Custom Hooks:                                              │
│ ├── usePortfolio() ──► SWR/React Query                    │
│ ├── useMarketData() ──► 实时数据获取                       │
│ └── useTransactions() ──► 交易历史                         │
│                                                             │
│ API Utils:                                                 │
│ ├── fetchPortfolio()                                       │
│ ├── executeTransaction()                                   │
│ └── getMarketData()                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Mock数据解析特点

1. **类型安全**: 使用TypeScript接口定义数据结构
2. **模块化**: 按功能分离不同的mock文件  
3. **完整性**: 包含成功/失败场景的完整响应
4. **可测试**: 提供专门的测试组件验证数据解析
5. **实时预览**: MockDataTester提供可视化数据检查工具

## 📝 总结

当前项目使用静态mock数据，通过ES6模块导入到各个组件中。数据经过React状态管理，通过格式化函数处理后在UI中展示。MockDataTester组件提供了完整的数据解析测试功能，确保数据结构的正确性和完整性。未来集成后端时，只需要将mock数据导入替换为API调用即可。

## 🔗 相关文档

- **[后端集成完整指南](./backend-integration-guide.md)** - 详细的从Mock数据迁移到真实后端的步骤指南
- **[股票自选界面设计](./stock-watchlist-design.md)** - 基础版股票自选和交易界面的设计文档
- **[专业交易平台设计](./trading-platform-design.md)** - 全新专业股票交易平台的完整设计文档
