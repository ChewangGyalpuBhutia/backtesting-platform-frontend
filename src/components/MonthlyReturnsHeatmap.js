'use client';

import { ResponsiveContainer, Cell, Tooltip } from 'recharts';

const MonthlyReturnsHeatmap = ({ monthlyReturns }) => {
  if (!monthlyReturns || monthlyReturns.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Returns Heatmap</h3>
          <p className="card-subtitle">Visual breakdown of monthly performance</p>
        </div>
        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No monthly returns data available</p>
      </div>
    );
  }

  // Transform data for heatmap visualization
  const heatmapData = monthlyReturns.map((item, index) => ({
    month: item.month,
    return: item.return,
    color: item.return > 0 ? 'var(--success)' : 'var(--error)',
    intensity: Math.min(Math.abs(item.return) / 10, 1) // Normalize intensity
  }));

  // Group by year for better visualization
  const groupedByYear = {};
  heatmapData.forEach(item => {
    const year = item.month.split('-')[0];
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(item);
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: 'var(--secondary)' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 11a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/>
            </svg>
          </div>
          <div>
            <h3 className="card-title">Monthly Returns Heatmap</h3>
            <p className="card-subtitle">Visual breakdown of monthly performance</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(groupedByYear).map(([year, yearData]) => (
          <div key={year} className="border rounded-lg p-4" style={{ borderColor: 'var(--border)' }}>
            <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{year}</h4>
            <div className="grid grid-cols-12 gap-1">
              {months.map((monthName, monthIndex) => {
                const monthData = yearData.find(item => {
                  const itemMonth = parseInt(item.month.split('-')[1]) - 1;
                  return itemMonth === monthIndex;
                });
                
                const hasData = monthData !== undefined;
                const returnValue = hasData ? monthData.return : 0;
                const isPositive = returnValue > 0;
                
                return (
                  <div
                    key={`${year}-${monthIndex}`}
                    className={`h-8 flex items-center justify-center text-xs font-medium rounded transition-all hover:scale-105 ${
                      hasData 
                        ? isPositive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    style={{
                      opacity: hasData ? 0.6 + (Math.abs(returnValue) / 20) * 0.4 : 0.3
                    }}
                    title={hasData ? `${monthName} ${year}: ${returnValue.toFixed(2)}%` : `${monthName} ${year}: No data`}
                  >
                    {hasData ? `${returnValue.toFixed(1)}%` : monthName.slice(0, 1)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-gray-600">Positive Returns</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-gray-600">Negative Returns</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
          <span className="text-gray-600">No Data</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReturnsHeatmap;
