"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDailyHistory } from "@/lib/alphaVantage";
import { getInsiderFilings } from "@/lib/edgar";
import { detectAnomalies } from "@/lib/anomalyDetector";
import AlertCard from "@/components/AlertCard";

const WATCHLIST = ["AAPL", "TSLA", "NVDA", "GME", "AMC", "MSFT"];

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      let allAlerts = [];
      // Note: Due to API limits, we only fetch a subset in this demo
      for (const symbol of WATCHLIST.slice(0, 3)) {
        const history = await getDailyHistory(symbol);
        const insiders = await getInsiderFilings(symbol);
        const detected = detectAnomalies(symbol, history, insiders);
        allAlerts = [...allAlerts, ...detected];
      }
      setAlerts(allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Suspicious Activity Feed</h1>
        <p className="text-gray-400">Real-time flags for unusual trading patterns.</p>
      </header>

      {loading ? (
        <div className="grid gap-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-900 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <AlertCard 
                key={idx} 
                alert={alert} 
                onClick={(s) => router.push(`/ticker/${s}`)} 
              />
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-gray-800 rounded-xl">
              <p className="text-gray-500">No high-confidence anomalies detected in current cycle.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
