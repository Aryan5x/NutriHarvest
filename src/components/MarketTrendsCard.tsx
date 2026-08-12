import React, { useState } from 'react';
import { MandiPriceRecord, PriceForecast } from '../types';
import { TrendingUp, Store, DollarSign, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { DataBadge } from './DataBadge';

interface MarketTrendsCardProps {
  records: MandiPriceRecord[];
  forecast: PriceForecast;
  onRefresh?: () => void;
}

export const MarketTrendsCard: React.FC<MarketTrendsCardProps> = ({ records, forecast, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    setLastRefreshedAt(new Date().toLocaleTimeString());
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-[#D4A373]" />
            <h2 className="text-2xl font-serif italic text-[#4A6741]">AGMARKNET Mandi Feed & Prophet Price Forecast</h2>
          </div>
          <p className="text-xs text-[#6B6E6B] mt-1">
            Official wholesale mandi arrival prices and 30-day time series price trend forecaster.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 bg-[#F2F8F0] hover:bg-[#E3EFE0] text-[#4A6741] border border-[#4A6741]/30 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
            title={`Last updated: ${lastRefreshedAt}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#4A6741] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Mandi...' : 'Refresh Mandi Prices'}</span>
          </button>
          <DataBadge type="DATASET" label="AGMARKNET Data.gov.in" />
          <DataBadge type="ML_MODEL" label="Prophet Time Series" />
        </div>
      </div>

      {/* Primary Forecast Display Card */}
      <div className="bg-[#4A6741] text-white p-6 rounded-2xl shadow-xs border border-[#3A5033] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
          <div>
            <span className="text-xs text-[#D4A373] font-bold uppercase tracking-wider block">Prophet Forecast Model</span>
            <h3 className="text-lg font-bold text-white">{forecast.commodity} — Best Selling Market Recommendation</h3>
          </div>
          <span className="bg-white/10 text-white border border-white/20 text-xs px-3 py-1 rounded-full font-bold">
            Trend: {forecast.trend}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <span className="text-white/80 block mb-1 uppercase tracking-wider text-[10px]">Latest Observed Modal Price</span>
            <span className="text-2xl font-mono font-bold text-[#D4A373]">₹{forecast.observedModalPrice} / kg</span>
            <span className="text-[10px] text-white/70 block mt-1">Mandi Arrival Feed</span>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <span className="text-white/80 block mb-1 uppercase tracking-wider text-[10px]">30-Day Forecasted Modal Price</span>
            <span className="text-2xl font-mono font-bold text-white">₹{forecast.forecastedModalPrice} / kg</span>
            <span className="text-[10px] text-white/80 block mt-1 font-mono">
              Conf. Interval: ₹{forecast.confidenceInterval[0]} - ₹{forecast.confidenceInterval[1]}
            </span>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <span className="text-white/80 block mb-1 uppercase tracking-wider text-[10px]">Recommended Selling Strategy</span>
            <span className="text-xs font-bold text-white block mt-1">{forecast.recommendedSellingWindow}</span>
            <span className="text-[10px] text-white/70 block mt-1 font-mono">Target Date: {forecast.forecastDate}</span>
          </div>
        </div>
      </div>

      {/* Observed Mandi Prices Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider border-b border-[#EBE7DF] pb-2">
          Verified Regional Mandi Arrival Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2EDE4] border-b border-[#D9D4C7] text-[#2D302D] font-bold">
                <th className="py-3 px-3">State / District</th>
                <th className="py-3 px-3">Mandi Market</th>
                <th className="py-3 px-3">Commodity</th>
                <th className="py-3 px-3">Variety</th>
                <th className="py-3 px-3">Min Price</th>
                <th className="py-3 px-3">Max Price</th>
                <th className="py-3 px-3">Modal Price (Target)</th>
                <th className="py-3 px-3">Arrival Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE7DF]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#F2EDE4]/40 transition-all">
                  <td className="py-3 px-3 font-semibold text-[#2D302D]">
                    {r.state} ({r.district})
                  </td>
                  <td className="py-3 px-3 text-[#6B6E6B]">{r.market}</td>
                  <td className="py-3 px-3 font-bold text-[#2D302D]">{r.commodity}</td>
                  <td className="py-3 px-3 text-[#6B6E6B]">{r.variety}</td>
                  <td className="py-3 px-3 text-[#6B6E6B] font-mono">₹{r.minPricePerKg}/kg</td>
                  <td className="py-3 px-3 text-[#6B6E6B] font-mono">₹{r.maxPricePerKg}/kg</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#4A6741]">₹{r.modalPricePerKg} / kg</td>
                  <td className="py-3 px-3 text-[#8C8F8C] font-mono">{r.arrivalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
