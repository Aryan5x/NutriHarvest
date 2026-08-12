import React, { useState } from 'react';
import { NutritionCoverageScore, NutrientTarget } from '../types';
import { HeartPulse, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw, Sprout, Database, Calendar } from 'lucide-react';
import { DataBadge } from './DataBadge';
import { getCropNutritionInfo } from '../data/ifct2017_nutrition';

interface NutritionSourceInfo {
  yieldSource: 'ACTUAL' | 'PREDICTED';
  yieldLabel: string;
  activeCrops: Array<{
    cropId: string;
    cropName: string;
    yieldKg: number;
    source: 'ACTUAL' | 'PREDICTED';
  }>;
}

interface NutritionDashboardProps {
  coverage: NutritionCoverageScore;
  target: NutrientTarget;
  achieved: NutrientTarget;
  sourceInfo?: NutritionSourceInfo;
  onRefresh?: () => void;
  onNavigateToFarm?: () => void;
}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  coverage,
  target,
  achieved,
  sourceInfo,
  onRefresh,
  onNavigateToFarm,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  const deficientGaps = coverage?.deficientNutrients || [];
  const recommendedFoods = coverage?.recommendedFoodsToFillGaps || [];
  const activeCrops = sourceInfo?.activeCrops || [];

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    setLastRefreshedAt(new Date().toLocaleTimeString());
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const nutrients = [
    { name: 'Protein', unit: 'g', achieved: Math.round(achieved.proteinGrams), target: Math.round(target.proteinGrams), score: coverage?.proteinCoveragePercent || 0 },
    { name: 'Iron', unit: 'mg', achieved: Math.round(achieved.ironMg), target: Math.round(target.ironMg), score: coverage?.ironCoveragePercent || 0 },
    { name: 'Calcium', unit: 'mg', achieved: Math.round(achieved.calciumMg), target: Math.round(target.calciumMg), score: coverage?.calciumCoveragePercent || 0 },
    { name: 'Vitamin A', unit: 'mcg', achieved: Math.round(achieved.vitaminAMcg), target: Math.round(target.vitaminAMcg), score: coverage?.vitaminACoveragePercent || 0 },
    { name: 'Vitamin C', unit: 'mg', achieved: Math.round(achieved.vitaminCMg), target: Math.round(target.vitaminCMg), score: coverage?.vitaminCCoveragePercent || 0 },
    { name: 'Dietary Fiber', unit: 'g', achieved: Math.round(achieved.fiberGrams), target: Math.round(target.fiberGrams), score: coverage?.fiberCoveragePercent || 0 },
    { name: 'Calories', unit: 'kcal', achieved: Math.round(achieved.caloriesKcal), target: Math.round(target.caloriesKcal), score: coverage?.caloriesCoveragePercent || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Stage Pipeline Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EBE7DF] pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <HeartPulse className="w-5 h-5 text-[#4A6741]" />
              <h2 className="text-2xl font-serif italic text-[#4A6741]">User-Specific Household Nutrition Engine</h2>
            </div>
            <p className="text-xs text-[#6B6E6B] mt-1">
              Direct ICMR 2020 RDA & ICMR-NIN IFCT 2017 calculation pipeline based strictly on your household demographics.
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
              <span>{isRefreshing ? 'Recalculating...' : 'Refresh Nutrition'}</span>
            </button>
            <DataBadge type="USER" label="Household Demographics" />
            <DataBadge type="DATASET" label="ICMR 2020 RDA & IFCT 2017" />
          </div>
        </div>

        {/* Yield Source Banner */}
        {sourceInfo && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              sourceInfo.yieldSource === 'ACTUAL'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              {sourceInfo.yieldSource === 'ACTUAL' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">{sourceInfo.yieldLabel}</span>
                <span className="text-xs opacity-80 block">
                  {sourceInfo.yieldSource === 'ACTUAL'
                    ? 'Nutritional values are calculated directly from your logged harvest yields.'
                    : 'Nutritional values are estimated based on your planned/predicted crop yields.'}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono border bg-white/80 shadow-2xs">
              {sourceInfo.yieldSource === 'ACTUAL' ? 'ACTUAL HARVEST DATA' : 'PREDICTED YIELD DATA'}
            </span>
          </div>
        )}

        {/* 4 Pipeline Stages Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Stage 1: Required Nutrition</span>
            <span className="font-bold text-slate-800 text-sm block">Household Monthly RDA</span>
            <span className="text-[11px] text-slate-600 font-mono">
              Protein: {Math.round(target.proteinGrams)}g | Iron: {Math.round(target.ironMg)}mg
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">Stage 2: Harvest Yield Allocation</span>
            <span className="font-bold text-sky-900 text-sm block">Farm Food Reservation</span>
            <span className="text-[11px] text-sky-700 font-mono">
              Protein: {Math.round(achieved.proteinGrams)}g | Iron: {Math.round(achieved.ironMg)}mg
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border space-y-1 ${deficientGaps.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${deficientGaps.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>Stage 3: Identified Gaps</span>
            <span className="font-bold text-slate-900 text-sm block">
              {deficientGaps.length > 0 ? `${deficientGaps.length} Gaps Detected` : '100% RDA Met'}
            </span>
            <span className="text-[11px] font-medium text-slate-700 block truncate">
              {deficientGaps.length > 0 ? deficientGaps.join(', ') : 'Fully Covered'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-800 text-white border border-emerald-900 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Stage 4: Crop Solutions</span>
            <span className="font-bold text-white text-sm block">Targeted Crop Planting</span>
            <span className="text-[11px] text-emerald-100 block">
              {recommendedFoods.length} crop options specified
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Crop Production & Nutrient Output Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE7DF] pb-3">
          <div>
            <h3 className="font-bold text-[#2D302D] text-sm uppercase tracking-wider">
              Nutritional Output Per Active Crop
            </h3>
            <p className="text-xs text-[#6B6E6B]">
              Calculated using quantity produced × verified ICMR-NIN IFCT 2017 nutritional composition dataset.
            </p>
          </div>
          <DataBadge type="DATASET" label="ICMR-NIN IFCT 2017" />
        </div>

        {activeCrops.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#D9D4C7] space-y-3">
            <Sprout className="w-8 h-8 text-[#4A6741] mx-auto" />
            <p className="text-xs font-bold text-[#2D302D]">
              No data available yet. Add your farm and crop information to get started.
            </p>
            {onNavigateToFarm && (
              <button
                onClick={onNavigateToFarm}
                className="px-4 py-2 bg-[#4A6741] text-white font-bold rounded-xl text-xs hover:bg-[#3A5033] transition-all cursor-pointer"
              >
                Add Farm & Crop Details
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {activeCrops.map((c, idx) => {
              const ifct = getCropNutritionInfo(c.cropName) || getCropNutritionInfo(c.cropId);
              const multiplier = c.yieldKg * 10; // 1 kg = 10 * 100g

              return (
                <div key={idx} className="p-4 rounded-xl border border-[#EBE7DF] bg-[#FAF8F5] space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE7DF] pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#2D302D] text-sm">{c.cropName}</span>
                      <span className="font-mono text-xs font-bold text-[#4A6741] bg-white px-2 py-0.5 rounded border border-[#EBE7DF]">
                        {c.yieldKg.toLocaleString()} kg produced
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.source === 'ACTUAL' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {c.source === 'ACTUAL' ? 'Actual Recorded Yield' : 'Predicted Yield'}
                      </span>
                    </div>

                    {ifct ? (
                      <span className="text-[10px] text-[#6B6E6B] font-mono bg-white px-2 py-1 rounded border border-[#EBE7DF]">
                        Source: {ifct.provenance}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-300 font-medium">
                        Verified nutrition dataset entry required for {c.cropName}
                      </span>
                    )}
                  </div>

                  {ifct && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-white p-3 rounded-lg border border-[#EBE7DF] font-mono text-[11px]">
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Protein</span>
                        <span className="font-bold text-[#2D302D]">{(ifct.per100g.proteinGrams * multiplier / 1000).toFixed(1)} kg</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Calories</span>
                        <span className="font-bold text-[#2D302D]">{(ifct.per100g.caloriesKcal * multiplier).toLocaleString()} kcal</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Iron</span>
                        <span className="font-bold text-[#2D302D]">{(ifct.per100g.ironMg * multiplier / 1000).toFixed(2)} kg</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Calcium</span>
                        <span className="font-bold text-[#2D302D]">{(ifct.per100g.calciumMg * multiplier / 1000).toFixed(2)} kg</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Vitamin A</span>
                        <span className="font-bold text-[#2D302D]">{(ifct.per100g.vitaminAMcg * multiplier / 1000).toFixed(2)} mg</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Vitamin C</span>
                        <span className="font-bold text-[#2D302D]">{(ifct.per100g.vitaminCMg * multiplier / 1000).toFixed(2)} g</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Dietary Fiber</span>
                        <span className="font-bold text-[#2D302D]">{(ifct.per100g.fiberGrams * multiplier / 1000).toFixed(1)} kg</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Overview Ring & Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-[#F2F8F0] border-4 border-[#4A6741] shadow-xs">
            <div className="text-center">
              <span className="text-2xl font-mono font-bold text-[#4A6741] block">{coverage?.overallCoveragePercent || 0}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6E6B]">RDA Score</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2D302D]">Overall Household Dietary Fulfillment</h3>
            <p className="text-xs text-[#6B6E6B] mt-1 max-w-md">
              Score represents weighted coverage across 7 macronutrients and micronutrients for your age group mix.
            </p>
          </div>
        </div>

        {/* Micronutrient Deficiencies Badge */}
        <div className="w-full md:w-auto bg-[#FDF9F3] p-4 rounded-xl border border-[#D9D4C7] min-w-[280px]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6E6B] block mb-2">Identified Nutrient Status</span>
          {deficientGaps.length === 0 ? (
            <div className="flex items-center space-x-2 text-[#4A6741] text-xs font-semibold bg-[#F2F8F0] p-2.5 rounded-lg border border-[#4A6741]/20">
              <CheckCircle2 className="w-4 h-4 text-[#4A6741] flex-shrink-0" />
              <span>All key macronutrients & micronutrients meet 100% RDA!</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-[#8B5E34] text-xs font-semibold bg-[#FDF9F3] p-2 rounded-lg border border-[#D4A373]/40">
                <AlertCircle className="w-4 h-4 text-[#D4A373] flex-shrink-0" />
                <span>Gaps found in: {deficientGaps.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Progress Bars */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider border-b border-[#EBE7DF] pb-2">
          Nutrient-by-Nutrient Breakdown vs Monthly Target
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nutrients.map((n) => {
            const isDeficit = n.score < 80;
            return (
              <div key={n.name} className="p-3.5 rounded-xl bg-[#F2EDE4]/60 border border-[#EBE7DF] space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-[#2D302D] font-bold">{n.name}</span>
                  <span className="text-[#6B6E6B] font-mono">
                    {n.achieved} / {n.target} {n.unit} (<strong className={isDeficit ? 'text-[#8B5E34]' : 'text-[#4A6741]'}>{n.score}%</strong>)
                  </span>
                </div>
                <div className="w-full bg-[#F0EFEC] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isDeficit ? 'bg-[#D4A373]' : 'bg-[#4A6741]'} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(100, n.score)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap Fill Recommendations */}
      {recommendedFoods.length > 0 && (
        <div className="bg-[#4A6741] text-white p-6 rounded-2xl border border-[#3A5033] shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm uppercase tracking-wider opacity-90">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>Targeted Crop-Diet Match Recommendations</span>
          </div>
          <ul className="space-y-2 text-xs text-white/90 pl-2">
            {recommendedFoods.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-[#D4A373] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
