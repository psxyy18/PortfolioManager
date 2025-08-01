const request = require('supertest');
const express = require('express');
const app = require('../app'); // Adjust if your app.js does not export the app
const pool = require('../db'); // Import your pool

describe('Portfolio API', () => {
  // Test GET /api/portfolio
  it('should get the portfolio', async () => {
    const res = await request(app).get('/api/portfolio');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('cash');
    expect(res.body).toHaveProperty('stocks');
    expect(res.body).toHaveProperty('funds');
  });

  // Test POST /api/portfolio/cash/deposit
  it('should deposit cash', async () => {
    const res = await request(app)
      .post('/api/portfolio/cash/deposit')
      .send({ amount: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Cash deposited');
  });

  // Test POST /api/portfolio/cash/withdraw
  it('should withdraw cash', async () => {
    const res = await request(app)
      .post('/api/portfolio/cash/withdraw')
      .send({ amount: 50 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Cash withdrawn');
  });

  // Test POST /api/portfolio/stock (buy)
  it('should buy stock', async () => {
    const res = await request(app)
      .post('/api/portfolio/stock')
      .send({ ticker_symbol: 'AAPL', price: 170, number_of_shares: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Stock purchased successfully');
  });

  // Test POST /api/portfolio/stock/sell
  it('should sell stock', async () => {
    const res = await request(app)
      .post('/api/portfolio/stock/sell')
      .send({ ticker_symbol: 'AAPL', price: 175, number_of_shares: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Stock sold successfully');
  });

  // Test DELETE /api/portfolio/stock/:ticker
  it('should delete stock holding', async () => {
    const res = await request(app)
      .delete('/api/portfolio/stock/AAPL');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Stock holding deleted');
  });

  // Test GET /api/portfolio/performance
  it('should get portfolio performance', async () => {
    const res = await request(app).get('/api/portfolio/performance');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('date');
      expect(res.body[0]).toHaveProperty('total_value');
    }
  });

  // Edge case: deposit negative cash
  it('should not deposit negative cash', async () => {
    const res = await request(app)
      .post('/api/portfolio/cash/deposit')
      .send({ amount: -100 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Edge case: withdraw more than balance
  it('should not withdraw more than balance', async () => {
    const res = await request(app)
      .post('/api/portfolio/cash/withdraw')
      .send({ amount: 99999999 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Insufficient funds');
  });

  // Edge case: buy stock with missing fields
  it('should not buy stock with missing fields', async () => {
    const res = await request(app)
      .post('/api/portfolio/stock')
      .send({ ticker_symbol: 'AAPL', price: 170 }); // missing number_of_shares
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Edge case: buy stock with insufficient cash
  it('should not buy stock with insufficient cash', async () => {
    // Try to buy a huge amount
    const res = await request(app)
      .post('/api/portfolio/stock')
      .send({ ticker_symbol: 'AAPL', price: 170, number_of_shares: 999999 });
    // Should fail due to insufficient funds (may be 500 or 400 depending on implementation)
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Edge case: sell more shares than owned
  it('should not sell more shares than owned', async () => {
    // Try to sell a huge amount
    const res = await request(app)
      .post('/api/portfolio/stock/sell')
      .send({ ticker_symbol: 'AAPL', price: 175, number_of_shares: 999999 });
    // Should fail due to insufficient shares (may be 500 or 400 depending on implementation)
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Edge case: delete non-existent stock
  it('should handle deleting non-existent stock gracefully', async () => {
    const res = await request(app)
      .delete('/api/portfolio/stock/FAKESTOCK');
    expect(res.statusCode).toBe(200); // Should still return 200, but no effect
    expect(res.body).toHaveProperty('message');
  });

  // Edge case: withdraw negative cash
  it('should not withdraw negative cash', async () => {
    const res = await request(app)
      .post('/api/portfolio/cash/withdraw')
      .send({ amount: -100 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Edge case: sell stock with missing fields
  it('should not sell stock with missing fields', async () => {
    const res = await request(app)
      .post('/api/portfolio/stock/sell')
      .send({ ticker_symbol: 'AAPL', price: 175 }); // missing number_of_shares
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Stock API (Yahoo Finance)', () => {
  // Test GET /api/stock/:ticker/current
  it('should get the current status of a valid stock', async () => {
    const res = await request(app).get('/api/stock/AAPL/current');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('symbol', 'AAPL');
    expect(res.body).toHaveProperty('regularMarketPrice');
  });

  it('should return 400 if ticker is missing for current status', async () => {
    const res = await request(app).get('/api/stock//current');
    expect(res.statusCode).toBe(404); // Express will treat missing param as 404
  });

  it('should return 500 for an invalid ticker for current status', async () => {
    const res = await request(app).get('/api/stock/FAKESTOCK123/current');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  // Test GET /api/stock/:ticker/history
  it('should get historical data for a valid stock and period', async () => {
    const res = await request(app)
      .get('/api/stock/AAPL/history')
      .query({ period1: '2025-07-01', period2: '2025-07-27' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('date');
      expect(res.body[0]).toHaveProperty('close');
    }
  });

  it('should return 400 if period1 or period2 is missing', async () => {
    const res = await request(app)
      .get('/api/stock/AAPL/history')
      .query({ period1: '2024-01-01' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 500 for an invalid ticker for history', async () => {
    const res = await request(app)
      .get('/api/stock/FAKESTOCK123/history')
      .query({ period1: '2024-01-01', period2: '2024-01-10' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

afterAll(async () => {
  await pool.end();
});
