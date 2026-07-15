"use client";
import { useEffect, useState } from "react";
import { getDailyHistory } from "@/lib/alphaVantage";
import { getInsiderFilings } from "@/lib/edgar";
import PriceChart from "@/components/PriceChart";

export default function TickerDetail({ params }) {
  const { symbol } = params;
  const [data, setData] = useState(null);
  const [filings, setFilings] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const history = await getDailyHistory(symbol);
      const insiderData = await getInsiderFilings(symbol);
      setData(history);
      setFilings(insiderData);
    }
    fetchData();
  }, [symbol]);

  if (!data) return <div className="text-center py-20 text-gray-500">Loading Market Data...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black">{symbol} Analysis</h1>
        <p className="text-gray-400">100-Day Performance & Forensic Indicators</p>
      </div>

      <PriceChart data={data} />

      <section>
        <h2 className="text-xl font-bold mb-4">Recent SEC Form 4 Filings (Insiders)</h2>
        <div className="overflow-x-auto border border-gray-800 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Filer</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filings.map((f, i) => (
                <tr key={i} className="hover:bg-gray-950">
                  <td className="p-4">{f._source.file_date}</td>
                  <td className="p-4 font-medium">{f._source.display_names[0]}</td>
                  <td className="p-4 text-gray-400">{f._source.root_form} - Insider Transaction</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filings.length === 0 && <p className="p-8 text-center text-gray-600">No recent insider filings found.</p>}
        </div>
      </section>
    </div>
  );
}
