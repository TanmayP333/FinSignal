const EDGAR_BASE = "https://efts.sec.gov/LATEST/search-index";

// Search for Form 4 (insider trading) filings for a company
export async function getInsiderFilings(companyName) {
  const url = 'https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(companyName)}%22&dateRange=custom&startdt=${thirtyDaysAgo()}&forms=4';
  const res = await fetch(url, {
    headers: { "User-Agent": "FinSignal Research finsignal@example.com" }
    // SEC requires a User-Agent header — this is documented at https://www.sec.gov/developer
  });
  const data = await res.json();
  return data.hits?.hits || [];
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}