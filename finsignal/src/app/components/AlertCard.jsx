const SEVERITY_COLORS = {
  HIGH: "border-red-500 bg-red-950",
  MEDIUM: "border-yellow-500 bg-yellow-950",
  LOW: "border-blue-500 bg-blue-950",
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
      className={`border-l-4 rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity ${SEVERITY_COLORS[alert.severity]}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-mono text-gray-400">{alert.timestamp}</span>
          <h3 className="text-white font-bold text-lg">{alert.symbol}</h3>
          <p className="text-sm text-gray-300">{TYPE_LABELS[alert.type]}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          alert.severity === "HIGH" ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
        }`}>
          {alert.severity}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-200">{alert.detail}</p>
      <p className="mt-1 text-xs text-gray-400 italic">{alert.rule}</p>
    </div>
  );
}
