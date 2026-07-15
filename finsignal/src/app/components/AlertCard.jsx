const SEVERITY_COLORS = {
  HIGH: "border-red-500 bg-red-950/30",
  MEDIUM: "border-yellow-500 bg-yellow-950/30",
  LOW: "border-blue-500 bg-blue-950/30",
};

const TYPE_LABELS = {
  VOLUME_SPIKE: "Volume Spike",
  PRICE_SURGE: "Abnormal Price Move",
  PUMP_SIGNAL: "Pump Signal",
  INSIDER_CLUSTER: "Insider Cluster",
};

export default function AlertCard({ alert, onClick }) {
  return (
    <div
      onClick={() => onClick(alert.symbol)}
      className={`border-l-4 rounded-lg p-4 cursor-pointer hover:bg-gray-900 transition-all ${SEVERITY_COLORS[alert.severity]}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{alert.timestamp}</span>
          <h3 className="text-white font-bold text-xl">{alert.symbol}</h3>
          <p className="text-sm font-semibold text-gray-300">{TYPE_LABELS[alert.type]}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
          alert.severity === "HIGH" ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
        }`}>
          {alert.severity}
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-300 leading-relaxed">{alert.detail}</p>
      <p className="mt-2 text-xs text-gray-500 italic border-t border-gray-800 pt-2">{alert.rule}</p>
    </div>
  );
}
