import React, { useEffect, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_NEXTAUTH_URL;
const FundamentalAnalysis = ({ symbol }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/fundamentals?symbol=${symbol}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch fundamentals');
        setLoading(false);
      });
  }, [symbol]);

  if (!symbol) return null;
  if (loading) return <div className="card">Loading fundamentals...</div>;
  if (error) return <div className="card text-error">{error}</div>;
  if (!data) return null;

  // Use backend-calculated pros and cons
  const pros = data.pros || [];
  const cons = data.cons || [];

  return (
    <div className="card my-8 p-8 rounded-xl border border-gray-200 bg-white shadow-sm">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01"/></svg>
        Fundamental Analysis <span className="font-normal text-gray-500">({data.longName || symbol})</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Sector</span>
          <span className="text-gray-900">{data.sector || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Industry</span>
          <span className="text-gray-900">{data.industry || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Market Cap</span>
          <span className="text-gray-900">{data.marketCap ? data.marketCap.toLocaleString() : '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">P/E (Trailing)</span>
          <span className="text-gray-900">{data.trailingPE || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">P/E (Forward)</span>
          <span className="text-gray-900">{data.forwardPE || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Dividend Yield</span>
          <span className="text-gray-900">{data.dividendYield || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Earnings Growth</span>
          <span className="text-gray-900">{data.earningsGrowth || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Revenue Growth</span>
          <span className="text-gray-900">{data.revenueGrowth || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Profit Margins</span>
          <span className="text-gray-900">{data.profitMargins || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">ROE</span>
          <span className="text-gray-900">{data.returnOnEquity || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">ROA</span>
          <span className="text-gray-900">{data.returnOnAssets || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Debt/Equity</span>
          <span className="text-gray-900">{data.debtToEquity || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Current Ratio</span>
          <span className="text-gray-900">{data.currentRatio || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Quick Ratio</span>
          <span className="text-gray-900">{data.quickRatio || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Beta</span>
          <span className="text-gray-900">{data.beta || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Website</span>
          <span className="text-gray-900">{data.website ? <a href={data.website} target="_blank" rel="noopener noreferrer" className="underline">{data.website}</a> : '-'}</span>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            Pros
          </h4>
          {pros.length === 0 ? (
            <div className="text-gray-600">No major fundamental strengths detected.</div>
          ) : (
            <ul className="list-disc ml-6 text-gray-700">
              {pros.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01"/></svg>
            Cons
          </h4>
          {cons.length === 0 ? (
            <div className="text-gray-600">No major fundamental drawbacks detected.</div>
          ) : (
            <ul className="list-disc ml-6 text-gray-700">
              {cons.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundamentalAnalysis;
