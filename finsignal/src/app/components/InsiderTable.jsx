export default function InsiderTable({ filings }) {
  if (!filings || filings.length === 0) {
    return (
      <div className="text-sm text-[#4a6070] p-6 text-center bg-[#141b22] border border-[#1e2a35] rounded">
        No recent Form 4 filings found for this entity.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[#1e2a35] rounded bg-[#141b22]">
      <table className="w-full text-left border-collapse font-mono text-[11px]">
        <thead>
          <tr>
            <th className="tracking-widest uppercase text-[#4a6070] px-4 py-2.5 border-b border-[#1e2a35] font-normal">Filing Date</th>
            <th className="tracking-widest uppercase text-[#4a6070] px-4 py-2.5 border-b border-[#1e2a35] font-normal">Reporting Filer</th>
            <th className="tracking-widest uppercase text-[#4a6070] px-4 py-2.5 border-b border-[#1e2a35] font-normal">Form</th>
            <th className="tracking-widest uppercase text-[#4a6070] px-4 py-2.5 border-b border-[#1e2a35] font-normal text-right">Accession No.</th>
          </tr>
        </thead>
        <tbody className="text-[#c8d8e4]">
          {filings.map((filing, idx) => {
            const source = filing._source;
            // Note: Full transaction details (Buy/Sell/Shares) require parsing the XBRL. 
            // As per your outline Step 8, we just populate metadata returned from the search endpoint.
            return (
              <tr key={idx} className="hover:bg-[#1e2a35]/40 transition-colors">
                <td className="px-4 py-3 border-b border-[#1e2a35]/50 text-[#7a9ab0]">
                  {source.fileDate}
                </td>
                <td className="px-4 py-3 border-b border-[#1e2a35]/50 font-sans text-[13px]">
                  {source.displayNames?.[0] || 'Unknown Filer'}
                </td>
                <td className="px-4 py-3 border-b border-[#1e2a35]/50">
                  <span className="bg-[#4a6070]/20 text-[#7a9ab0] px-2 py-0.5 rounded">
                    {source.form || '4'}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[#1e2a35]/50 text-right text-[#4a6070]">
                  <a 
                    href={`https://www.sec.gov/Archives/edgar/data/${source.ciks[0]}/${source.adsh.replace(/-/g, '')}/${source.adsh}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#4d9fff] transition-colors"
                  >
                    {source.adsh.substring(0, 14)}...
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
