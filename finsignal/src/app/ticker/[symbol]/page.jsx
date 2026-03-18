import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import {getDailyHistory} from "../lib/alphaVantage";
import {getInsiderFilings} from "../lib/edgar";
import {detectAnomalies} from "../lib/anomalyDetector";

const WATCHLIST = ["AMZN", "AAPL", "GS", "BA", "PLTR",
                "LMT", "WMT", "UNH", "XOM", "BRK.B",
                "AMCR", "ALMS", "TECX", "NVDA", "META"];


export default function IndexLineChart() {
    useEffect(() => {
            async function runScans(){
                const allAlerts = [];
    
                for(const symbol of WATCHLIST){
                    try{
                        const data = await getDailyHistory(symbol);
                    }
                    catch (err){
                        console.error('Failed to scan ${symbol}: ', err);
                    }
                }
    
                setAlerts(allAlerts);
                setLoading(false);
            }
            runScans();
        }, []);


        /*show users graph with price+volume - alphaVantage.js, table of insider filings - edgar.js, anomaly detector.js*/
    return (
        <LineChart style={{ width: '100%', aspectRatio: 1.618, maxWidth: 800, margin: 'auto' }} responsive data={data}>
        <CartesianGrid stroke="var(--color-border-3)" strokeDasharray="5 5" />

        <XAxis 
            dataKey="date" 
            stroke="#4a6070"
            tick={{ fill: "#4a6070", fontSize: 10 }}
            tickLine={false}
            interval="preserveStartEnd"
        />
        <YAxis 
            yAxisId="price"
            orientation="left"
            stroke="#4a6070"
            tick={{ fill: "#4a6070", fontSize: 10 }}
            tickLine={false}
            width={60}
            tickFormatter={(v) => '$${v.toFixed(0)}'}
        />
        <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke="#4a6070"
            tick={{ fill: "#4a6070", fontSize: 10 }}
            tickLine={false}
            width={70}
            tickFormatter={(v) => '${(v / 1_000_000).toFixed(1)}M'}
        />
        <Line
            type="monotone"
            dataKey="uv"
            stroke="var(--color-chart-1)"
            dot={{
                fill: 'var(--color-surface-base)',
            }}
            activeDot={{
                stroke: 'var(--color-surface-base)',
            }}
        />
        <Line
            type="monotone"
            dataKey="pv"
            stroke="var(--color-chart-2)"
            dot={{
                fill: 'var(--color-surface-base)',
            }}
            activeDot={{
                stroke: 'var(--color-surface-base)',
            }}
        />
        <Line
            type="monotone"
            dataKey="pv"
            stroke="var(--color-chart-2)"
            dot={{
                fill: 'var(--color-surface-base)',
            }}
            activeDot={{
                stroke: 'var(--color-surface-base)',
            }}
        />
        <RechartsDevtools />
        </LineChart>
    );
}