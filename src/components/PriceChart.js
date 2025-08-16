'use client';

import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Area, Scatter } from 'recharts';

const PriceChart = ({ results, symbol }) => {
  if (!results || !results.equity_curve || results.equity_curve.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
        <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l-4z" clipRule="evenodd"/>
        </svg>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Price Data Available</h3>
        <p className="text-sm">Price chart will be available when historical data is included in the backtest results.</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Use actual price data from backend
  const priceData = results.price_data?.map(point => ({
    date: point.date,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume
  })) || [];

  // If no price data available, fall back to simulated data
  if (priceData.length === 0 && results.equity_curve) {
    const simulatedPriceData = results.equity_curve.map((point, index) => {
      const basePrice = 100;
      const priceMultiplier = point.returns ? (1 + point.returns) : 1;
      const simulatedPrice = basePrice * Math.pow(priceMultiplier, index / 10);
      
      return {
        date: point.date,
        close: simulatedPrice,
        open: simulatedPrice * 0.999,
        high: simulatedPrice * 1.005,
        low: simulatedPrice * 0.995,
        volume: 1000000
      };
    });
    priceData.push(...simulatedPriceData);
  }

  // Prepare trade markers with better date matching
  const tradeMarkers = results.trades?.map(trade => {
    const tradeDate = trade.date;
    
    // Try to find exact match first
    let pricePoint = priceData.find(point => point.date === tradeDate);
    
    // If no exact match, try to find the closest date
    if (!pricePoint && priceData.length > 0) {
      const tradeDateObj = new Date(tradeDate);
      let closestPoint = priceData[0];
      let minDiff = Math.abs(new Date(closestPoint.date) - tradeDateObj);
      
      for (const point of priceData) {
        const diff = Math.abs(new Date(point.date) - tradeDateObj);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = point;
        }
      }
      
      // For shorter timeframes, be more lenient with date matching
      const timeframe = results.timeframe || '1d';
      const isShortTimeframe = ['1m', '5m', '15m', '30m', '1h', '4h'].includes(timeframe);
      const maxDiff = isShortTimeframe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days for short timeframes
      
      if (minDiff <= maxDiff) {
        pricePoint = closestPoint;
      }
    }
    
    // Use the chart date for x-axis positioning, but actual trade price for y-axis
    const chartDate = pricePoint ? pricePoint.date : tradeDate;
    const yPrice = trade.price || (pricePoint ? pricePoint.close : 100);
    
    return {
      date: chartDate, // Use chart date for x-axis positioning
      price: yPrice,   // Use trade price for y-axis positioning
      action: trade.action,
      quantity: trade.quantity,
      value: trade.value,
      pnl: trade.pnl || 0,
      originalDate: tradeDate // Keep original for reference
    };
  }) || [];

  // Enhance price data with trade markers as data points
  const enhancedPriceData = priceData.map(pricePoint => {
    const trade = tradeMarkers.find(t => t.date === pricePoint.date);
    return {
      ...pricePoint,
      buySignal: trade && trade.action === 'BUY' ? trade.price : null,
      sellSignal: trade && trade.action === 'SELL' ? trade.price : null,
      hasSignal: !!trade
    };
  });

  // Debug log to check trade markers in price chart
  console.log('🔍 PRICE CHART DEBUGGING:');
  console.log('Timeframe:', results.timeframe);
  console.log('Price chart trade markers count:', tradeMarkers.length);
  console.log('Enhanced price data points:', enhancedPriceData.length);
  console.log('Enhanced data with signals:', enhancedPriceData.filter(p => p.hasSignal));
  console.log('Raw trades for price chart:', results.trades?.length || 0);
  console.log('First few price trade markers:', tradeMarkers.slice(0, 3));
  console.log('First few enhanced price data points:', enhancedPriceData.slice(0, 3));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const trade = tradeMarkers.find(t => t.date === label);
      
      return (
        <div className="p-4 rounded-lg border max-w-xs" style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {(() => {
              const date = new Date(label);
              // Always show both date and time for better clarity
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) + ' ' + date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: (['1m', '5m'].includes(results.timeframe) ? '2-digit' : undefined),
                hour12: false 
              });
            })()}
          </p>
          <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>
            Open: {formatCurrency(data.open)}
          </p>
          <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>
            High: {formatCurrency(data.high)}
          </p>
          <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>
            Low: {formatCurrency(data.low)}
          </p>
          <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>
            Close: {formatCurrency(data.close)}
          </p>
          {trade && (
            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold" style={{ color: trade.action === 'BUY' ? 'var(--success)' : 'var(--error)' }}>
                {trade.action} Signal
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Quantity: {trade.quantity}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Value: {formatCurrency(trade.value)}
              </p>
              {trade.pnl !== 0 && (
                <p className="text-sm font-medium" style={{ color: trade.pnl > 0 ? 'var(--success)' : 'var(--error)' }}>
                  P&L: {formatCurrency(trade.pnl)}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#10b981' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Entry Points ({tradeMarkers.filter(t => t.action === 'BUY').length})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ background: '#ef4444' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Exit Points ({tradeMarkers.filter(t => t.action === 'SELL').length})</span>
          </div>
        </div>
        {/* Scroll instruction for shorter timeframes */}
        {['1m', '5m', '15m', '30m', '1h', '4h'].includes(results.timeframe) && (
          <div className="text-xs flex items-center" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Scroll horizontally to view all {results.timeframe} data points
          </div>
        )}
      </div>
      
      <div className="h-96 rounded-lg p-4 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
           style={{ 
             background: 'var(--surface-light)',
             scrollBehavior: 'smooth'
           }}>
        <div style={{ 
          width: (() => {
            // Calculate width based on timeframe and data length
            const timeframe = results.timeframe || '1d';
            const dataLength = enhancedPriceData.length;
            
            if (['1m', '5m'].includes(timeframe)) {
              // For very short timeframes, make each data point wider
              return Math.max(800, dataLength * 15) + 'px'; // 15px per data point minimum
            } else if (['15m', '30m'].includes(timeframe)) {
              return Math.max(800, dataLength * 12) + 'px'; // 12px per data point
            } else if (['1h', '4h'].includes(timeframe)) {
              return Math.max(800, dataLength * 10) + 'px'; // 10px per data point
            } else {
              return '100%'; // Default width for daily+
            }
          })(),
          minWidth: '100%',
          height: '100%'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={enhancedPriceData}
            >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              tickFormatter={(value) => {
                const timeframe = results.timeframe || '1d';
                const date = new Date(value);
                
                // Format based on timeframe
                if (['1m', '5m', '15m', '30m'].includes(timeframe)) {
                  // For very short timeframes, show time only
                  return date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  });
                } else if (['1h', '4h'].includes(timeframe)) {
                  // For hourly timeframes, show date and time
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  }) + ' ' + date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  });
                } else {
                  // For daily and longer timeframes, show date only
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }
              }}
              interval={(() => {
                const timeframe = results.timeframe || '1d';
                const dataLength = enhancedPriceData.length;
                
                // For short timeframes, show every data point to make it scrollable
                if (['1m', '5m'].includes(timeframe)) {
                  return 0; // Show every tick for minute-level data
                } else if (['15m', '30m'].includes(timeframe)) {
                  return Math.max(1, Math.floor(dataLength / 20)); // Show ~20 ticks
                } else if (['1h', '4h'].includes(timeframe)) {
                  return Math.max(1, Math.floor(dataLength / 12)); // Show ~12 ticks
                } else {
                  return 'preserveStartEnd'; // Default for daily+
                }
              })()}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Price Area Chart */}
            <Area
              type="monotone"
              dataKey="close"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#priceGradient)"
              name="Close Price"
            />
            
            {/* Buy Signal Markers */}
            <Scatter
              dataKey="buySignal"
              fill="#10b981"
              r={(() => {
                const timeframe = results.timeframe || '1d';
                const isShortTimeframe = ['1m', '5m', '15m', '30m', '1h'].includes(timeframe);
                return isShortTimeframe ? 3 : 5;
              })()}
              name="Buy Signal"
            />
            
            {/* Sell Signal Markers */}
            <Scatter
              dataKey="sellSignal"
              fill="#ef4444"
              r={(() => {
                const timeframe = results.timeframe || '1d';
                const isShortTimeframe = ['1m', '5m', '15m', '30m', '1h'].includes(timeframe);
                return isShortTimeframe ? 3 : 5;
              })()}
              name="Sell Signal"
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>
      
      {/* Trade Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card" style={{ borderColor: 'var(--success)' }}>
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--success)' }}></div>
            <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
              Buy Signals: {tradeMarkers.filter(t => t.action === 'BUY').length}
            </span>
          </div>
        </div>
        
        <div className="metric-card" style={{ borderColor: 'var(--error)' }}>
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--error)' }}></div>
            <span className="text-sm font-medium" style={{ color: 'var(--error)' }}>
              Sell : {tradeMarkers.filter(t => t.action === 'SELL').length}
            </span>
          </div>
        </div>
        
        <div className="metric-card" style={{ borderColor: 'var(--primary)' }}>
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--primary)' }}></div>
            <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
              Total Trades: {tradeMarkers.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Detailed Trade List */}
      {tradeMarkers.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recent Trade Signals</h4>
          <div className="max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {tradeMarkers.slice(-5).reverse().map((trade, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded-lg text-sm border`} style={{
                  background: trade.action === 'BUY' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  borderColor: trade.action === 'BUY' ? 'var(--success)' : 'var(--error)'
                }}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2`} style={{
                      background: trade.action === 'BUY' ? 'var(--success)' : 'var(--error)'
                    }}></div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {trade.action} @ {formatCurrency(trade.price)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {new Date(trade.date).toLocaleDateString()}
                    </div>
                    {trade.pnl !== 0 && (
                      <div className="font-medium" style={{ color: trade.pnl > 0 ? 'var(--success)' : 'var(--error)' }}>
                        {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceChart;
