import React, { useState } from 'react';
import { CandidateCrop, HarvestAllocation, ModelMetrics, NutritionCoverageScore, PriceForecast, WeatherObservation, WeatherAlert, HouseholdProfile, FarmProfile } from '../types';
import { Sprout, Heart, Store, Scale, Cpu, CloudRain, ShieldCheck, ArrowRight, DollarSign, Sparkles, RefreshCw } from 'lucide-react';

interface ExecutiveDashboardProps {
  farmer: HouseholdProfile;
  farm: FarmProfile;
  coverage: NutritionCoverageScore;
  candidates: CandidateCrop[];
  weather: WeatherObservation;
  alerts: WeatherAlert[];
  forecast: PriceForecast;
  allocation: HarvestAllocation;
  metrics: ModelMetrics;
  onNavigateTab: (tab: string) => void;
  onRefresh?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  farmer,
  farm,
  coverage,
  candidates,
  weather,
  alerts,
  forecast,
  allocation,
  metrics,
  onNavigateTab,
  onRefresh,
}) => {
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
      {/* Welcome Hero Banner - Natural Tones Theme */}
      <div className="bg-[#EBE7DF] text-[#2D302D] p-6 md:p-8 rounded-2xl shadow-xs border border-[#D9D4C7] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#F2F8F0] text-[#4A6741] text-xs px-3 py-1 rounded-md border border-[#4A6741]/20 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#4A6741]" />
            <span>Seasonal Decision Support Matrix</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-[#4A6741] tracking-tight">
            Welcome, {farmer.farmerName} — {farm.district}, {farm.state}
          </h1>
          <p className="text-sm text-[#6B6E6B] leading-relaxed">
            Optimizing for Family Nutrition & Market Surplus across your {farm.landAreaAcres}-acre farm. Synthesized dynamically via 5 specialized AI agents combining ICMR 2020 RDA guidelines and AGMARKNET market feeds.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="bg-[#4A6741] hover:bg-[#3A5033] text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
              title={`Last recalculated: ${lastRefreshedAt}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing All Data...' : 'Refresh All Dashboard Agents'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('gemini')}
              className="bg-[#F2F8F0] hover:bg-[#E3EFE0] text-[#4A6741] border border-[#4A6741]/30 px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>View Gemini Explanation & Voice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('profile')}
              className="bg-[#F2EDE4] hover:bg-[#D9D4C7] text-[#2D302D] border border-[#D9D4C7] px-4 py-2 rounded-xl font-medium transition-all cursor-pointer"
            >
              <span>Edit Farm Parameters</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Agent Key Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Nutrition Coverage */}
        <div
          onClick={() => onNavigateTab('nutrition')}
          className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs hover:border-[#D9D4C7] hover:shadow-sm transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6E6B]">1. Nutrition Coverage</span>
            <Heart className="w-5 h-5 text-[#4A6741] group-hover:scale-110 transition-all" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#2D302D]">{coverage.overallCoveragePercent}% RDA</div>
          <p className="text-xs text-[#6B6E6B]">
            {(coverage?.deficientNutrients || []).length === 0 ? 'All 7 nutrients met 100%' : `Deficits in ${(coverage?.deficientNutrients || []).join(', ')}`}
          </p>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-semibold text-[#4A6741] flex items-center justify-between">
            <span>ICMR-NIN IFCT 2017</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: XGBoost Yield */}
        <div
          onClick={() => onNavigateTab('crops')}
          className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs hover:border-[#D9D4C7] hover:shadow-sm transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6E6B]">2. Yield Prediction</span>
            <Cpu className="w-5 h-5 text-[#8B5E34] group-hover:scale-110 transition-all" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#2D302D]">{allocation.totalHarvestKg} kg</div>
          <p className="text-xs text-[#6B6E6B]">
            {(candidates || []).length} crops for {farm?.landAreaAcres || 0} acres
          </p>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-semibold text-[#8B5E34] flex items-center justify-between">
            <span>XGBoost Model (R² = {metrics.r2Score})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Mandi Market Forecast */}
        <div
          onClick={() => onNavigateTab('market')}
          className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs hover:border-[#D9D4C7] hover:shadow-sm transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6E6B]">3. Market Intelligence</span>
            <Store className="w-5 h-5 text-[#D4A373] group-hover:scale-110 transition-all" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#2D302D]">₹{forecast.forecastedModalPrice} / kg</div>
          <p className="text-xs text-[#6B6E6B]">30-day Prophet forecast ({forecast.trend})</p>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-semibold text-[#8B5E34] flex items-center justify-between">
            <span>AGMARKNET Mandi Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Net Income & OR-Tools Optimization */}
        <div
          onClick={() => onNavigateTab('allocation')}
          className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs hover:border-[#D9D4C7] hover:shadow-sm transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6E6B]">4. Finance & Allocation</span>
            <Scale className="w-5 h-5 text-[#4A6741] group-hover:scale-110 transition-all" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#2D302D]">₹{allocation.netExpectedIncomeInr.toLocaleString('en-IN')}</div>
          <p className="text-xs text-[#6B6E6B]">Optimal closed-loop harvest allocation</p>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-semibold text-[#4A6741] flex items-center justify-between">
            <span>OR-Tools Simplex Solver</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Climate & Weather Live Alert Bar */}
      <div
        onClick={() => onNavigateTab('climate')}
        className="bg-[#FDF9F3] p-5 rounded-2xl border border-[#D9D4C7] border-l-4 border-l-[#D4A373] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#F2EDE4] transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-[#EBE7DF] text-[#8B5E34]">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E34]">5. Hyperlocal Climate Advisory</span>
            <p className="text-sm font-bold text-[#2D302D] mt-0.5">
              Current: {weather.tempCurrentC}°C | Rain Prob: {weather.precipitationProbPercent}% | FAO ET0: {weather.et0MmDay} mm/day
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-[#8B5E34] flex items-center space-x-1">
          <span>{(alerts || []).length} Active Weather Advisories</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
