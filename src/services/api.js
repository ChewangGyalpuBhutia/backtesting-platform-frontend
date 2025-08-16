const API_BASE_URL = process.env.NEXT_PUBLIC_NEXTAUTH_URL;

class BacktestAPI {
  async getStrategies() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/strategies`);
      if (!response.ok) {
        throw new Error('Failed to fetch strategies');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching strategies:', error);
      throw error;
    }
  }

  async getSymbols() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/symbols`);
      if (!response.ok) {
        throw new Error('Failed to fetch symbols');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching symbols:', error);
      throw error;
    }
  }

  async getTimeframes() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timeframes`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeframes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching timeframes:', error);
      throw error;
    }
  }

  async runBacktest(backtestRequest) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backtestRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backtest failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error running backtest:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  async optimizeStrategy(optimizationRequest) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optimizationRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Optimization failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error running optimization:', error);
      throw error;
    }
  }

  async runMultipleBacktests(requests) {
    try {
      const results = await Promise.all(
        requests.map(request => this.runBacktest(request))
      );
      return results;
    } catch (error) {
      console.error('Error running multiple backtests:', error);
      throw error;
    }
  }
}

export const backtestAPI = new BacktestAPI();
