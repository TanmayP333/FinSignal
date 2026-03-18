"use client";
import {useEffect, useState} from "react";
import {getDailyHistory} from "../lib/alphaVantage";
import {detectAnomalies} from "../lib/anomalyDetector";
import AlertCard from "./components/AlertCard";

/*
Tickers chosen...
    Amazon.com Inc, Apple Inc, Goldmach Sachs Group Inc, Boeing Co, Palantir Technologies Inc,
    Lockheed Martin Corp, United Healthcare Group Inc, Exxon Mobil Corp, Berkshire Hathaway Inc Class B,
    Amcor PLC, Alumis Inc, Tectonic Therapeutic  Inc, Nvidia Corp, Meta Platforms Inc
*/
const WATCHLIST = ["AMZN", "AAPL", "GS", "BA", "PLTR",
                "LMT", "WMT", "UNH", "XOM", "BRK.B",
                "AMCR", "ALMS", "TECX", "NVDA", "META"];

export default function Home(){
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(True);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        async function runScans(){
            const allAlerts = [];

            for(const symbol of WATCHLIST){
                try{
                    const history = await getDailyHistory(symbol);
                    const detected = detectAnomalies(symbol, history);
                    allAlerts.push(...detected);
                }
                catch (err){
                    console.error('Failed to scan ${symbol}: ', err);
                }
            }

            allAlerts.sort((a, b) => {
                const order = {HIGH: 0, MEDIUM: 1, LOW: 2};
                return order[a.severity] - order[b.severity];
            });

            setAlerts(allAlerts);
            setLoading(false);
        }
        runScans();
    }, []);

    const filtered = filter === "ALL" ? alerts : alerts.filter(a => a.severity === filter);

    return(
        <main className = "min-h-screen bg-gray-950 text-gray-100 p-6">
            <div className = "max-w-4x1 mx-auto">
                {/*Header*/}
                <div className = "mb-6">
                    <h1 className = "text-3x1 font-bold text-amber-400">
                        FinSignal
                    </h1>
                    <p className = "text-gray-400 text-sm mt-1">
                        Live Suspicious Monitor - {alerts.length} alerts detected
                    </p>
                </div>

                {/*filter buttons*/}

                <div className = "flex gap-3 mb-6">
                    {["ALL", "HIGH", "MEDIUM"].map(f => (
                        <button key = {f} onclick = {() => setFilter(f)}
                            className = {'px-4 py-1.5 rounded text-xs font-mono uppercase tracking-wider border transition  ${filter == f ? "border-amber-400 text-amber-400 bg-amber-400/10" : "border-gray-700 text-gray-700 bg-amber-500"}'}>
                                {f}
                        </button>
                    ))}
                </div>

                {/*Alert Feed*/}
                {loading ? (
                    <div className = "text-gray-500 font-mono text-sm animate-pulse">
                        Scanning {WATCHLIST.length} tickers...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className = "text-gray-500 font-mono text-sm">
                        No alerts detected for current filter.
                    </div>
                ) : (
                    <div className = "flex- flex-col gap-4">
                        {filtered.map((alert, 1) => (
                            {<AlertCard key = {i} alert = {alert} onClikc = {(sym) =>}}
                        ))}
                )
                )
                )}
            </div>
        </main>








}

