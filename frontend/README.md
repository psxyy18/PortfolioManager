# Stock Portfolio Management Panel

This is a [Next.js](https://nextjs.org/) project built with [Toolpad Core](https://github.com/mui/toolpad) for managing stock portfolios.

## Features

- **Dashboard**: Portfolio overview with key metrics, charts, and market analysis
- **Detail**: Comprehensive stock holdings table with real-time performance data
- **Authentication**: Secure login system with NextAuth.js
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup

Run `npx auth secret` to generate a secret and replace the value in the .env.local file with it.

Add the CLIENT_ID and CLIENT_SECRET from your OAuth provider to the .env.local file.

## Getting Started

First, run the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Framework**: Next.js 15 + React 19
- **UI Library**: Material-UI (MUI) v7
- **Authentication**: NextAuth.js v5
- **Core**: Toolpad Core v0.16.0
- **Charts**: MUI X Charts, Data Grid
- **Styling**: Emotion + MUI Theme System

and follow the instructions in the terminal.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
