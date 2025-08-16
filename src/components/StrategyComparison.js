'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StrategyComparison = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
        <h3 className="text-lg font-semibold mb-4">Strategy Comparison</h3>
        <p className="text-gray-500 text-center py-8">No comparison data available</p>
      </div>
    );
  }

  // Transform results for comparison chart
  const comparisonData = results.map((result, index) => ({
    strategy: result.strategy_name || `Strategy ${index + 1}`,
    'Total Return (%)': result.total_return_pct || 0,
    'Sharpe Ratio': result.sharpe_ratio || 0,
    'Max Drawdown (%)': -(result.max_drawdown || 0), // Negative for better visualization
    'Win Rate (%)': result.win_rate || 0,
    'Profit Factor': result.profit_factor || 0
  }));

  // Create separate datasets for different metrics
  const returnData = comparisonData.map(item => ({
    strategy: item.strategy,
    value: item['Total Return (%)']
  }));

  const sharpeData = comparisonData.map(item => ({
    strategy: item.strategy,
    value: item['Sharpe Ratio']
  }));

  const drawdownData = comparisonData.map(item => ({
    strategy: item.strategy,
    value: Math.abs(item['Max Drawdown (%)']) // Show as positive for chart
  }));

  const winRateData = comparisonData.map(item => ({
    strategy: item.strategy,
    value: item['Win Rate (%)']
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border-2 border-blue-500 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600">
            {`${payload[0].value.toFixed(2)}${payload[0].dataKey.includes('%') ? '%' : ''}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg">⚖️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Strategy Performance Comparison</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Returns Comparison */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <h4 className="text-md font-medium text-blue-800 mb-3">📈 Total Returns</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={returnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="strategy" 
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sharpe Ratio Comparison */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <h4 className="text-md font-medium text-green-800 mb-3">📊 Sharpe Ratio</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sharpeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis 
                dataKey="strategy" 
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Max Drawdown Comparison */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <h4 className="text-md font-medium text-red-800 mb-3">📉 Max Drawdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={drawdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" />
              <XAxis 
                dataKey="strategy" 
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickFormatter={(value) => `-${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`-${value.toFixed(2)}%`, 'Max Drawdown']}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #EF4444',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win Rate Comparison */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <h4 className="text-md font-medium text-purple-800 mb-3">🎯 Win Rate</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={winRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
              <XAxis 
                dataKey="strategy" 
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strategy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Return
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sharpe Ratio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Drawdown
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit Factor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisonData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.strategy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${row['Total Return (%)'] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row['Total Return (%)'].toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${row['Sharpe Ratio'] >= 1 ? 'text-green-600' : row['Sharpe Ratio'] >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {row['Sharpe Ratio'].toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="font-medium text-red-600">
                    {row['Max Drawdown (%)'].toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${row['Win Rate (%)'] >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {row['Win Rate (%)'].toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${row['Profit Factor'] >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {row['Profit Factor'].toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategyComparison;
