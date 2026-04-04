export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">
            Detection Methodology
          </h1>
          <p className="text-gray-400 text-sm">
            {/* Write a one sentence description of what this page explains */}
          </p>
        </div>

        {/* Rule Cards */}
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="mb-6 border-l-4 border-amber-400 bg-gray-900 rounded-r-lg p-6"
          >
            {/* Rule Number + Name */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-1 rounded">
                RULE {rule.id}
              </span>
              <h2 className="text-lg font-bold text-amber-200">
                {rule.name}
              </h2>
              <span className={`ml-auto text-xs font-mono px-2 py-1 rounded font-bold ${
                rule.severity === "HIGH"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
                {rule.severity}
              </span>
            </div>

            {/* Explanation - you write this */}
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {rule.explanation}
            </p>

            {/* Formula */}
            <div className="bg-gray-950 border border-gray-800 rounded p-3 font-mono text-xs text-amber-300 mb-4">
              {rule.formula}
            </div>

            {/* Why It Matters */}
            <div className="text-xs text-gray-500 italic">
              {rule.whyItMatters}
            </div>
          </div>
        ))}

        {/* Limitations Section */}
        <div className="mt-10 border border-gray-800 rounded-lg p-6 bg-gray-900">
          <h2 className="text-lg font-bold text-gray-300 mb-3">
            Limitations
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {/* Write your limitations explanation here */}
          </p>
        </div>

      </div>
    </main>
  );
}
const rules = [
  {
    id: 1,
    name: "Volume Spike",
    severity: "HIGH",
    explanation: "", // you write this
    formula: "Volume Ratio = Today's Volume / 20-Day Avg Volume | Flag if >= 2.0x",
    whyItMatters: "", // you write this
  },
  {
    id: 2,
    name: "Pre-Announcement Price Surge",
    severity: "HIGH",
    explanation: "",
    formula: "Price Change = (Close - Prev Close) / Prev Close | Flag if >= 5% with Volume Ratio >= 1.5x",
    whyItMatters: "",
  },
  {
    id: 3,
    name: "Pump-and-Dump Signal",
    severity: "HIGH",
    explanation: "",
    formula: "5-Day Gain = (Today's Close - Close 5 Days Ago) / Close 5 Days Ago | Flag if price < $5 AND gain >= 30%",
    whyItMatters: "",
  },
  {
    id: 4,
    name: "Insider Filing Cluster",
    severity: "MEDIUM",
    explanation: "",
    formula: "Source: SEC EDGAR Form 4 filings | Flag if 3+ filings within 30-day window",
    whyItMatters: "",
  },
  {
    id: 5,
    name: "Sentiment-Price Divergence",
    severity: "MEDIUM",
    explanation: "",
    formula: "Flag if price >= +4% AND news count = 0 OR avg sentiment score < -0.10",
    whyItMatters: "",
  },
  {
    id: 6,
    name: "", // your custom rule name
    severity: "",
    explanation: "",
    formula: "",
    whyItMatters: "",
  },
];
