// Returns an array of alert objects
export function detectAnomalies(symbol, history, insiderFilings = []) {
    const alerts = [];

    if (history.length < 21) return alerts;

    const today = history[history.length - 1];
    const prev20 = history.slice(-21, -1);

    // Rule 1: Volume Spike
    /*
    *   Volume is defined as the number of shares traded during a given period.
    *   Volume spikes refer to the analysis of a stock's trading volume. If trades involving this specific
    * stock's spike up past 2-3 times the average volume involving this stock, then there is reason
    * to believe that this stock is likely subject to a Volume Spike.
    *   As volume fluctuates, it indicates that the market is spurring and that more money and action is
    * being spent within the stock market. Thus, indicating that some major events for a specific stock are
    * anticipated to take place.
    *   Any spikes equal to or above 2x the average deserves to be studied. When the spike reaches 3-5x,
    * bigger changes are underway within the market and deserve more attention. Lastly, 5x+ spikes
    * indicate information regarding aquisitions, earnings , or announcements are being released.
    *   This event does not necessarily indicate that something illegal is taking place, however, they are often
    * a baseline indicator that something deserves attention in case something suspcicious is taking place 
    * under the surface.
    *   In this site, volume spikes are being studied to determine if insiders are leveraging undisclosed
    * information in hopes to gain an advantage over less informed traders.
    *
    * --> Investing.com(https://www.investing.com/academy/trading/volume-spike-stock-move-definition/)
    * --> Investopedia.com(https://www.investopedia.com/terms/v/volume.asp)
    */
    const avgVolume = prev20.reduce((sum, d) => sum + d.volume, 0) / 20;
    const volumeRatio = today.volume / avgVolume;
    if (volumeRatio >= 2) {
        alerts.push({
            type: "VOLUME_SPIKE",
            symbol,
            severity: volumeRatio >= 4 ? "HIGH" : "MEDIUM",
            detail: 'Volume is ${volumeRatio.toFixed(1)}× the 20-day average (${today.volume.toLocaleString()} vs avg ${Math.round(avgVolume).toLocaleString()})',
            timestamp: today.date,
            rule: "Unusual volume can indicate informed trading ahead of undisclosed material events."
        });
    }

    // Rule 2: Single-Day Price Surge
    /**
     * When companies are planning to release their earnings 
     */
    const yesterday = history[history.length - 2];
    const priceChange = (today.close - yesterday.close) / yesterday.close;
    if (priceChange >= 0.05 && volumeRatio >= 1.5) {
        alerts.push({
            type: "PRICE_SURGE",
            symbol,
            severity: priceChange >= 0.10 ? "HIGH" : "MEDIUM",
            detail: 'Price rose ${(priceChange * 100).toFixed(1)}% on elevated volume — no broad market catalyst detected.',
            timestamp: today.date,
            rule: "Sharp price increases before public announcements are a hallmark of insider trading."
        });
    }

    // Rule 3: Pump-and-Dump Signal (penny stocks)
    if (today.close < 5 && history.length >= 6) {
        /*
        *Understanding Pump-and-Dump
        */
        const fiveDaysAgo = history[history.length - 6];
        const fiveDayGain = (today.close - fiveDaysAgo.close) / fiveDaysAgo.close;
        if (fiveDayGain >= 0.30) {
            alerts.push({
            type: "PUMP_SIGNAL",
            symbol,
            severity: fiveDayGain >= 0.60 ? "HIGH" : "MEDIUM",
            detail: 'Low-priced stock gained ${(fiveDayGain * 100).toFixed(1)}% in 5 days. Classic pump-and-dump pattern.',
            timestamp: today.date,
            rule: "Coordinated promotion of low-value stocks to inflate prices before insiders sell (dump)."
            });
        }
    }

    // Rule 4: Insider Cluster
    if (insiderFilings.length >= 3) {
        alerts.push({
            type: "INSIDER_CLUSTER",
            symbol,
            severity: insiderFilings.length >= 5 ? "HIGH" : "MEDIUM",
            detail: '${insiderFilings.length} insider Form 4 filings detected in the past 30 days.',
            timestamp: today.date,
            rule: "Clusters of insider purchases, especially ahead of price moves, may indicate material non-public information."
        });
    }

    // Call signature becomes: detectAnomalies(symbol, history, insiderFilings, sentimentSummary)

    // Rule 5: Sentiment-Price Divergence
    if (sentimentSummary && priceChange >= 0.04) {
        const noNewsCatalyst =
            sentimentSummary.count === 0 ||
            sentimentSummary.label === "No Data" ||
            sentimentSummary.label === "No Relevant News";

        const negativeSentimentWithPriceRise =
            sentimentSummary.score !== null &&
            sentimentSummary.score < -0.1 &&
            priceChange >= 0.04;

        if (noNewsCatalyst) {
            alerts.push({
                type: "UNEXPLAINED_MOVE",
                symbol,
                severity: "HIGH",
                detail: 'Price moved ${(priceChange * 100).toFixed(1)}% with no corresponding news coverage — no public catalyst identified.',
                timestamp: today.date,
                rule: "Price moves without public news catalysts are a primary indicator of informed trading on material non-public information (MNPI)."
            });
        } else if (negativeSentimentWithPriceRise) {
            alerts.push({
                type: "SENTIMENT_DIVERGENCE",
                symbol,
                severity: "MEDIUM",
                detail: 'Price rose ${(priceChange * 100).toFixed(1)}% while news sentiment is negative (score: ${sentimentSummary.score.toFixed(2)}). Contradicts public narrative.',
                timestamp: today.date,
                rule: "Price rising against negative news sentiment may indicate buying by parties with knowledge that contradicts public information."
            });
        }
    }

    return alerts;
}