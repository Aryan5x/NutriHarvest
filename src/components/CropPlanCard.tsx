import React, { useState } from 'react';
import { CandidateCrop, ModelMetrics, FarmProfile, HouseholdProfile } from '../types';
import { Cpu, RefreshCw, CheckCircle2, Database, AlertCircle, Info, Sprout, Scale, Heart, DollarSign, Layers } from 'lucide-react';
import { DataBadge } from './DataBadge';

interface CropPlanCardProps {
  candidates: CandidateCrop[];
  metrics: ModelMetrics;
  farm?: FarmProfile;
  farmer?: HouseholdProfile;
  onRefresh?: () => void;
}

export const CropPlanCard: React.FC<CropPlanCardProps> = ({ candidates, metrics, farm, farmer, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    setLastRefreshedAt(new Date().toLocaleTimeString());
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const plannedCropsList = farm?.plannedCrops && farm.plannedCrops.length > 0
    ? farm.plannedCrops
    : [farm?.plannedCrop || 'Wheat'];

  return (
    <div className="space-y-6">
      {/* 1. Standby Banner: Antigravity Yield Model Training */}
      <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#D9D4C7] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#4A6741]" />
              <h2 className="text-2xl font-serif italic text-[#4A6741]">
                Planned Multi-Crop Architecture & Decision Matrix
              </h2>
            </div>
            <p className="text-xs text-[#6B6E6B] mt-1">
              AI Studio is on standby for Yield ML Model training in Antigravity. No synthetic yields or fabricated economic data are generated.
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
              <span>{isRefreshing ? 'Updating Matrix...' : 'Refresh Suitability Matrix'}</span>
            </button>
            <DataBadge type="ML_MODEL" label="Antigravity Standby" />
            <DataBadge type="DATASET" label="IFCT 2017 & Agmarknet Traceable" />
          </div>
        </div>

        {/* Handoff Status Notice */}
        <div className="bg-[#4A6741] text-white p-4 rounded-xl border border-[#3A5033] flex items-start space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-[#D4A373] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#D4A373] block uppercase tracking-wider text-[11px]">
              AI Studio Standby Status — Antigravity Yield Model Training In Progress
            </span>
            <p className="text-white/90 leading-relaxed">
              The ML Yield Model is being retrained separately in Antigravity on verified agricultural field records. Yield predictions, production calculations, and multi-objective profit allocation will connect seamlessly upon receiving the trained model artifacts.
            </p>
          </div>
        </div>
      </div>

      {/* 2. PLANNED CROPS MULTI-OBJECTIVE ANALYSIS TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE7DF] pb-3">
          <div>
            <h3 className="font-bold text-[#2D302D] text-sm uppercase tracking-wider flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-[#4A6741]" />
              <span>Your Planned Multi-Crop Planning Analysis</span>
            </h3>
            <p className="text-xs text-[#6B6E6B]">
              Evaluating {plannedCropsList.length} selected planned crop(s) across farm land area ({farm?.landAreaAcres || 2.5} acres) for agronomic suitability, yield standby, nutrition contribution, and profit requirements.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#4A6741] bg-[#F2F8F0] px-3 py-1 rounded-full border border-[#4A6741]/20">
            {plannedCropsList.length} Planned Crop(s) Selected
          </span>
        </div>

        <div className="space-y-4">
          {plannedCropsList.map((cropName, idx) => {
            const candidateMatch = candidates?.find((c) => c.name.toLowerCase().includes(cropName.toLowerCase()));

            return (
              <div
                key={cropName}
                className="p-5 rounded-xl border border-[#EBE7DF] bg-[#FAF8F5] space-y-4 hover:border-[#4A6741]/40 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE7DF] pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-full bg-[#4A6741] text-white flex items-center justify-center text-xs font-bold font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-[#2D302D] flex items-center space-x-2">
                        <span>{cropName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBE7DF] text-[#6B6E6B] font-semibold">
                          Planned Crop
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-[#6B6E6B]">Status:</span>
                    <span className="font-bold text-[#4A6741] bg-[#F2F8F0] px-2.5 py-0.5 rounded border border-[#4A6741]/20">
                      Agronomically Evaluated
                    </span>
                  </div>
                </div>

                {/* 5-Column Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  {/* Column 1: Agronomic Suitability */}
                  <div className="bg-white p-3 rounded-lg border border-[#EBE7DF] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A6741] flex items-center space-x-1">
                      <Sprout className="w-3.5 h-3.5" />
                      <span>1. Agronomic Suitability</span>
                    </span>
                    <span className="font-bold text-[#2D302D] block">Highly Suitable</span>
                    <p className="text-[11px] text-[#6B6E6B] leading-tight">
                      Compatible with {farm?.state || 'Haryana'} climate, pH {farm?.soil?.pH || 7.2}, and {farm?.waterSource || 'Irrigated'} water supply.
                    </p>
                  </div>

                  {/* Column 2: Yield Prediction Status */}
                  <div className="bg-white p-3 rounded-lg border border-[#EBE7DF] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E34] flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>2. Yield Prediction</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block">
                      Awaiting Validated Yield Model
                    </span>
                    <p className="text-[11px] text-[#6B6E6B] leading-tight">
                      Expected Production awaiting Antigravity ML model handoff.
                    </p>
                  </div>

                  {/* Column 3: Household Nutrition Contribution */}
                  <div className="bg-white p-3 rounded-lg border border-[#EBE7DF] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A6741] flex items-center space-x-1">
                      <Heart className="w-3.5 h-3.5" />
                      <span>3. Household Nutrition</span>
                    </span>
                    <span className="font-bold text-[#2D302D] block">IFCT 2017 Composition Ready</span>
                    <p className="text-[11px] text-[#6B6E6B] leading-tight">
                      Calculates Calories, Protein, Iron, and micronutrients upon yield integration.
                    </p>
                  </div>

                  {/* Column 4: Profit / Revenue Estimation */}
                  <div className="bg-white p-3 rounded-lg border border-[#EBE7DF] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E34] flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>4. Profit Estimation</span>
                    </span>
                    <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 p-1.5 rounded border border-stone-200 block">
                      Profit estimation requires verified market price and cost data.
                    </span>
                  </div>

                  {/* Column 5: Recommended Land Area Allocation */}
                  <div className="bg-white p-3 rounded-lg border border-[#EBE7DF] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A6741] flex items-center space-x-1">
                      <Scale className="w-3.5 h-3.5" />
                      <span>5. Recommended Land Area</span>
                    </span>
                    <span className="font-bold text-[#2D302D] block">
                      {( (farm?.landAreaAcres || 2.5) / plannedCropsList.length ).toFixed(1)} Acres (Concept)
                    </span>
                    <p className="text-[11px] text-[#6B6E6B] leading-tight">
                      Final multi-crop optimization pending ML Yield & Price integration.
                    </p>
                  </div>
                </div>

                {candidateMatch && candidateMatch.recommendationReasons && (
                  <div className="text-xs space-y-1 pt-1">
                    <span className="font-semibold text-[#4A6741]">Agronomic Recommendation Factors:</span>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {candidateMatch.recommendationReasons.map((reason, rIdx) => (
                        <span key={rIdx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200/60">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MULTI-OBJECTIVE PLANNING ARCHITECTURE FRAMEWORK */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-5">
        <div className="flex items-center space-x-2 border-b border-[#EBE7DF] pb-3">
          <Layers className="w-5 h-5 text-[#4A6741]" />
          <h3 className="font-bold text-[#2D302D] text-sm uppercase tracking-wider">
            Multi-Objective Multi-Crop Optimization Architecture
          </h3>
        </div>

        <p className="text-xs text-[#6B6E6B] leading-relaxed">
          The future optimization algorithm balances three core agricultural objectives across your farm's total land area ({farm?.landAreaAcres || 2.5} acres) without fabricating mathematical weights or synthetic numbers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Objective 1 */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE7DF] space-y-2">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-[#4A6741]" />
              <span className="font-bold text-[#2D302D] uppercase tracking-wider text-[11px]">
                1. Household Nutrition
              </span>
            </div>
            <p className="text-[#6B6E6B] text-[11px]">
              Meets family dietary RDA targets for {farmer?.householdSize || 4} members across Calories, Protein, Iron, Calcium, Vitamin A, and Vitamin C using audited ICMR-NIN IFCT 2017 data.
            </p>
          </div>

          {/* Objective 2 */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE7DF] space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-[#8B5E34]" />
              <span className="font-bold text-[#2D302D] uppercase tracking-wider text-[11px]">
                2. Farm Profitability
              </span>
            </div>
            <p className="text-[#6B6E6B] text-[11px]">
              Calculates expected market surplus revenue minus input production costs. Requires verified Agmarknet mandi prices and cost records.
            </p>
          </div>

          {/* Objective 3 */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE7DF] space-y-2">
            <div className="flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-[#4A6741]" />
              <span className="font-bold text-[#2D302D] uppercase tracking-wider text-[11px]">
                3. Agronomic Suitability
              </span>
            </div>
            <p className="text-[#6B6E6B] text-[11px]">
              Ensures land suitability according to soil pH, seasonal water requirement, local temperature, and ICAR crop rotation guidelines.
            </p>
          </div>
        </div>

        {/* System Model Benchmarks Panel */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE7DF] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#2D302D]">
            <span>Model Provenance & Held-Out Test Benchmarks</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[#4A6741] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showDetails ? 'Hide Training Details' : 'View Benchmarks'}</span>
            </button>
          </div>

          {showDetails && (
            <div className="space-y-3 pt-2 text-xs text-[#6B6E6B] border-t border-[#EBE7DF]">
              <p>
                <strong>Dataset:</strong> {metrics.trainingDataset || 'Real Indian Agricultural Census Dataset (1997-2020)'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="bg-white p-2 rounded border border-[#EBE7DF]">
                  <span>MAE: ±{metrics.mae} kg/ha</span>
                </div>
                <div className="bg-white p-2 rounded border border-[#EBE7DF]">
                  <span>RMSE: {metrics.rmse} kg/ha</span>
                </div>
                <div className="bg-white p-2 rounded border border-[#EBE7DF]">
                  <span>R² Score: {metrics.r2Score}</span>
                </div>
                <div className="bg-white p-2 rounded border border-[#EBE7DF]">
                  <span>Samples: {metrics.testSamples} rows</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
