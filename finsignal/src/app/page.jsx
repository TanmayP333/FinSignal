import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Plus,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Search,
  Activity,
  FileText,
  Terminal,
  RefreshCw,
  Cpu,
  Bookmark,
  Info,
  Newspaper,
  CheckCircle2
} from "lucide-react";
import Navbar from "./components/Navbar";
import AlertCard from "./components/AlertCard";
import PriceChart from "./components/PriceChart";
import { AnomalyAlert, StockHistoryItem, InsiderFiling, TickerData, NewsArticle } from "./types";
import { detectAnomalies } from "./lib/anomalyDetector";
import {
  fetchGlobalCrimesBriefing,
  fetchMarketHistory,
  fetchSecInsider,
  fetchNews,
  fetchAiRationale
} from "./lib/apiClient";

const DEFAULT_WATCHLIST = [
  "AMZN", "AAPL", "GS", "BA", "PLTR", "LMT", "WMT", "UNH", "XOM", "BRK.B", "AMCR", "ALMS", "TECX", "NVDA", "META"
];

export default function App() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("finsignal_watchlist");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset if critical focus stocks are missing to ensure recruiters see the correct focus tickers
      if (!parsed.includes("PLTR") || !parsed.includes("TECX")) {
        return DEFAULT_WATCHLIST;
      }
      return parsed;
    }
    return DEFAULT_WATCHLIST;
  });

  const [currentView, setCurrentView] = useState<"dashboard" | "methodology" | "ticker-deep-dive">("dashboard");
  const [selectedTicker, setSelectedTicker] = useState<string>("NVDA");
  
  // Dashboard & global data states
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [tickerMetadata, setTickerMetadata] = useState<Record<string, TickerData>>({});
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  // Deep dive states
  const [deepDiveHistory, setDeepDiveHistory] = useState<StockHistoryItem[]>([]);
  const [deepDiveFilings, setDeepDiveFilings] = useState<InsiderFiling[]>([]);
  const [deepDiveAlerts, setDeepDiveAlerts] = useState<AnomalyAlert[]>([]);
  const [deepDiveNews, setDeepDiveNews] = useState<NewsArticle[]>([]);
  const [aiRationale, setAiRationale] = useState("");
  const [loadingRationale, setLoadingRationale] = useState(false);
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);

  // Global intelligence summary states
  const [globalBriefing, setGlobalBriefing] = useState<any[]>([]);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  // Auto-rotation clock state (30 minutes in seconds)
  const [rotationTimer, setRotationTimer] = useState<number>(30 * 60);

  // Persistence
  useEffect(() => {
    localStorage.setItem("finsignal_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Load Alerts & Ticker Metadata on mount or when watchlist changes
  useEffect(() => {
    loadAllAlerts();
  }, [watchlist]);

  // Load Global Crimes Briefing on mount
  useEffect(() => {
    loadGlobalBriefing();
  }, []);

  // Handle switching to Deep Dive
  useEffect(() => {
    if (selectedTicker) {
      loadDeepDiveData(selectedTicker);
    }
  }, [selectedTicker]);

  // Auto-rotation timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationTimer((prev) => {
        if (prev <= 1) {
          triggerNextRotation();
          return 30 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [watchlist, selectedTicker]);

  const triggerNextRotation = () => {
    if (watchlist.length === 0) return;
    const currentIndex = watchlist.indexOf(selectedTicker);
    const nextIndex = (currentIndex + 1) % watchlist.length;
    setSelectedTicker(watchlist[nextIndex]);
    setRotationTimer(30 * 60);
  };

  const formatRotationTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const loadGlobalBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const briefing = await fetchGlobalCrimesBriefing();
      setGlobalBriefing(briefing);
    } catch (err) {
      console.error("Failed to load global financial crimes briefing:", err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const loadAllAlerts = async (silent = false) => {
    if (!silent) setLoadingAlerts(true);
    try {
      let loadedAlerts: AnomalyAlert[] = [];
      const metadataMap: Record<string, TickerData> = {};

      await Promise.all(
        watchlist.map(async (symbol) => {
          try {
            // Fetch daily history
            const history = await fetchMarketHistory(symbol);

            // Fetch SEC filings
            const filings = await fetchSecInsider(symbol);

            // Fetch News Articles for False-Positive Mitigation
            const news = await fetchNews(symbol);

            // Calculate metadata
            if (history.length > 0) {
              const today = history[history.length - 1];
              const yesterday = history[history.length - 2] || today;
              const change = today.close - yesterday.close;
              const changePercent = (change / (yesterday.close || 1)) * 100;
              
              const prev20 = history.slice(-21, -1);
              const avgVolume = prev20.reduce((sum, d) => sum + d.volume, 0) / (prev20.length || 1);

              metadataMap[symbol] = {
                symbol,
                companyName: getCompanyName(symbol),
                price: today.close,
                change,
                changePercent,
                volume: today.volume,
                avgVolume: Math.round(avgVolume),
              };

              // Run anomaly detection with news parameter to mitigate false-positives
              const detected = detectAnomalies(symbol, history, filings, news);
              loadedAlerts = [...loadedAlerts, ...detected];
            }
          } catch (err) {
            console.error(`Failed to fetch dashboard data for ${symbol}:`, err);
          }
        })
      );

      // Sort alerts by newest date
      loadedAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setAlerts(loadedAlerts);
      setTickerMetadata(metadataMap);
    } catch (err) {
      console.error("Failed to load alerts feed:", err);
    } finally {
      setLoadingAlerts(false);
      setIsRefreshing(false);
    }
  };

  const loadDeepDiveData = async (symbol: string) => {
    setLoadingDeepDive(true);
    setLoadingRationale(true);
    setAiRationale("");
    setDeepDiveNews([]);
    
    try {
      // 1. Fetch History
      const history = await fetchMarketHistory(symbol);
      setDeepDiveHistory(history);

      // 2. Fetch SEC filings
      const filings = await fetchSecInsider(symbol);
      setDeepDiveFilings(filings);

      // 3. Fetch News Articles
      const news = await fetchNews(symbol);
      setDeepDiveNews(news);

      // 4. Detect anomalies for specific symbol
      const detected = detectAnomalies(symbol, history, filings, news);
      setDeepDiveAlerts(detected);

      // 5. Fetch AI rationale for the highest severity alert or general analysis
      const primaryAlert = detected[0] || {
        type: "VOLUME_SPIKE",
        symbol,
        detail: `Historical volume logs active. Base price valued at $${history[history.length - 1]?.close || 0}`,
        rule: "Analytical review of general price and volume logs to flag irregularities.",
        timestamp: new Date().toISOString().split("T")[0]
      };

      const rationaleText = await fetchAiRationale(
        primaryAlert.type,
        primaryAlert.symbol,
        primaryAlert.detail,
        primaryAlert.rule,
        primaryAlert.timestamp
      );
      setAiRationale(rationaleText);

    } catch (err) {
      console.error(`Failed to load deep-dive data for ${symbol}:`, err);
      setAiRationale("Forensic logs indicate minor price-volume deviation. System awaiting next market clearance.");
    } finally {
      setLoadingDeepDive(false);
      setLoadingRationale(false);
    }
  };

  const getCompanyName = (symbol: string): string => {
    const names: Record<string, string> = {
      AMZN: "Amazon.com, Inc.",
      AAPL: "Apple Inc.",
      GS: "The Goldman Sachs Group, Inc.",
      BA: "The Boeing Company",
      PLTR: "Palantir Technologies Inc.",
      LMT: "Lockheed Martin Corp.",
      WMT: "Walmart Inc.",
      UNH: "UnitedHealth Group Inc.",
      XOM: "Exxon Mobil Corp.",
      "BRK.B": "Berkshire Hathaway Inc.",
      AMCR: "Amcor plc",
      ALMS: "Alumis Inc.",
      TECX: "Tectonic Therapeutic, Inc.",
      NVDA: "NVIDIA Corp",
      META: "Meta Platforms, Inc."
    };
    return names[symbol.toUpperCase()] || `${symbol} Holdings`;
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const cleanQuery = searchQuery.trim().toUpperCase();
    
    if (!cleanQuery) return;
    if (watchlist.includes(cleanQuery)) {
      setSearchError("Ticker is already in the watchlist.");
      return;
    }

    setWatchlist(prev => [...prev, cleanQuery]);
    setSearchQuery("");
  };

  const handleRemoveTicker = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
    if (selectedTicker === symbol) {
      const remaining = watchlist.filter(s => s !== symbol);
      if (remaining.length > 0) {
        setSelectedTicker(remaining[0]);
      }
    }
  };

  const handleAlertClick = (symbol: string) => {
    setSelectedTicker(symbol);
    setCurrentView("ticker-deep-dive");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAllAlerts(true);
    loadGlobalBriefing();
    if (selectedTicker) {
      loadDeepDiveData(selectedTicker);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb] text-zinc-900 antialiased selection:bg-red-500/30 selection:text-red-200">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedTicker={selectedTicker}
      />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        
        {/* Banner/Header section */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-zinc-200 pb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-600 font-bold">
              EQUITY FORENSIC INTELLIGENCE
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 mt-1 uppercase">
              Market Abuse & Manipulation Radar
            </h1>
            <p className="text-[12px] text-zinc-500 font-medium leading-relaxed mt-1">
              Automated behavioral heuristic flags monitoring stock volume surges, pumps, and insider filing clusters.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 px-4 py-2 text-[10px] tracking-wider font-bold font-mono transition-all uppercase rounded shadow-sm cursor-pointer ${
                isRefreshing ? "animate-spin" : ""
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              RE-SYNC LEDGER
            </button>
          </div>
        </div>

        {/* Deep Dive Stock Rotation Indicator */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-mono shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Active Focus Stock:</span>
            <span className="text-zinc-900 font-bold text-sm bg-white px-2 py-0.5 rounded border border-zinc-200">{selectedTicker}</span>
            <span className="text-zinc-500">({getCompanyName(selectedTicker)})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Deep-Dive Cycle Rotation:</span>
            <span className="text-red-600 font-bold tracking-widest">{formatRotationTime(rotationTimer)}</span>
            <button
              onClick={triggerNextRotation}
              className="text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1 rounded transition-all uppercase cursor-pointer"
            >
              Rotate Now
            </button>
          </div>
        </div>

        {/* View Layout Switcher */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* Global Crimes Intelligence Bulletin */}
            <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded border border-red-500/20 bg-red-50 text-red-600">
                    <Activity className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-[0.15em]">
                      Global Financial Intelligence Bulletin
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                      Live audit of active cross-border financial crime prosecutions, regulatory investigations, and criminal convictions.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loadingBriefing ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-[9px] font-mono font-bold text-zinc-500">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin" /> RETRIEVING DOSSIERS
                    </span>
                  ) : globalBriefing.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-[9px] font-mono font-bold text-zinc-500">
                      LIVE BRIEFING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-[9px] font-mono font-bold text-zinc-500">
                      LOCAL DOSSIERS
                    </span>
                  )}
                </div>
              </div>

              {loadingBriefing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded border border-zinc-200 bg-zinc-50 p-4 animate-pulse space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 w-1/3 rounded bg-zinc-200" />
                        <div className="h-3 w-16 rounded bg-zinc-200" />
                      </div>
                      <div className="h-3.5 w-full rounded bg-zinc-200" />
                      <div className="h-3.5 w-5/6 rounded bg-zinc-200" />
                      <div className="h-3 w-1/4 rounded bg-zinc-200 mt-2" />
                    </div>
                  ))}
                </div>
              ) : globalBriefing.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globalBriefing.map((item, idx) => (
                    <div key={idx} className="relative group flex flex-col rounded border border-zinc-200 bg-zinc-50 hover:border-red-500/20 p-4 transition-all duration-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-mono text-xs font-black text-zinc-900 group-hover:text-red-600 transition-colors">
                            {item.title}
                          </h4>
                          {item.date && (
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                              Date: {item.date}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono font-bold text-red-700 uppercase tracking-widest bg-red-50 border border-red-100 rounded px-1.5 py-0.5 shrink-0">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed font-medium mb-3">
                        {item.detail}
                      </p>
                      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-2 mt-auto text-[10px] font-mono">
                        <span className="text-zinc-500 font-semibold uppercase tracking-wider">
                          JURISDICTION: <span className="text-zinc-700">{item.jurisdiction}</span>
                        </span>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-bold hover:underline"
                          >
                            CASE DOSSIER <ChevronRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 text-center py-6 font-mono">
                  No crime dossiers currently populated in this SURVEILLANCE cycle.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* Left Column: Watchlist Controls & Market Metrics (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
               {/* Watchlist Section */}
              <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-red-600" />
                    <h3 className="font-display font-bold text-zinc-900 text-xs uppercase tracking-[0.15em]">
                      Target Watchlist
                    </h3>
                  </div>
                  <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-600">
                    {watchlist.length} TICKERS
                  </span>
                </div>

                {/* Search / Add Form */}
                <form onSubmit={handleAddTicker} className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Add ticker (e.g. MSFT)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs font-mono text-zinc-900 placeholder-zinc-400 transition-all focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
                {searchError && (
                  <p className="mt-2 font-mono text-[10px] text-red-600 leading-snug">{searchError}</p>
                )}

                {/* Watchlist Tickers List */}
                <div className="mt-4 divide-y divide-zinc-200/60">
                  {watchlist.map((symbol) => {
                    const data = tickerMetadata[symbol];
                    const isPositive = data ? data.change >= 0 : true;
                    return (
                      <div
                        key={symbol}
                        className={`group/item flex items-center justify-between py-3 transition-colors ${
                          selectedTicker === symbol ? "bg-red-50/50 px-2 -mx-2 rounded border border-red-100" : ""
                        }`}
                      >
                        <div
                          onClick={() => {
                            setSelectedTicker(symbol);
                            setCurrentView("ticker-deep-dive");
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div>
                            <span className="font-mono text-xs font-bold text-zinc-900 group-hover/item:text-red-600 transition-colors">
                              {symbol}
                            </span>
                            <span className="block text-[10px] text-zinc-500 max-w-[120px] truncate">
                              {getCompanyName(symbol)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {data ? (
                            <div className="text-right font-mono text-xs">
                              <span className="font-bold block text-zinc-900">${data.price.toFixed(2)}</span>
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                                  isPositive ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {isPositive ? "+" : ""}
                                {data.changePercent.toFixed(2)}%
                              </span>
                            </div>
                          ) : (
                            <span className="h-3.5 w-12 rounded bg-zinc-200 animate-pulse" />
                          )}

                          <button
                            onClick={() => handleRemoveTicker(symbol)}
                            className="text-zinc-400 hover:text-red-600 transition-colors opacity-0 group-hover/item:opacity-100 p-1 cursor-pointer"
                            title="Remove from radar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Anomaly Simulator Box for engaging recruiters */}
              <div className="rounded border border-dashed border-zinc-200 bg-zinc-50 p-5">
                <div className="flex gap-2.5 items-start">
                  <div className="rounded bg-red-50 p-2 text-red-600 border border-red-100 shrink-0">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-wider">
                      Forensic Sandbox Mode
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-normal mt-1">
                      Our system automatically simulates realistic financial crime typologies on specific watchlist tickers:
                    </p>
                    <ul className="mt-3 space-y-1.5 font-mono text-[10px] text-zinc-400 leading-relaxed list-disc list-inside">
                      <li>
                        <span className="font-bold text-zinc-700">TSLA:</span> Massive 5.2x volume spike
                      </li>
                      <li>
                        <span className="font-bold text-zinc-700">NVDA:</span> High-risk insider clustering
                      </li>
                      <li>
                        <span className="font-bold text-zinc-700">PENY:</span> Penny stock pump-and-dump
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Suspicious Activity Feed (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <h3 className="font-display font-bold text-zinc-900 text-xs uppercase tracking-[0.15em]">
                    Live Surveillance Log
                  </h3>
                </div>
                <span className="rounded bg-red-100 border border-red-200 px-2 py-0.5 font-mono text-[9px] font-bold text-red-700">
                  {alerts.length} EXPOSURES ACTIVE
                </span>
              </div>

              {loadingAlerts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 w-full rounded border border-zinc-200 bg-white p-5 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-5 w-24 rounded bg-zinc-200 animate-pulse" />
                          <div className="h-3 w-40 rounded bg-zinc-200 animate-pulse" />
                        </div>
                        <div className="h-5 w-16 rounded bg-zinc-200 animate-pulse" />
                      </div>
                      <div className="h-3.5 w-full rounded bg-zinc-200 animate-pulse mt-4" />
                      <div className="h-2.5 w-1/2 rounded bg-zinc-200 animate-pulse mt-2" />
                    </div>
                  ))}
                </div>
              ) : alerts.length > 0 ? (
                <div className="grid gap-4">
                  {alerts.map((alert, idx) => (
                    <AlertCard
                      key={`${alert.symbol}-${alert.type}-${idx}`}
                      alert={alert}
                      onClick={handleAlertClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded border border-dashed border-zinc-200 bg-white py-20 text-center px-4">
                  <div className="rounded-full bg-zinc-100 border border-zinc-200 p-4 text-zinc-400 mb-4">
                    <Activity className="h-8 w-8" />
                  </div>
                  <h3 className="font-display font-bold text-zinc-900 text-sm uppercase tracking-wider">
                    All Equities Clean
                  </h3>
                  <p className="max-w-xs text-xs text-zinc-500 mt-1 leading-normal">
                    No active volume deviations, price pumps, or unusual corporate filings detected in this cycle.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

        {/* Methodology View */}
        {currentView === "methodology" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-b border-zinc-200 pb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-600 font-bold">
                REGULATORY BLUEPRINTS
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-zinc-900 mt-1 uppercase">
                Surveillance Detection Mechanics
              </h2>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed mt-1">
                FinSignal maps quantitative data inputs against verified financial crime typologies. Read our regulatory rationales and algorithm parameters below.
              </p>
            </div>

            <div className="grid gap-6">
              
              {/* Rule 1 */}
              <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-lg font-black text-red-600">01</span>
                  <div className="space-y-3 flex-1">
                    <h3 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wider">
                      Volume Spike Detection Heuristic
                    </h3>
                    <div className="inline-flex rounded border border-purple-200 bg-purple-50 px-2.5 py-1 font-mono text-xs text-purple-700 font-bold">
                      Daily Volume &gt; 2.0x SMA_20(Volume)
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">
                      Volume is the primary lead indicator of informed positioning. Institutional rings and corporate insider syndicates can obfuscate price impact temporarily via dark books, but accumulating large equity blocks creates an unavoidable physical volumetric footprint.
                    </p>
                    <div className="rounded bg-zinc-50 border border-zinc-200 p-3 flex items-start gap-2 text-xs text-zinc-500 italic leading-normal">
                      <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-zinc-700 not-italic font-bold">Academic Baseline:</strong> Meulbroek (1992) - "An Empirical Analysis of Insider Trading" establishes volume spikes as the most consistent statistical footprint of MNPI leakage.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-lg font-black text-red-600">02</span>
                  <div className="space-y-3 flex-1">
                    <h3 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wider">
                      Pre-Announcement Price Surge
                    </h3>
                    <div className="inline-flex rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-xs text-emerald-700 font-bold">
                      Daily Return &ge; 5% AND Volume &ge; 1.5x SMA_20
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">
                      Sudden positive price shifts without corresponding public regulatory announcements indicate information asymmetry. Insiders front-running material corporate events (mergers, critical earnings leaks, FDA decisions) create a classic momentum spike prior to market dissemination.
                    </p>
                    <div className="rounded bg-zinc-50 border border-zinc-200 p-3 flex items-start gap-2 text-xs text-zinc-500 italic leading-normal">
                      <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-zinc-700 not-italic font-bold">Regulatory Context:</strong> Investigated under SEC Exchange Act Section 10(b) and Rule 10b-5. Regulators systematically audit trading accounts executing blocks within this pre-announcement window.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-lg font-black text-red-600">03</span>
                  <div className="space-y-3 flex-1">
                    <h3 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wider">
                      Microcap Pump-and-Dump Indicator
                    </h3>
                    <div className="inline-flex rounded border border-rose-200 bg-rose-50 px-2.5 py-1 font-mono text-xs text-rose-700 font-bold">
                      Price &lt; $5 AND 5-Day Cumulative Return &ge; 30%
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">
                      Coordinated promoter rings exploit low liquidity and thin floats of OTC or microcap penny stocks. Coordinated social media pump campaigns and newsletter hype artificially inflate price and volume. Once external retail FOMO is generated, promoters dump their positions, resulting in rapid valuation collapse.
                    </p>
                    <div className="rounded bg-zinc-50 border border-zinc-200 p-3 flex items-start gap-2 text-xs text-zinc-500 italic leading-normal">
                      <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-zinc-700 not-italic font-bold">Surveillance Target:</strong> Explicitly banned under Securities Act Section 17(a) and prosecuted heavily by the SEC Market Abuse Unit.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule 4 */}
              <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-lg font-black text-red-600">04</span>
                  <div className="space-y-3 flex-1">
                    <h3 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wider">
                      SEC Form 4 Insider Purchase Clusters
                    </h3>
                    <div className="inline-flex rounded border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-xs text-amber-700 font-bold">
                      &ge; 3 Distinct Corporate Insiders filing SEC Form 4 inside 10 days
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">
                      While individual insider buys are normal, a coordinated cluster of distinct company executives and directors acquiring equity represents significant positive correlation with material, non-disclosed milestones.
                    </p>
                    <div className="rounded bg-zinc-50 border border-zinc-200 p-3 flex items-start gap-2 text-xs text-zinc-500 italic leading-normal">
                      <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-zinc-700 not-italic font-bold">Filing Rules:</strong> Sarbanes-Oxley Section 403 requires corporate officers (directors, senior executives, &gt;10% beneficial owners) to file Form 4 within 2 business days of any open-market transaction.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Disclaimer */}
            <div className="rounded border border-red-200 bg-red-50 p-6 border-l-4 border-l-red-600">
              <h3 className="font-display font-bold text-red-600 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Academic & Portfolio Disclaimer
              </h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed mt-2 font-medium">
                FinSignal is constructed exclusively for demonstration, engineering, and recruiter review. True regulatory market surveillance (such as FINRA OATS and CAT systems) utilizes high-frequency raw order-book events, consolidated audit trails, and dark pool feeds not accessible via commercial APIs. Flags represent statistical trading anomalies, not definitive proof of illegal activities.
              </p>
            </div>
          </div>
        )}

        {/* Ticker Deep Dive View */}
        {currentView === "ticker-deep-dive" && (
          <div className="space-y-8">
            
            {/* Symbol Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter uppercase">{selectedTicker}</h1>
                  <div className="h-10 w-[2px] bg-white/10"></div>
                  <div className="font-serif">
                    <div className="text-xl sm:text-2xl text-zinc-900 font-bold">
                      {tickerMetadata[selectedTicker] ? `$${tickerMetadata[selectedTicker].price.toFixed(2)}` : "Loading..."}
                    </div>
                    <div className={`text-xs font-bold ${
                      tickerMetadata[selectedTicker] && tickerMetadata[selectedTicker].change >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {tickerMetadata[selectedTicker] ? (
                        <>
                          {tickerMetadata[selectedTicker].change >= 0 ? "+" : ""}
                          {tickerMetadata[selectedTicker].changePercent.toFixed(2)}% (Session Tracker)
                        </>
                      ) : "---"}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 block mb-1 font-mono">
                  {getCompanyName(selectedTicker)}
                </span>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Full 100-day quantitative timeline and SEC corporate governance ledger.
                </p>
              </div>

              {/* Simple selector for quick deep dives */}
              <div className="flex items-center gap-2 self-start sm:self-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Select Target:
                </span>
                <select
                  value={selectedTicker}
                  onChange={(e) => setSelectedTicker(e.target.value)}
                  className="rounded border border-zinc-200 bg-white px-3 py-1.5 font-mono text-xs text-zinc-800 focus:border-red-600 focus:outline-none"
                >
                  {watchlist.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ticker Performance Metrics Cards */}
            {tickerMetadata[selectedTicker] ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                
                <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Current Share Price</span>
                  <span className="mt-1 block font-mono text-xl sm:text-2xl font-bold text-zinc-900">
                    ${tickerMetadata[selectedTicker].price.toFixed(2)}
                  </span>
                </div>

                <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Daily Return</span>
                  <span className={`mt-1 block font-mono text-xl sm:text-2xl font-bold ${
                    tickerMetadata[selectedTicker].change >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {tickerMetadata[selectedTicker].change >= 0 ? "+" : ""}
                    {tickerMetadata[selectedTicker].changePercent.toFixed(2)}%
                  </span>
                </div>

                <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">surveillance volume</span>
                  <span className="mt-1 block font-mono text-xl sm:text-2xl font-bold text-zinc-900">
                    {tickerMetadata[selectedTicker].volume.toLocaleString()}
                  </span>
                </div>

                <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">20-Day Avg Volume</span>
                  <span className="mt-1 block font-mono text-xl sm:text-2xl font-bold text-zinc-600">
                    {tickerMetadata[selectedTicker].avgVolume.toLocaleString()}
                  </span>
                </div>

              </div>
            ) : (
              <div className="h-16 w-full rounded bg-zinc-200 animate-pulse" />
            )}

            {/* Price Chart */}
            <PriceChart data={deepDiveHistory} symbol={selectedTicker} />

            {/* AI Forensic Rationale & Anomaly Analysis */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              
              {/* Left Side: AI Forensic Rationale (7 cols) */}
              <div className="lg:col-span-7 rounded border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                  <Cpu className="h-4.5 w-4.5 text-red-600 animate-pulse" />
                  <h3 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-[0.15em]">
                    AI Forensic Investigation Rationale
                  </h3>
                </div>

                {loadingRationale ? (
                  <div className="space-y-2.5 animate-pulse">
                    <div className="h-4 w-full rounded bg-zinc-200" />
                    <div className="h-4 w-11/12 rounded bg-zinc-200" />
                    <div className="h-4 w-9/12 rounded bg-zinc-200" />
                  </div>
                ) : aiRationale ? (
                  <div className="space-y-3.5">
                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">
                      {aiRationale}
                    </p>
                    <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-zinc-400">
                      <span>Forensic Model:</span>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 border border-zinc-200 text-zinc-500 font-bold">
                        Gemini-3.5-flash
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 font-medium">No active qualitative analysis loaded.</p>
                )}
              </div>

              {/* Right Side: Triggered Anomalies Checklist (5 cols) */}
              <div className="lg:col-span-5 rounded border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-600" />
                  <h3 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-[0.15em]">
                    Surveillance Trigger Checklist
                  </h3>
                </div>

                {loadingDeepDive ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-8 w-full rounded bg-zinc-200" />
                    <div className="h-8 w-full rounded bg-zinc-200" />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Volume Spike Check */}
                    <div className={`flex items-center justify-between p-3 rounded border ${
                      deepDiveAlerts.some(a => a.type === "VOLUME_SPIKE")
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-400"
                    }`}>
                      <span className="text-[10px] font-bold font-display uppercase tracking-wider">Volume Spike (&gt;2x Avg)</span>
                      <span className="font-mono text-[9px] font-bold">
                        {deepDiveAlerts.some(a => a.type === "VOLUME_SPIKE") ? "TRIGGERED" : "CLEAR"}
                      </span>
                    </div>

                    {/* Price Surge Check */}
                    <div className={`flex items-center justify-between p-3 rounded border ${
                      deepDiveAlerts.some(a => a.type === "PRICE_SURGE")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-400"
                    }`}>
                      <span className="text-[10px] font-bold font-display uppercase tracking-wider">Price Return Surge (&gt;5%)</span>
                      <span className="font-mono text-[9px] font-bold">
                        {deepDiveAlerts.some(a => a.type === "PRICE_SURGE") ? "TRIGGERED" : "CLEAR"}
                      </span>
                    </div>

                    {/* Penny Pump Check */}
                    <div className={`flex items-center justify-between p-3 rounded border ${
                      deepDiveAlerts.some(a => a.type === "PUMP_SIGNAL")
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-400"
                    }`}>
                      <span className="text-[10px] font-bold font-display uppercase tracking-wider">Microcap Pump (+$5 / +30%)</span>
                      <span className="font-mono text-[9px] font-bold">
                        {deepDiveAlerts.some(a => a.type === "PUMP_SIGNAL") ? "TRIGGERED" : "CLEAR"}
                      </span>
                    </div>

                    {/* Insider Cluster Check */}
                    <div className={`flex items-center justify-between p-3 rounded border ${
                      deepDiveAlerts.some(a => a.type === "INSIDER_CLUSTER")
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-400"
                    }`}>
                      <span className="text-[10px] font-bold font-display uppercase tracking-wider">Insider Purchase Cluster</span>
                      <span className="font-mono text-[9px] font-bold">
                        {deepDiveAlerts.some(a => a.type === "INSIDER_CLUSTER") ? "TRIGGERED" : "CLEAR"}
                      </span>
                    </div>

                    {/* Short Squeeze Check */}
                    <div className={`flex items-center justify-between p-3 rounded border ${
                      deepDiveAlerts.some(a => a.type === "SHORT_SQUEEZE")
                        ? "border-red-200 bg-red-50 text-red-700 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-400"
                    }`}>
                      <span className="text-[10px] font-bold font-display uppercase tracking-wider">Short Squeeze Velocity</span>
                      <span className="font-mono text-[9px] font-bold">
                        {deepDiveAlerts.some(a => a.type === "SHORT_SQUEEZE") ? "TRIGGERED" : "CLEAR"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* False-Positive News Mitigation Dashboard */}
            <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4.5 w-4.5 text-red-600" />
                  <div>
                    <h3 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-[0.15em]">
                      Surveillance Mitigation & News Catalysts
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                      Legitimate public news feed audited to identify trading triggers and filter false-positive abuse reports.
                    </p>
                  </div>
                </div>
                {deepDiveNews.some(n => n.isMarketCatalyst) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-[9px] font-mono font-bold text-emerald-800 animate-pulse">
                    <CheckCircle2 className="h-3 w-3" /> MITIGATION CRITERIA MET
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-[9px] font-mono font-bold text-amber-800">
                    <AlertTriangle className="h-3 w-3" /> NO VALID MITIGATING CATALYST
                  </span>
                )}
              </div>

              {loadingDeepDive ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 w-full rounded bg-zinc-200" />
                  <div className="h-10 w-full rounded bg-zinc-200" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Left Side: Audit Decision Details */}
                  <div className="rounded border border-zinc-200 bg-zinc-50 p-5 space-y-4">
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-bold border-b border-zinc-200 pb-2">
                      Forensic Mitigation Log
                    </h4>
                    
                    {deepDiveNews.some(n => n.isMarketCatalyst) ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                          <span>ALERTER BYPASS ACTIVE (FALSE-POSITIVE MITIGATED)</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                          Our automated behavioral parsing mapped a highly verified regulatory catalyst on today's trading timeline. The price and volume breakout is deemed fundamentally justified by broad disclosures, reducing the probability of insider front-running to low threat.
                        </p>
                        <div className="rounded bg-emerald-50 border border-emerald-200 p-3 text-[10px] font-mono text-emerald-800 leading-normal">
                          <strong>Mitigation Key:</strong> SEC Rule 10b5-1 public alignment confirmed. Trading anomaly downgraded to Low Severity.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-red-700 font-bold text-xs">
                          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                          <span>HIGH VELOCITY RISK (NO FUNDAMENTAL MITIGATION)</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                          No official corporate announcements, earnings publications, drug trials, or merger filings are mapped to today's active volume breakout. The price action represents highly asymmetric, unsupported demand that remains highly suspicious for front-running of non-public info.
                        </p>
                        <div className="rounded bg-red-50 border border-red-200 p-3 text-[10px] font-mono text-red-800 leading-normal">
                          <strong>Surveillance Status:</strong> Escalated to Level-3 audit queue. Under review for MNPI front-running.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side: News feed */}
                  <div className="space-y-3">
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-bold border-b border-zinc-200 pb-2">
                      Audited News Timeline
                    </h4>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {deepDiveNews.map((article, idx) => (
                        <div key={idx} className="rounded border border-zinc-200 bg-zinc-50 p-3 text-[11px] space-y-1 hover:bg-zinc-100 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-zinc-900 leading-tight">{article.title}</span>
                            {article.isMarketCatalyst && (
                              <span className="rounded bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 shrink-0 font-mono">
                                CATALYST
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[8px] text-zinc-400">
                            <span className="text-zinc-500 font-bold">{article.source}</span>
                            <span>•</span>
                            <span>{article.date}</span>
                          </div>
                          <p className="text-zinc-500 leading-normal text-[10px] font-medium line-clamp-2">
                            {article.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEC EDGAR Corporate Filings Table */}
            <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-4 mb-4">
                <FileText className="h-4.5 w-4.5 text-zinc-500" />
                <div>
                  <h3 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-[0.15em]">
                    SEC EDGAR Live Filings Ledger
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                    Corporate officer acquisitions and open-market transaction reports (Form 4) filed within the last 30 days.
                  </p>
                </div>
              </div>

              {loadingDeepDive ? (
                <div className="space-y-3 animate-pulse py-4">
                  <div className="h-8 w-full rounded bg-zinc-200" />
                  <div className="h-8 w-full rounded bg-zinc-200" />
                  <div className="h-8 w-full rounded bg-zinc-200" />
                </div>
              ) : deepDiveFilings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-mono uppercase text-[9px] tracking-widest">
                        <th className="py-3 px-4">Filing Date</th>
                        <th className="py-3 px-4">Reporting Owner / Filer</th>
                        <th className="py-3 px-4">Form</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4 text-right">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 font-mono">
                      {deepDiveFilings.map((filing, index) => (
                        <tr key={index} className="hover:bg-zinc-50 text-zinc-600 transition-colors">
                          <td className="py-3.5 px-4 text-zinc-500">{filing.fileDate}</td>
                          <td className="py-3.5 px-4 font-bold text-zinc-900 uppercase tracking-tight">{filing.filerName}</td>
                          <td className="py-3.5 px-4 text-zinc-400">{filing.form}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex rounded bg-emerald-100 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 text-[9px] uppercase font-bold">
                              Insider Buy
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {filing.url ? (
                              <a
                                href={filing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-700 transition-colors"
                              >
                                EDGAR &rarr;
                              </a>
                            ) : (
                              <span className="text-zinc-400">OFFICIAL</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center font-mono text-zinc-400 text-xs uppercase tracking-wider">
                  No Form 4 insider transactional documents detected in SEC archives for this cycle.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="h-12 bg-zinc-100 border-t border-zinc-200 flex items-center px-6 text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-auto">
        <div className="mx-auto w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} FinSignal. demo purpose ledger</span>
        </div>
      </footer>
    </div>
  );
}
