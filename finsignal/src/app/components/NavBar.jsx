'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Alert Feed', path: '/' },
    { name: 'Watchlist', path: '/watchlist' },
    { name: 'Methodology', path: '/methodology' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#080b0f]/92 backdrop-blur-md border-b border-[#1e2a35] px-7 h-[52px] flex items-center justify-between">
      {/* Logo Area */}
      <div className="flex items-center gap-2.5 font-['Barlow_Condensed'] font-extrabold text-xl tracking-widest text-[#e8a020] uppercase">
        <div className="w-7 h-7 flex items-end gap-[2px]">
          <span className="block w-[5px] bg-[#e8a020] rounded-t-[1px] animate-[pulse_2.4s_ease-in-out_infinite] h-[10px]"></span>
          <span className="block w-[5px] bg-[#e8a020] rounded-t-[1px] animate-[pulse_2.4s_ease-in-out_infinite_0.2s] h-[18px]"></span>
          <span className="block w-[5px] bg-[#e8a020] rounded-t-[1px] animate-[pulse_2.4s_ease-in-out_infinite_0.4s] h-[12px]"></span>
          <span className="block w-[5px] bg-[#e8a020] rounded-t-[1px] animate-[pulse_2.4s_ease-in-out_infinite_0.1s] h-[22px]"></span>
        </div>
        <div>FIN<span className="text-[#c8d8e4]">SIGNAL</span><sub className="text-[10px] text-[#4a6070] font-normal tracking-[0.14em] ml-1 align-middle">MARKET SURVEILLANCE</sub></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name}>
              <button className={`font-mono text-xs tracking-wider px-3.5 py-1.5 rounded-[3px] uppercase transition-all duration-150 border ${
                isActive 
                  ? 'text-[#e8a020] bg-[#e8a020]/10 border-[#e8a020]/25' 
                  : 'text-[#7a9ab0] border-transparent hover:text-[#c8d8e4] hover:bg-[#141b22]'
              }`}>
                {item.name}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#00c878] tracking-wider">
          <div className="w-1.5 h-1.5 bg-[#00c878] rounded-full animate-[pulse_1.8s_ease-in-out_infinite]"></div>
          LIVE
        </div>
        <div className="font-mono text-[11px] text-[#4a6070]">MARKET OPEN</div>
      </div>
    </nav>
  );
}
