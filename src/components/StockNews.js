import React, { useEffect, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_NEXTAUTH_URL;

const StockNews = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/news?symbol=${symbol}`)
      .then(res => res.json())
      .then(json => {
        console.log(json)
        // Ensure news is always an array
        if (Array.isArray(json)) {
          setNews(json);
        } else if (json && Array.isArray(json.news)) {
          setNews(json.news);
        } else {
          setNews([]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch news');
        setLoading(false);
      });
  }, [symbol]);

  if (!symbol) return null;
  if (loading) return <div className="card">Loading news...</div>;
  if (error) return <div className="card text-error">{error}</div>;
  if (!news || news.length === 0) return <div className="card">No recent news found.</div>;

  return (
    <div className="card my-8 p-8 rounded-xl border border-gray-200 bg-white shadow-sm">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h2l2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
        Latest News
      </h3>
      <ul className="space-y-6">
        {news?.map((item, idx) => (
          <li key={idx} className="border-b pb-4 last:border-b-0">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline text-lg">
              {item.title}
            </a>
            <div className="text-sm text-gray-500 mt-1">
              {item.publisher}
            </div>
            {item.summary && <div className="mt-2 text-gray-700 text-sm">{item.summary}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockNews;
