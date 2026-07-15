import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "FinSignal | Financial Crime Tracker",
  description: "Market surveillance dashboard for anomaly detection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
