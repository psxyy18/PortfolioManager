import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker_symbol, price, number_of_shares } = body;

    if (!ticker_symbol || !price || !number_of_shares) {
      return NextResponse.json(
        { error: 'ticker_symbol, price, and number_of_shares are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/portfolio/stock/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker_symbol,
        price,
        number_of_shares
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error selling stock:', error);
    return NextResponse.json(
      { error: 'Failed to sell stock' },
      { status: 500 }
    );
  }
} 