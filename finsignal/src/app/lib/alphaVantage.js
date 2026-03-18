const AV_BASE = "https://www.alphavantage.co/query";
const KEY = process.env.NEXT_PUBLIC_AV_KEY;

// Get daily price/volume history for a ticker (last 100 days)
export async function getDailyHistory(symbol) {
  const url = '${AV_BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${KEY}';
  const res = await fetch(url);
  const data = await res.json();
  const series = data["Time Series (Daily)"];
  if (!series) return [];
  return Object.entries(series).map(([date, vals]) => ({
    date,
    open: parseFloat(vals["1. open"]),
    high: parseFloat(vals["2. high"]),
    low: parseFloat(vals["3. low"]),
    close: parseFloat(vals["4. close"]),
    volume: parseInt(vals["5. volume"]),
  })).reverse(); // oldest first
}

// Get a quick quote for a ticker
export async function getQuote(symbol) {
  const url = '${AV_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${KEY}';
  const res = await fetch(url);
  const data = await res.json();
  return data["Global Quote"];
}

// Fetch news + pre-scored sentiment for a ticker
export async function getNewsSentiment(symbol) {
  const url = `${AV_BASE}?function=NEWS_SENTIMENT&tickers=${symbol}&limit=20&apikey=${KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const articles = data.feed || [];

  return articles.map(article => ({
    title: article.title,
    url: article.url,
    source: article.source,
    publishedAt: article.time_published,
    sentimentScore: parseFloat(article.overall_sentiment_score),
    sentimentLabel: article.overall_sentiment_label,
    relevanceScore: article.ticker_sentiment?.find(
      t => t.ticker === symbol
    )?.relevance_score || 0,
  }));
}

// Summarize sentiment across recent articles
export function summarizeSentiment(articles) {
  if (!articles.length) return { label: "No Data", score: null, count: 0 };

  // Only use articles where the ticker is actually relevant (score > 0.3)
  const relevant = articles.filter(a => a.relevanceScore > 0.3);
  if (!relevant.length) return { label: "No Relevant News", score: null, count: 0 };

  const avgScore = relevant.reduce((sum, a) => sum + a.sentimentScore, 0) / relevant.length;
  const label = avgScore >= 0.15 ? "Bullish" : avgScore <= -0.15 ? "Bearish" : "Neutral";

  return { label, score: avgScore, count: relevant.length };
}