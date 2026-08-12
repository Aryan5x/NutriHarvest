import React from 'react';
import { HarvestAllocation, CandidateCrop } from '../types';
import { Scale, Heart, ShoppingBag, Archive, Shield, Sprout, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HarvestAllocationOptimizerProps {
  crop: CandidateCrop;
  allocation: HarvestAllocation;
  onSolve: () => void;
}

export const HarvestAllocationOptimizer: React.FC<HarvestAllocationOptimizerProps> = ({
  crop,
  allocation,
  onSolve,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#4A6741]" />
            <h2 className="text-2xl font-serif italic text-[#4A6741]">Closed-Loop OR-Tools Harvest Allocation Solver</h2>
          </div>
          <p className="text-xs text-[#6B6E6B] mt-1">
            Simplex Linear Programming allocating harvest between family nutrition, market sale, storage, emergency reserve, and seeds.
          </p>
        </div>

        <button
          onClick={onSolve}
          className="bg-[#4A6741] hover:bg-[#3A5033] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xs transition-all"
        >
          <Scale className="w-4 h-4 text-white" />
          <span>Re-Run OR-Tools Optimization</span>
        </button>
      </div>

      {/* Feasibility Alert */}
      {!allocation.isFeasible ? (
        <div className="bg-[#FDF9F3] border border-[#D4A373]/40 p-4 rounded-2xl flex items-start space-x-3 text-[#8B5E34] text-xs">
          <AlertCircle className="w-5 h-5 text-[#D4A373] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">Constraint Conflict / Infeasible State</span>
            <p className="mt-1">{allocation.constraintWarnings[0]}</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#F2F8F0] border border-[#4A6741]/20 p-4 rounded-2xl flex items-center space-x-3 text-[#4A6741] text-xs">
          <CheckCircle2 className="w-5 h-5 text-[#4A6741] flex-shrink-0" />
          <div>
            <span className="font-bold block text-sm">Feasible Optimal LP Solution Found</span>
            <p className="text-[#2D302D]">100% of harvest ({allocation.totalHarvestKg} kg) allocated without violating family nutrition or storage bounds.</p>
          </div>
        </div>
      )}

      {/* 5-Way Allocation Vector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Family Consumption */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-[#4A6741]">
            <Heart className="w-5 h-5 fill-[#F2F8F0]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D302D]">Family Food</span>
          </div>
          <span className="text-2xl font-mono font-bold text-[#2D302D] block">{allocation.familyConsumptionKg} kg</span>
          <span className="text-[11px] text-[#6B6E6B] block">3-Month Household Nutrition</span>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-bold text-[#4A6741]">
            {allocation.nutritionSatisfactionScorePercent}% RDA Covered
          </div>
        </div>

        {/* 2. Immediate Market Sale */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-[#4A6741]">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D302D]">Mandi Sale</span>
          </div>
          <span className="text-2xl font-mono font-bold text-[#2D302D] block">{allocation.marketSaleKg} kg</span>
          <span className="text-[11px] text-[#6B6E6B] block">Immediate Cash Revenue</span>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-mono font-medium text-[#6B6E6B]">
            Transport: -₹{allocation.transportCostInr}
          </div>
        </div>

        {/* 3. Storage for Future Sale */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-[#D4A373]">
            <Archive className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D302D]">Storage</span>
          </div>
          <span className="text-2xl font-mono font-bold text-[#2D302D] block">{allocation.storageKg} kg</span>
          <span className="text-[11px] text-[#6B6E6B] block">Hold for Peak Price</span>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-mono font-medium text-[#6B6E6B]">
            Storage Cost: -₹{allocation.storageCostInr}
          </div>
        </div>

        {/* 4. Emergency Buffer */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-[#4A6741]">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D302D]">Emergency Buffer</span>
          </div>
          <span className="text-2xl font-mono font-bold text-[#2D302D] block">{allocation.emergencyBufferKg} kg</span>
          <span className="text-[11px] text-[#6B6E6B] block">Climate Risk Protection</span>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-bold text-[#4A6741]">
            7% Resilience Safety
          </div>
        </div>

        {/* 5. Seed Reserve */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-[#4A6741]">
            <Sprout className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D302D]">Seed Reserve</span>
          </div>
          <span className="text-2xl font-mono font-bold text-[#2D302D] block">{allocation.seedReserveKg} kg</span>
          <span className="text-[11px] text-[#6B6E6B] block">Next Crop Planting</span>
          <div className="pt-2 border-t border-[#EBE7DF] text-[11px] font-bold text-[#4A6741]">
            5% Self-Sufficiency
          </div>
        </div>
      </div>

      {/* Net Expected Income Optimization Result */}
      <div className="bg-[#4A6741] text-white p-6 rounded-2xl shadow-xs border border-[#3A5033] space-y-4">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-[#D4A373]" />
            <h3 className="text-lg font-bold text-white">Net Expected Farmer Income (Post-Costs)</h3>
          </div>
          <span className="text-3xl font-mono font-bold text-[#D4A373]">₹{allocation.netExpectedIncomeInr.toLocaleString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/90">
          <div>
            <span className="text-white/70 uppercase tracking-wider text-[10px] block">Immediate Mandi Revenue</span>
            <span className="font-mono font-bold text-white text-sm">₹{(allocation.marketSaleKg * 23.5).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-white/70 uppercase tracking-wider text-[10px] block">Future Forecasted Storage Revenue</span>
            <span className="font-mono font-bold text-white text-sm">₹{Math.round(allocation.storageKg * 25.0 * 0.95).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-white/70 uppercase tracking-wider text-[10px] block">Total Operational Costs (Input + Transport + Storage)</span>
            <span className="font-mono font-bold text-[#D4A373] text-sm">-₹{Math.round(crop.costPerAcreInr * crop.recommendedAcreage + allocation.transportCostInr + allocation.storageCostInr).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
