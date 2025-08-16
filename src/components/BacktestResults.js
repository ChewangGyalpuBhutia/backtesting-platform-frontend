'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Scatter, ScatterChart, ReferenceDot, ComposedChart } from 'recharts';
import MonthlyReturnsHeatmap from './MonthlyReturnsHeatmap';
import PriceChart from './PriceChart';

const BacktestResults = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="loading-spinner mb-4" style={{ width: '48px', height: '48px' }}></div>
          <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Running backtest...</span>
          <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Analyzing historical data and calculating metrics</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="card text-center" style={{ background: 'linear-gradient(135deg, var(--surface-light) 0%, var(--surface) 100%)' }}>
        <div className="py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)', opacity: '0.1' }}>
            <svg className="w-10 h-10" style={{ color: 'var(--primary)' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Ready to analyze your strategy?</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure your parameters and click &quot;Run Backtest&quot; to see results</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Prepare chart data
  const equityData = results.equity_curve?.map(point => ({
    date: point.date,
    value: point.value,
    returns: point.returns * 100
  })) || [];

  // Prepare trade markers for the chart with better date matching
  const tradeMarkers = results.trades?.map(trade => {
    const tradeDate = trade.date;
    
    // Try to find exact match first
    let equityPoint = equityData.find(point => point.date === tradeDate);
    
    // If no exact match, try to find the closest date
    if (!equityPoint && equityData.length > 0) {
      const tradeDateObj = new Date(tradeDate);
      let closestPoint = equityData[0];
      let minDiff = Math.abs(new Date(closestPoint.date) - tradeDateObj);
      
      for (const point of equityData) {
        const diff = Math.abs(new Date(point.date) - tradeDateObj);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = point;
        }
      }
      
      // Only use if within reasonable time range (1 day)
      if (minDiff <= 24 * 60 * 60 * 1000) {
        equityPoint = closestPoint;
      }
    }
    
    // If still no match, use interpolation or fallback
    if (!equityPoint && equityData.length > 0) {
      const tradeDateObj = new Date(tradeDate);
      const beforePoints = equityData.filter(p => new Date(p.date) <= tradeDateObj);
      const afterPoints = equityData.filter(p => new Date(p.date) >= tradeDateObj);
      
      if (beforePoints.length > 0 && afterPoints.length > 0) {
        // Simple interpolation
        const before = beforePoints[beforePoints.length - 1];
        const after = afterPoints[0];
        const ratio = (tradeDateObj - new Date(before.date)) / (new Date(after.date) - new Date(before.date));
        equityPoint = {
          date: tradeDate,
          value: before.value + (after.value - before.value) * ratio
        };
      } else if (beforePoints.length > 0) {
        equityPoint = beforePoints[beforePoints.length - 1];
      } else if (afterPoints.length > 0) {
        equityPoint = afterPoints[0];
      } else {
        // Fallback to estimated value based on trade value
        equityPoint = { date: tradeDate, value: trade.value * trade.quantity };
      }
    }
    
    return {
      date: tradeDate,
      value: equityPoint ? equityPoint.value : (trade.value * trade.quantity),
      action: trade.action,
      price: trade.price,
      quantity: trade.quantity,
      pnl: trade.pnl || 0
    };
  }) || [];

  // Debug log to check trade markers
  console.log('🔍 DEBUGGING TRADE MARKERS:');
  console.log('Timeframe:', results.timeframe);
  console.log('Trade markers count:', tradeMarkers.length);
  console.log('Equity data points:', equityData.length);
  console.log('Raw trades:', results.trades?.length || 0);
  console.log('First few trade markers:', tradeMarkers.slice(0, 3));
  console.log('First few equity points:', equityData.slice(0, 3));
  
  // Check if dates are compatible
  if (tradeMarkers.length > 0 && equityData.length > 0) {
    console.log('Sample trade date format:', tradeMarkers[0].date, typeof tradeMarkers[0].date);
    console.log('Sample equity date format:', equityData[0].date, typeof equityData[0].date);
  }

  return (
    <div className="space-y-8">
      {/* Price Chart with Entry/Exit Points */}
      <div className="chart-container">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: 'var(--warning)' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Price Action & Trade Signals</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Entry and exit points on price chart
              {(() => {
                const timeframe = results.timeframe || '1d';
                const isShortTimeframe = ['1m', '5m', '15m', '30m', '1h', '4h'].includes(timeframe);
                return isShortTimeframe ? ' • Scroll horizontally to view all data points' : '';
              })()}
            </p>
          </div>
        </div>
        <PriceChart results={results} />
      </div>

      {/* Performance Summary */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: 'var(--success)' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <div>
              <h2 className="card-title">Performance Summary</h2>
              <p className="card-subtitle">Key metrics and strategy performance</p>
            </div>
          </div>
        </div>
        
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="metric-card" style={{ borderColor: 'var(--primary)' }}>
            <div className="metric-value" style={{ color: results.total_return_pct >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {formatPercent(results.total_return_pct)}
            </div>
            <div className="metric-label">Total Return</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(results.total_return)}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {results.sharpe_ratio?.toFixed(2) || 'N/A'}
            </div>
            <div className="metric-label">Sharpe Ratio</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Risk-adjusted return
            </div>
          </div>
          
          <div className="metric-card" style={{ borderColor: 'var(--error)' }}>
            <div className="metric-value" style={{ color: 'var(--error)' }}>
              -{results.max_drawdown?.toFixed(2)}%
            </div>
            <div className="metric-label">Max Drawdown</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Worst losing period
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--primary)' }}>
              {results.win_rate?.toFixed(1)}%
            </div>
            <div className="metric-label">Win Rate</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Profitable trades
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="text-center p-3 rounded-lg border" style={{ background: 'var(--surface-light)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Sortino Ratio</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {results.sortino_ratio?.toFixed(2) || 'N/A'}
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg border" style={{ background: 'var(--surface-light)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Calmar Ratio</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {results.calmar_ratio?.toFixed(2) || 'N/A'}
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg border" style={{ background: 'var(--surface-light)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Profit Factor</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {results.profit_factor?.toFixed(2) || 'N/A'}
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg border" style={{ background: 'var(--surface-light)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>VaR (5%)</p>
            <p className="text-lg font-bold" style={{ color: 'var(--error)' }}>
              {results.var_5 ? `${(results.var_5 * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg border" style={{ background: 'var(--surface-light)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>CVaR (5%)</p>
            <p className="text-lg font-bold" style={{ color: 'var(--error)' }}>
              {results.cvar_5 ? `${(results.cvar_5 * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Capital Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg" style={{ background: 'var(--surface-light)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Initial Capital</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(results.initial_capital)}</p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ background: 'var(--surface-light)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Final Capital</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(results.final_capital)}</p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ background: 'var(--surface-light)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Trades</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{results.total_trades}</p>
          </div>
        </div>
      </div>

      

      {/* Monthly Returns Heatmap */}
      {results.monthly_returns && results.monthly_returns.length > 0 && (
        <MonthlyReturnsHeatmap monthlyReturns={results.monthly_returns} />
      )}

      {/* Monthly Returns Bar Chart */}
      {results.monthly_returns && results.monthly_returns.length > 0 && (
        <div className="chart-container">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: 'var(--success)' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 11a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Monthly Returns</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Performance breakdown by month</p>
            </div>
          </div>
          <div className="h-64 rounded-lg p-4" style={{ background: 'var(--surface-light)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.monthly_returns}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                  tickFormatter={(value) => {
                    const date = new Date(value + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                  tickFormatter={(value) => `${value}%`} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                  labelStyle={{
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                  itemStyle={{
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}
                  formatter={(value) => [`${value.toFixed(2)}%`, 'Return']} 
                  labelFormatter={(value) => {
                    const date = new Date(value + '-01');
                    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  }}
                />
                <Bar 
                  dataKey="return" 
                  fill="var(--success)"
                  name="Monthly Return (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trade History */}
      {results.trades && results.trades.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: 'var(--secondary)' }}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="card-title">Trade History</h3>
                <p className="card-subtitle">Recent trading activity (last 10 trades)</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead style={{ background: 'var(--surface-light)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {results.trades.slice(-10).reverse().map((trade, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                      {new Date(trade.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.action === 'BUY' 
                          ? 'status-indicator status-success' 
                          : 'status-indicator status-error'
                      }`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(trade.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                      {trade.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(trade.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {trade.pnl !== undefined ? (
                        <span style={{ color: trade.pnl >= 0 ? 'var(--success)' : 'var(--error)' }}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestResults;
