module.exports = class PortfolioItem {
  constructor(id, stockTicker, volume) {
    this.id = id;
    this.stockTicker = stockTicker;
    this.volume = volume;
  }
};
