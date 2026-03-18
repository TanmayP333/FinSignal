export default function SentimentBadge({ summary }) {
  const colorMap = {
    "Bullish": "bg-green-700 text-green-100",
    "Bearish": "bg-red-700 text-red-100",
    "Neutral": "bg-gray-600 text-gray-100",
    "No Data": "bg-gray-800 text-gray-400",
    "No Relevant News": "bg-gray-800 text-gray-400",
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorMap[summary.label] || colorMap["No Data"]}`}>
        {summary.label}
      </span>
      {summary.count > 0 && (
        <span className="text-xs text-gray-400">{summary.count} articles</span>
      )}
      {summary.score !== null && (
        <span className="text-xs text-gray-500">({summary.score >= 0 ? "+" : ""}{summary.score.toFixed(2)})</span>
      )}
    </div>
  );
}