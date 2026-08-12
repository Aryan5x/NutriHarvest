import React, { useState, useEffect } from 'react';
import { FarmProgressService } from '../backend/farm_progress_service';
import { DailyFarmLog } from '../types';
import { Activity, Plus, Calendar, Droplets, CloudRain, ShieldAlert, CheckCircle2, Sprout, Trash2, RefreshCw } from 'lucide-react';
import { DataBadge } from './DataBadge';

interface FarmProgressTrackerProps {
  userId: string;
  defaultCropName?: string;
  defaultPlotName?: string;
  onRefresh?: () => void;
}

export const FarmProgressTracker: React.FC<FarmProgressTrackerProps> = ({
  userId,
  defaultCropName = 'Wheat',
  defaultPlotName = 'Main Plot A',
  onRefresh,
}) => {
  const [logs, setLogs] = useState<DailyFarmLog[]>([]);
  const [cropName, setCropName] = useState(defaultCropName);
  const [plotName, setPlotName] = useState(defaultPlotName);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [growthStage, setGrowthStage] = useState<DailyFarmLog['growthStage']>('VEGETATIVE');
  const [irrigationLiters, setIrrigationLiters] = useState<number>(3000);
  const [irrigationMethod, setIrrigationMethod] = useState('Drip / Tube-well');
  const [rainfallMm, setRainfallMm] = useState<number>(0);
  const [fertilizerUsed, setFertilizerUsed] = useState('Urea top-dressing (25 kg/acre)');
  const [pestObservation, setPestObservation] = useState('No active pests observed');
  const [cropCondition, setCropCondition] = useState<DailyFarmLog['cropCondition']>('EXCELLENT');
  const [activityNotes, setActivityNotes] = useState('Routine inspection and weeding completed.');
  const [isSaved, setIsSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  const loadLogs = () => {
    const data = FarmProgressService.getOrInitializeLogs(userId, cropName, plotName);
    setLogs(data);
    setLastRefreshedAt(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    loadLogs();
  }, [userId, cropName, plotName]);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    loadLogs();
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDeleteLog = (logId: string) => {
    if (window.confirm('Are you sure you want to delete this daily farm progress log entry?')) {
      FarmProgressService.deleteLogEntry(userId, logId);
      loadLogs();
      if (onRefresh) onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FarmProgressService.addLogEntry({
      userId,
      cropName,
      plotName,
      date,
      growthStage,
      irrigationLiters: Number(irrigationLiters),
      irrigationMethod,
      rainfallMm: Number(rainfallMm),
      fertilizerUsed,
      pestObservation,
      cropCondition,
      activityNotes,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    loadLogs();
  };

  const growthStageBadges: Record<DailyFarmLog['growthStage'], { bg: string; label: string }> = {
    SOWING: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: '1. Sowing / Planting' },
    VEGETATIVE: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: '2. Vegetative Growth' },
    FLOWERING: { bg: 'bg-purple-100 text-purple-800 border-purple-300', label: '3. Flowering / Reproductive' },
    GRAIN_FILLING: { bg: 'bg-sky-100 text-sky-800 border-sky-300', label: '4. Grain Filling / Podding' },
    HARVESTING: { bg: 'bg-orange-100 text-orange-800 border-orange-300', label: '5. Harvest Maturity' },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#4A6741]" />
            <h2 className="text-2xl font-serif italic text-[#4A6741]">Day-to-Day Farm Progress Tracker</h2>
          </div>
          <p className="text-xs text-[#6B6E6B] mt-1">
            Maintain daily activity logs, growth stage transitions, irrigation events, and pest observations for active crops.
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
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>
          <DataBadge type="USER" label="Farmer Daily Journal" />
          <DataBadge type="CALCULATED" label="Chronological Progress Timeline" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Entry Form */}
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs lg:col-span-1 space-y-4">
          <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider border-b border-[#EBE7DF] pb-2 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-[#4A6741]" />
            <span>Add Daily Farm Activity</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Crop</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Plot / Field</label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Log Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D] font-medium"
                >
                  <option value="SOWING">1. Sowing / Planting</option>
                  <option value="VEGETATIVE">2. Vegetative Growth</option>
                  <option value="FLOWERING">3. Flowering / Reproductive</option>
                  <option value="GRAIN_FILLING">4. Grain Filling / Podding</option>
                  <option value="HARVESTING">5. Harvest Maturity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Irrigation (Liters)</label>
                <input
                  type="number"
                  value={irrigationLiters}
                  onChange={(e) => setIrrigationLiters(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                />
              </div>
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Observed Rainfall (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rainfallMm}
                  onChange={(e) => setRainfallMm(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Fertilizer / Pesticide Applied</label>
              <input
                type="text"
                value={fertilizerUsed}
                onChange={(e) => setFertilizerUsed(e.target.value)}
                placeholder="e.g. Urea, DAP, Neem Oil"
                className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
              />
            </div>

            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Pest / Disease Observations</label>
              <input
                type="text"
                value={pestObservation}
                onChange={(e) => setPestObservation(e.target.value)}
                placeholder="e.g. Slight leaf yellowing on edges"
                className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
              />
            </div>

            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Overall Health Condition</label>
              <select
                value={cropCondition}
                onChange={(e) => setCropCondition(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
              >
                <option value="EXCELLENT">Excellent (Vigorous Growth)</option>
                <option value="GOOD">Good (Normal Development)</option>
                <option value="FAIR">Fair (Needs Moisture/Nutrients)</option>
                <option value="POOR">Poor (Stunted / High Stress)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Activity Notes</label>
              <textarea
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder="Details of labor, soil work, or weather observations"
                rows={2}
                className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#4A6741] text-white font-bold rounded-xl hover:bg-[#3A5033] transition-all"
            >
              Add Activity Log
            </button>

            {isSaved && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Log entry added to timeline!</span>
              </div>
            )}
          </form>
        </div>

        {/* Timeline View */}
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider border-b border-[#EBE7DF] pb-2 flex items-center justify-between">
            <span>Chronological Farm Timeline</span>
            <DataBadge type="USER" label="User Logged Timeline" />
          </h3>

          <div className="relative border-l-2 border-[#EBE7DF] pl-6 ml-3 space-y-6 max-h-[480px] overflow-y-auto pr-2">
            {logs.map((log) => {
              const stage = growthStageBadges[log.growthStage] || growthStageBadges.VEGETATIVE;
              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#4A6741] border-2 border-white ring-2 ring-[#4A6741]/20" />

                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE7DF] space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE7DF] pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#2D302D] text-sm">{log.cropName}</span>
                        <span className="text-[#6B6E6B]">({log.plotName})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stage.bg}`}>
                          {stage.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#4A6741] flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{log.date}</span>
                        </span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                          title="Delete journal entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[#2D302D] font-medium">{log.activityNotes}</p>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-[#EBE7DF] text-[11px]">
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Irrigation</span>
                        <span className="font-bold text-[#2D302D]">
                          {log.irrigationLiters ? `${log.irrigationLiters.toLocaleString()} L` : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Rainfall</span>
                        <span className="font-bold text-[#2D302D]">
                          {log.rainfallMm ? `${log.rainfallMm} mm` : '0 mm'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Fertilizer Applied</span>
                        <span className="font-bold text-[#2D302D] truncate block" title={log.fertilizerUsed}>
                          {log.fertilizerUsed || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Health Condition</span>
                        <span className="font-bold text-[#4A6741]">{log.cropCondition}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
