'use client';

import BacktestingDashboard from '../components/BacktestingDashboard';
import { SessionProvider } from 'next-auth/react';


export default function Home() {
  return (
    <SessionProvider>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <BacktestingDashboard />
      </div>
    </SessionProvider>
  );
}
