'use client';

import { useState, useEffect } from 'react';
import { backtestAPI } from '../services/api';
import StrategyConfig from './StrategyConfig';
import BacktestResults from './BacktestResults';
import FundamentalAnalysis from './FundamentalAnalysis';
import StockNews from './StockNews';
import { OAuthButton } from './OAuthButton';

const BacktestingDashboard = () => {
  const [strategies, setStrategies] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [timeframes, setTimeframes] = useState([]);
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Check backend connection
        const isHealthy = await backtestAPI.checkHealth();
        setBackendConnected(isHealthy);

        if (isHealthy) {
          // Load strategies, symbols, and timeframes
          const [strategiesData, symbolsData, timeframesData] = await Promise.all([
            backtestAPI.getStrategies(),
            backtestAPI.getSymbols(),
            backtestAPI.getTimeframes()
          ]);

          setStrategies(strategiesData.strategies);
          setSymbols(symbolsData.symbols);
          setTimeframes(timeframesData.timeframes);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setError('Failed to connect to backend. Please ensure the FastAPI server is running on port 8000.');
      }
    };

    loadInitialData();
  }, []);

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const runBacktest = async () => {
    if (!config) {
      setError('Please configure your backtest parameters');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const result = await backtestAPI.runBacktest(config);
      setResults(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  // Loader while connecting to backend
  if (backendConnected === false && error === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="card max-w-md mx-auto text-center">
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="loading-spinner mb-4" style={{ width: '48px', height: '48px', border: '6px solid var(--primary)', borderTop: '6px solid var(--surface-light)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            <h2 className="card-title mb-2">Connecting to Backend...</h2>
            <p className="card-subtitle mb-4">Please wait while we connect to the FastAPI backend server.</p>
          </div>
        </div>
      </div>
    );
  }
  // Backend connection failed
  if (!backendConnected && error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="card max-w-md mx-auto text-center">
          <div className="text-red-500 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="card-title mb-4">Backend Connection Failed</h2>
          <p className="card-subtitle mb-6">
            Cannot connect to the FastAPI backend server.
          </p>
          <div style={{ background: 'var(--surface-light)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <p className="font-medium mb-2 text-sm">To start the backend:</p>
            <code className="block text-xs p-3 rounded" style={{ background: '#1a1a1a', color: '#10b981' }}>
              cd backend<br/>
              pip install -r requirements.txt<br/>
              uvicorn main:app --reload
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Professional Header */}
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Logo and Title */}
              <div className="flex flex-col items-center justify-center space-y-2 mb-4 lg:mb-0 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center lg:justify-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg mb-2 lg:mb-0" style={{ background: 'var(--primary)' }}>
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Backtesting Platform
                  </h1>
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                    Professional Trading Strategy Analysis
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex flex-col items-center justify-center space-y-3 p-3 rounded-xl shadow-md bg-[var(--surface-light)] lg:flex-row lg:space-y-0 lg:space-x-4 lg:p-0 lg:rounded-none lg:shadow-none lg:bg-transparent">
                {/* Connection Status */}
                <div className="status-indicator status-success flex items-center w-full lg:w-auto justify-center">
                  <div className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ background: 'var(--success)' }}></div>
                  <span className="text-sm">Backend Connected</span>
                </div>
                {/* OAuth Button */}
                <div className="w-full lg:w-auto">
                  <OAuthButton />
                </div>
                {/* Action Buttons */}
                <button
                  onClick={runBacktest}
                  disabled={loading || !config}
                  className={loading || !config ? 'btn-primary opacity-50 cursor-not-allowed flex items-center w-full lg:w-auto justify-center' : 'btn-primary flex items-center w-full lg:w-auto justify-center'}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      Running Backtest...
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                      Run Backtest
                    </>
                  )}
                </button>
                {results && (
                  <button
                    onClick={clearResults}
                    className="btn-secondary flex items-center w-full lg:w-auto justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Clear Results
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border" style={{ 
            background: 'rgba(239, 68, 68, 0.05)', 
            borderColor: 'var(--error)', 
            borderLeftWidth: '4px'
          }}>
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5" style={{ color: 'var(--error)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--error)' }}>Error</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <StrategyConfig
              onConfigChange={handleConfigChange}
              strategies={strategies}
              symbols={symbols}
              timeframes={timeframes}
              config={config}
              setConfig={setConfig}
              loading={loading}
            />
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <BacktestResults results={results} loading={loading} />
            {config?.symbol && <FundamentalAnalysis symbol={config.symbol} />}
            {config?.symbol && <StockNews symbol={config.symbol} />}
          </div>
        </div>

        {/* Fundamental Analysis Section */}
        
      </main>
    </div>
  );
};

export default BacktestingDashboard;
