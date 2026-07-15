import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-black py-4 px-6 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl">📊</span>
        <span className="font-bold text-white tracking-tight text-xl">FinSignal</span>
      </Link>
      <div className="flex gap-6 text-sm font-medium text-gray-400">
        <Link href="/" className="hover:text-white transition">Dashboard</Link>
        <Link href="/methodology" className="hover:text-white transition">Methodology</Link>
        <a href="https://github.com" target="_blank" className="hover:text-white transition">GitHub</a>
      </div>
    </nav>
  );
}
