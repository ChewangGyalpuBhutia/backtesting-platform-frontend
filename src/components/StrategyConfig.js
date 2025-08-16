'use client';

import { useState, useEffect } from 'react';
import { backtestAPI } from '../services/api';

const StrategyConfig = ({ onConfigChange, strategies, symbols }) => {
  const [config, setConfig] = useState({
    symbol: 'AAPL',
    strategy: 'moving_average_crossover',
    start_date: '2023-01-01',
    end_date: '2024-12-31',
    initial_capital: 10000,
    timeframe: '1d',
    parameters: {}
  });

  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [timeframes, setTimeframes] = useState([]);

  // Load timeframes on component mount
  useEffect(() => {
    const loadTimeframes = async () => {
      try {
        const timeframesData = await backtestAPI.getTimeframes();
        setTimeframes(timeframesData.timeframes);
      } catch (error) {
        console.error('Failed to load timeframes:', error);
      }
    };
    
    loadTimeframes();
  }, []);

  useEffect(() => {
    if (strategies && strategies.length > 0) {
      const strategy = strategies.find(s => s.id === config.strategy);
      setSelectedStrategy(strategy);
      
      // Set default parameters
      if (strategy && strategy.parameters) {
        const defaultParams = {};
        Object.keys(strategy.parameters).forEach(key => {
          defaultParams[key] = strategy.parameters[key].default;
        });
        setConfig(prev => ({ ...prev, parameters: defaultParams }));
      }
    }
  }, [strategies, config.strategy]);

  useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);

  // Get date range limits for timeframe
  const getTimeframeLimits = (timeframeId) => {
    const today = new Date();
    const limits = {
      '1m': { maxDays: 7, defaultDays: 7 },
      '5m': { maxDays: 30, defaultDays: 7 },
      '15m': { maxDays: 90, defaultDays: 30 },
      '30m': { maxDays: 180, defaultDays: 90 },
      '1h': { maxDays: 365, defaultDays: 180 },
      '4h': { maxDays: 725, defaultDays: 365 },
      '1d': { maxDays: 725, defaultDays: 365 },
      '1wk': { maxDays: 1095, defaultDays: 1095 },
      '1mo': { maxDays: 1095, defaultDays: 1095 }
    };
    
    const limit = limits[timeframeId] || limits['1d'];
    
    // Calculate min date (earliest allowed start date)
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - limit.maxDays);
    
    // Calculate default start date
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - limit.defaultDays);
    
    return {
      minDate: minDate.toISOString().split('T')[0],
      maxDate: today.toISOString().split('T')[0],
      defaultStartDate: defaultStartDate.toISOString().split('T')[0],
      maxDays: limit.maxDays
    };
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      
      // Auto-adjust date range based on timeframe selection
      if (field === 'timeframe') {
        const limits = getTimeframeLimits(value);
        newConfig.start_date = limits.defaultStartDate;
        newConfig.end_date = limits.maxDate;
      }
      
      // Validate date range when dates change
      if (field === 'start_date' || field === 'end_date') {
        const limits = getTimeframeLimits(newConfig.timeframe);
        
        if (field === 'start_date') {
          // Ensure start date is not earlier than allowed
          if (value < limits.minDate) {
            newConfig.start_date = limits.minDate;
          }
          // Ensure date range doesn't exceed max days
          const startDate = new Date(newConfig.start_date);
          const endDate = new Date(newConfig.end_date);
          const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          if (daysDiff > limits.maxDays) {
            const adjustedEndDate = new Date(startDate);
            adjustedEndDate.setDate(startDate.getDate() + limits.maxDays);
            newConfig.end_date = adjustedEndDate.toISOString().split('T')[0];
          }
        }
        
        if (field === 'end_date') {
          // Ensure end date is not later than today
          if (value > limits.maxDate) {
            newConfig.end_date = limits.maxDate;
          }
          // Ensure date range doesn't exceed max days
          const startDate = new Date(newConfig.start_date);
          const endDate = new Date(newConfig.end_date);
          const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          if (daysDiff > limits.maxDays) {
            const adjustedStartDate = new Date(endDate);
            adjustedStartDate.setDate(endDate.getDate() - limits.maxDays);
            newConfig.start_date = adjustedStartDate.toISOString().split('T')[0];
          }
        }
      }
      
      return newConfig;
    });
  };

  const handleParameterChange = (param, value) => {
    setConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [param]: value
      }
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: 'var(--primary)' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path d="M15 8a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h2 className="card-title">Configuration</h2>
            <p className="card-subtitle">Setup your backtest parameters</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Symbol Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Symbol
          </label>
          <select
            value={config.symbol}
            onChange={(e) => handleConfigChange('symbol', e.target.value)}
            className="form-select"
          >
            {symbols?.map(symbol => (
              <option key={symbol.symbol} value={symbol.symbol}>
                {symbol.symbol} - {symbol.name}
              </option>
            ))}
          </select>
        </div>

        {/* Strategy Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Strategy
          </label>
          <select
            value={config.strategy}
            onChange={(e) => handleConfigChange('strategy', e.target.value)}
            className="form-select"
          >
            {strategies?.map(strategy => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Timeframe
          </label>
          <select
            value={config.timeframe}
            onChange={(e) => handleConfigChange('timeframe', e.target.value)}
            className="form-select"
          >
            {timeframes?.map(timeframe => (
              <option key={timeframe.id} value={timeframe.id}>
                {timeframe.name} - {timeframe.description}
              </option>
            ))}
          </select>
          {(() => {
            const selectedTimeframe = timeframes?.find(t => t.id === config.timeframe);
            const limits = getTimeframeLimits(config.timeframe);
            return (
              <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {selectedTimeframe?.recommended_period && (
                  <p>Recommended: {selectedTimeframe.recommended_period}</p>
                )}
                <p>Maximum range: {limits.maxDays} days</p>
              </div>
            );
          })()}
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Date Range
          </label>
          {(() => {
            const limits = getTimeframeLimits(config.timeframe);
            const startDate = new Date(config.start_date);
            const endDate = new Date(config.end_date);
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            return (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={config.start_date}
                      min={limits.minDate}
                      max={limits.maxDate}
                      onChange={(e) => handleConfigChange('start_date', e.target.value)}
                      className="form-input"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Start Date</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={config.end_date}
                      min={limits.minDate}
                      max={limits.maxDate}
                      onChange={(e) => handleConfigChange('end_date', e.target.value)}
                      className="form-input"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>End Date</p>
                  </div>
                </div>
                <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--surface-light)' }}>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Selected: {daysDiff} days
                    </span>
                    <span style={{ color: daysDiff > limits.maxDays ? 'var(--error)' : 'var(--text-muted)' }}>
                      Max: {limits.maxDays} days for {config.timeframe}
                    </span>
                  </div>
                  {daysDiff > limits.maxDays && (
                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                      ⚠️ Date range exceeds maximum allowed for this timeframe
                    </p>
                  )}
                </div>
              </>
            );
          })()}
        </div>

        {/* Initial Capital */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Initial Capital
          </label>
          <input
            type="number"
            value={config.initial_capital}
            onChange={(e) => handleConfigChange('initial_capital', parseFloat(e.target.value))}
            className="form-input"
            min="1000"
            step="1000"
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Minimum: $1,000</p>
        </div>
      </div>

      {/* Strategy Parameters */}
      {selectedStrategy && selectedStrategy.parameters && (
        <div className="mt-8">
          <div className="section-divider"></div>
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center mr-3" style={{ background: 'var(--secondary)' }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Strategy Parameters</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fine-tune your strategy settings</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--surface-light)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedStrategy.description}</p>
          </div>
          
          <div className="space-y-4">
            {Object.entries(selectedStrategy.parameters).map(([param, details]) => (
              <div key={param}>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {param.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type={details.type === 'float' ? 'number' : details.type}
                  value={config.parameters[param] || details.default}
                  onChange={(e) => {
                    const value = details.type === 'float' ? parseFloat(e.target.value) : parseInt(e.target.value);
                    handleParameterChange(param, value);
                  }}
                  className="form-input"
                  min={details.min}
                  max={details.max}
                  step={details.type === 'float' ? '0.1' : '1'}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Range: {details.min} - {details.max}</span>
                  <span>Default: {details.default}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyConfig;
