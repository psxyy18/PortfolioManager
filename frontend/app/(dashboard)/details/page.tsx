'use client';
import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import TradingPlatform from '../../components/TradingPlatform';

export default function DetailsPage() {
  return (
    <PageContainer title="专业股票交易平台">
      <TradingPlatform />
    </PageContainer>
  );
}
