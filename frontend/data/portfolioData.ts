// 30天投资组合数据 - 从CSV导入
export interface PortfolioDataRow {
  date: string;
  portfolioValue: number;
  totalReturnPercent: number;
  dailyGain: number;
  holdingGain: number;
  cumulativeGain: number;
}

export const portfolioData: PortfolioDataRow[] = [
  { date: '2025-07-02', portfolioValue: 100000.0, totalReturnPercent: 2.0, dailyGain: 0.0, holdingGain: 2249.648806756470, cumulativeGain: 2368.51 },
  { date: '2025-07-03', portfolioValue: 100328.36, totalReturnPercent: 0.33, dailyGain: 328.36, holdingGain: 2219.303046994250, cumulativeGain: 1880.31 },
  { date: '2025-07-04', portfolioValue: 100339.26, totalReturnPercent: 0.34, dailyGain: 10.9, holdingGain: 1359.527609251490, cumulativeGain: 1244.08 },
  { date: '2025-07-05', portfolioValue: 100744.47, totalReturnPercent: 0.74, dailyGain: 405.21, holdingGain: 2068.916754876500, cumulativeGain: 1990.37 },
  { date: '2025-07-06', portfolioValue: 101592.25, totalReturnPercent: 1.59, dailyGain: 847.78, holdingGain: 921.7497132365120, cumulativeGain: 1068.81 },
  { date: '2025-07-07', portfolioValue: 101554.59, totalReturnPercent: 1.55, dailyGain: -37.67, holdingGain: 2430.814829854420, cumulativeGain: 2818.67 },
  { date: '2025-07-08', portfolioValue: 101516.94, totalReturnPercent: 1.52, dailyGain: -37.64, holdingGain: 1249.330843596140, cumulativeGain: 1517.59 },
  { date: '2025-07-09', portfolioValue: 102399.74, totalReturnPercent: 2.4, dailyGain: 882.8, holdingGain: 2665.646997911940, cumulativeGain: 2325.09 },
  { date: '2025-07-10', portfolioValue: 102874.59, totalReturnPercent: 2.87, dailyGain: 474.85, holdingGain: 1689.1432797059500, cumulativeGain: 1623.48 },
  { date: '2025-07-11', portfolioValue: 102715.4, totalReturnPercent: 2.72, dailyGain: -159.19, holdingGain: 2209.993036997490, cumulativeGain: 2040.19 },
  { date: '2025-07-12', portfolioValue: 103076.22, totalReturnPercent: 3.08, dailyGain: 360.82, holdingGain: 1692.0212908473500, cumulativeGain: 2093.48 },
  { date: '2025-07-13', portfolioValue: 102919.84, totalReturnPercent: 2.92, dailyGain: -156.38, holdingGain: 1627.237367278370, cumulativeGain: 1369.77 },
  { date: '2025-07-14', portfolioValue: 102762.52, totalReturnPercent: 2.76, dailyGain: -157.33, holdingGain: 3330.068823477370, cumulativeGain: 2939.22 },
  { date: '2025-07-15', portfolioValue: 102969.05, totalReturnPercent: 2.97, dailyGain: 206.53, holdingGain: 2256.8779216544500, cumulativeGain: 2550.33 },
  { date: '2025-07-16', portfolioValue: 102066.38, totalReturnPercent: 2.07, dailyGain: -902.67, holdingGain: 2512.6245414351700, cumulativeGain: 2879.04 },
  { date: '2025-07-17', portfolioValue: 101267.75, totalReturnPercent: 1.27, dailyGain: -798.63, holdingGain: 2436.3999572191700, cumulativeGain: 2789.68 },
  { date: '2025-07-18', portfolioValue: 101064.06, totalReturnPercent: 1.06, dailyGain: -203.69, holdingGain: 2023.880480774170, cumulativeGain: 2195.82 },
  { date: '2025-07-19', portfolioValue: 100633.11, totalReturnPercent: 0.63, dailyGain: -430.95, holdingGain: 2871.9205400074000, cumulativeGain: 2843.76 },
  { date: '2025-07-20', portfolioValue: 100871.73, totalReturnPercent: 0.87, dailyGain: 238.62, holdingGain: 1144.959714776710, cumulativeGain: 1177.0 },
  { date: '2025-07-21', portfolioValue: 100494.46, totalReturnPercent: 0.49, dailyGain: -377.27, holdingGain: 1275.7380554291500, cumulativeGain: 1391.98 },
  { date: '2025-07-22', portfolioValue: 99865.21, totalReturnPercent: -0.13, dailyGain: -629.25, holdingGain: 1139.2379956200100, cumulativeGain: 1090.45 },
  { date: '2025-07-23', portfolioValue: 100676.94, totalReturnPercent: 0.68, dailyGain: 811.73, holdingGain: 1412.6393323850000, cumulativeGain: 1650.67 },
  { date: '2025-07-24', portfolioValue: 100643.83, totalReturnPercent: 0.64, dailyGain: -33.11, holdingGain: 1629.595653586820, cumulativeGain: 1777.37 },
  { date: '2025-07-25', portfolioValue: 100758.33, totalReturnPercent: 0.76, dailyGain: 114.5, holdingGain: 1460.2440317070400, cumulativeGain: 1542.71 },
  { date: '2025-07-26', portfolioValue: 100121.16, totalReturnPercent: 0.12, dailyGain: -637.17, holdingGain: 2610.7827446628400, cumulativeGain: 2657.48 },
  { date: '2025-07-27', portfolioValue: 99928.73, totalReturnPercent: -0.07, dailyGain: -192.42, holdingGain: 1908.9707446426200, cumulativeGain: 1713.51 },
  { date: '2025-07-28', portfolioValue: 100064.1, totalReturnPercent: 0.06, dailyGain: 135.36, holdingGain: 1374.241796055870, cumulativeGain: 1561.87 },
  { date: '2025-07-29', portfolioValue: 99568.28, totalReturnPercent: -0.43, dailyGain: -495.81, holdingGain: 2097.253685271590, cumulativeGain: 2085.38 },
  { date: '2025-07-30', portfolioValue: 99834.98, totalReturnPercent: -0.17, dailyGain: 266.69, holdingGain: 1329.2346460383200, cumulativeGain: 1281.85 },
  { date: '2025-07-31', portfolioValue: 99615.02, totalReturnPercent: -0.38, dailyGain: -219.96, holdingGain: 2131.901996153530, cumulativeGain: 2604.39 }
];

// 计算统计数据的辅助函数
export const calculatePortfolioStats = () => {
  const lastDay = portfolioData[portfolioData.length - 1];
  const firstDay = portfolioData[0];
  
  // 今日收益百分比
  const dailyGainPercent = (lastDay.dailyGain / lastDay.portfolioValue) * 100;
  
  // 持仓收益百分比 = (最后一天 - 第一天) / 第一天
  const holdingGainPercent = ((lastDay.holdingGain - firstDay.holdingGain) / firstDay.holdingGain) * 100;
  
  // 累计收益百分比
  const cumulativeGainPercent = ((lastDay.cumulativeGain - firstDay.cumulativeGain) / firstDay.cumulativeGain) * 100;
  
  // 投资组合总回报
  const totalReturn = lastDay.portfolioValue - firstDay.portfolioValue;
  const totalReturnPercent = (totalReturn / firstDay.portfolioValue) * 100;
  
  return {
    // 当前投资组合数据
    currentPortfolioValue: lastDay.portfolioValue,
    totalReturn,
    totalReturnPercent: lastDay.totalReturnPercent,
    
    // 今日数据
    dailyGain: lastDay.dailyGain,
    dailyGainPercent,
    
    // 持仓数据
    holdingGain: lastDay.holdingGain,
    holdingGainPercent,
    holdingGainData: portfolioData.map(item => ({
      date: new Date(item.date),
      value: item.holdingGain
    })),
    
    // 累计收益数据
    cumulativeGain: lastDay.cumulativeGain,
    cumulativeGainPercent,
    cumulativeGainData: portfolioData.map(item => ({
      date: new Date(item.date),
      value: item.cumulativeGain
    })),
    
    // 投资组合历史数据
    portfolioHistory: portfolioData.map(item => ({
      date: new Date(item.date),
      value: item.portfolioValue,
      returnPercent: item.totalReturnPercent,
      dailyGain: item.dailyGain
    })),
    
    // 统计信息
    periodStart: firstDay.date,
    periodEnd: lastDay.date,
    totalDays: portfolioData.length,
    maxPortfolioValue: Math.max(...portfolioData.map(item => item.portfolioValue)),
    minPortfolioValue: Math.min(...portfolioData.map(item => item.portfolioValue)),
  };
};

// 获取特定日期范围的数据
export const getDataByDateRange = (startDate: string, endDate: string) => {
  return portfolioData.filter(item => {
    const itemDate = new Date(item.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return itemDate >= start && itemDate <= end;
  });
};

// 获取最近N天的数据
export const getRecentDaysData = (days: number) => {
  return portfolioData.slice(-days);
};

// 数据摘要
export const portfolioSummary = {
  title: "30天投资组合模拟",
  startDate: "2025-07-02",
  endDate: "2025-07-31",
  initialValue: 100000.0,
  finalValue: 99615.02,
  totalChange: -384.98,
  totalChangePercent: -0.385,
  totalRecords: portfolioData.length
};
