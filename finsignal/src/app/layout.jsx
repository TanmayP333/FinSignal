import './globals.css'; // Make sure your Tailwind directives are here
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'FinSignal — Suspicious Activity Monitor',
  description: 'Financial crimes tracking dashboard for market manipulation and anomaly detection.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#080b0f] text-[#c8d8e4] min-h-screen font-sans relative overflow-x-hidden selection:bg-[#e8a020]/30 selection:text-white">
        {/* Scanline overlay & Grid background matching the mockup */}
        <div className="fixed inset-0 pointer-events-none z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(30,42,53,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(30,42,53,0.4)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 flex flex-col h-screen">
          <NavBar />
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
