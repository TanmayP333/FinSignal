export default function Methodology() {
  const rules = [
    {
      name: "Volume Spike Detection",
      logic: "Flagged when daily volume > 200% of the 20-day simple moving average (SMA).",
      context: "The Meulbroek (1992) study indicates that volume is the most immediate signal of informed trading, as insiders must accumulate positions, creating an unavoidable footprint."
    },
    {
      name: "Price-Volume Divergence",
      logic: "Flagged when price moves > 5% on volume > 150% of average.",
      context: "Used by regulators to identify pre-announcement leaks. Sudden volatility without public catalysts is a high-priority 'red flag' in AML surveillance."
    },
    {
      name: "SEC Form 4 Cluster Analysis",
      logic: "Flagged when 3+ distinct insiders file Form 4s within 10 days.",
      context: "Coordinated insider buying often precedes material positive news (mergers, clinical trial results, or earnings beats)."
    }
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Detection Methodology</h1>
      <p className="text-gray-400 mb-8 leading-relaxed">
        FinSignal uses behavioral rule-based logic modeled after FINRA and SEC surveillance patterns. 
        Unlike basic stock trackers, we focus exclusively on forensic anomalies.
      </p>

      <div className="space-y-12">
        {rules.map((r, i) => (
          <div key={i} className="border-l-2 border-blue-500 pl-6">
            <h2 className="text-xl font-bold text-white mb-2">{r.name}</h2>
            <div className="bg-gray-900 p-4 rounded mb-4">
              <code className="text-blue-400 text-sm">{r.logic}</code>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{r.context}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-red-950/20 border border-red-900/50 rounded-lg">
        <h3 className="text-red-500 font-bold mb-2">Disclaimer & Limitations</h3>
        <p className="text-xs text-gray-400">
          This tool is for educational portfolio purposes. Real-world surveillance (SARs) involves 
          Order Audit Trail System (OATS) data and dark pool access not available in public APIs. 
          Flags are indicators, not proof of criminal activity.
        </p>
      </div>
    </div>
  );
}
