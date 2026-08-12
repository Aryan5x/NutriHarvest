import React from 'react';
import { ShieldAlert, Database, Cpu, Activity, CheckCircle2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-[#F2EDE4] border-b border-[#D9D4C7] text-[#6B6E6B] py-2.5 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 text-[#4A6741] font-bold">
          <ShieldAlert className="w-4 h-4 text-[#4A6741] flex-shrink-0" />
          <span>Strict Anti-Hallucination Verified System:</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#6B6E6B] font-medium">
          <div className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-[#4A6741]" />
            <span>ICMR-NIN IFCT 2017 Nutrition</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-[#4A6741]" />
            <span>Open-Meteo REST Weather API</span>
          </div>
          <div className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>AGMARKNET Mandi Price Feed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-[#8B5E34]" />
            <span>XGBoost Yield Regressor (Real Ag ML Pipeline)</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6741]" />
            <span>OR-Tools Harvest LP Optimization</span>
          </div>
        </div>
      </div>
    </div>
  );
};
