import React, { useState, useEffect } from 'react';
import { YieldTrackingAgent } from '../backend/yield_tracking_agent';
import { ActualYieldRecord, CandidateCrop } from '../types';
import { Scale, CheckCircle2, AlertCircle, Plus, Sparkles, LineChart, Trash2, RefreshCw } from 'lucide-react';
import { DataBadge } from './DataBadge';

interface YieldTrackingModalProps {
  userId: string;
  candidateCrops: CandidateCrop[];
  onClose?: () => void;
  onYieldUpdated?: () => void;
}

export const YieldTrackingModal: React.FC<YieldTrackingModalProps> = ({
  userId,
  candidateCrops,
  onYieldUpdated,
}) => {
  const [records, setRecords] = useState<ActualYieldRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const [accuracy, setAccuracy] = useState<{
    totalRecords: number;
    maeKg: number;
    meanErrorPercent: number;
    accuracyPercent: number;
    totalPredictedKg: number;
    totalActualKg: number;
  }>({
    totalRecords: 0,
    maeKg: 0,
    meanErrorPercent: 0,
    accuracyPercent: 0,
    totalPredictedKg: 0,
    totalActualKg: 0,
  });

  // Form State
  const [selectedCropId, setSelectedCropId] = useState<string>(candidateCrops[0]?.id || 'WHEAT');
  const [plotName, setPlotName] = useState('North Plot 1');
  const [acreage, setAcreage] = useState<number>(candidateCrops[0]?.recommendedAcreage || 1.0);
  const [actualYieldKg, setActualYieldKg] = useState<number>(1850);
  const [sowingDate, setSowingDate] = useState('2025-11-15');
  const [harvestDate, setHarvestDate] = useState('2026-03-20');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = () => {
    const recs = YieldTrackingAgent.getRecordsForUser(userId);
    setRecords(recs);
    const acc = YieldTrackingAgent.calculateUserYieldAccuracy(userId);
    setAccuracy(acc);
    setLastRefreshedAt(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    loadData();
    if (onYieldUpdated) {
      await onYieldUpdated();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this recorded harvest yield record? This will recompute dependent nutrition and model statistics.')) {
      YieldTrackingAgent.deleteYieldRecord(userId, recordId);
      loadData();
      if (onYieldUpdated) {
        onYieldUpdated();
      }
    }
  };

  const selectedCrop = candidateCrops.find((c) => c.id === selectedCropId) || candidateCrops[0];
  const predictedYield = selectedCrop ? Math.round(selectedCrop.predictedYieldKgPerAcre * acreage) : 1800;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) return;

    YieldTrackingAgent.saveYieldRecord({
      userId,
      cropId: selectedCrop.id,
      cropName: selectedCrop.name,
      plotName,
      acreage,
      sowingDate,
      harvestDate,
      predictedYieldKg: predictedYield,
      actualYieldKg: Number(actualYieldKg),
      notes,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    loadData();
    if (onYieldUpdated) {
      onYieldUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#4A6741]" />
            <h2 className="text-2xl font-serif italic text-[#4A6741]">Actual Harvest Yield & ML Feedback Loop</h2>
          </div>
          <p className="text-xs text-[#6B6E6B] mt-1">
            Log real post-harvest yields to evaluate prediction errors: <strong className="font-mono text-[#2D302D]">Prediction Error = Actual Yield - Predicted Yield</strong>.
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
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Records'}</span>
          </button>
          <DataBadge type="USER" label="Post-Harvest Log" />
          <DataBadge type="CALCULATED" label="Feedback Error Analysis" />
        </div>
      </div>

      {/* Historical Accuracy Metrics Card */}
      <div className="bg-[#4A6741] text-white p-6 rounded-2xl border border-[#3A5033] shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-white/80 block text-[11px] uppercase tracking-wider">Harvests Logged</span>
          <span className="text-2xl font-mono font-bold text-white">{accuracy.totalRecords}</span>
        </div>
        <div>
          <span className="text-white/80 block text-[11px] uppercase tracking-wider">Overall Model Accuracy</span>
          <span className="text-2xl font-mono font-bold text-[#D4A373]">
            {accuracy.totalRecords > 0 ? `${accuracy.accuracyPercent}%` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-white/80 block text-[11px] uppercase tracking-wider">Mean Absolute Error</span>
          <span className="text-2xl font-mono font-bold text-white">
            {accuracy.totalRecords > 0 ? `${accuracy.maeKg} kg` : '0 kg'}
          </span>
        </div>
        <div>
          <span className="text-white/80 block text-[11px] uppercase tracking-wider">Total Actual Harvest</span>
          <span className="text-2xl font-mono font-bold text-white">
            {accuracy.totalActualKg.toLocaleString()} kg
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form to Log New Harvest */}
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs lg:col-span-1 space-y-4">
          <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider border-b border-[#EBE7DF] pb-2 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-[#4A6741]" />
            <span>Record Post-Harvest Yield</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Crop Harvested</label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D] font-medium"
              >
                {candidateCrops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.season})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Plot / Field Name</label>
              <input
                type="text"
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={acreage}
                  onChange={(e) => setAcreage(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">ML Predicted Yield</label>
                <input
                  type="text"
                  value={`${predictedYield} kg`}
                  disabled
                  className="w-full p-2 rounded-lg border border-[#EBE7DF] bg-slate-100 font-mono text-slate-700 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Actual Measured Harvest (kg)</label>
              <input
                type="number"
                value={actualYieldKg}
                onChange={(e) => setActualYieldKg(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[#4A6741] bg-white text-[#2D302D] font-mono font-bold text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Sowing Date</label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                />
              </div>
              <div>
                <label className="block text-[#6B6E6B] font-medium mb-1">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#6B6E6B] font-medium mb-1">Field Observations / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Minor aphid attack in February; irrigated 4 times."
                rows={2}
                className="w-full p-2 rounded-lg border border-[#D9D4C7] bg-[#FAF8F5] text-[#2D302D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#4A6741] text-white font-bold rounded-xl hover:bg-[#3A5033] transition-all"
            >
              Save Harvest Log & Update Accuracy
            </button>

            {saveSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Yield record saved successfully!</span>
              </div>
            )}
          </form>
        </div>

        {/* Harvest Records List */}
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider border-b border-[#EBE7DF] pb-2 flex items-center justify-between">
            <span>Historical Yield Logs & Error Tracking</span>
            <DataBadge type="CALCULATED" label="Error = Actual - Predicted" />
          </h3>

          {records.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#D9D4C7] space-y-2">
              <Sparkles className="w-8 h-8 text-[#D4A373] mx-auto" />
              <p className="text-xs font-bold text-[#2D302D]">No post-harvest records logged yet.</p>
              <p className="text-[11px] text-[#6B6E6B] max-w-sm mx-auto">
                Use the form on the left to record your actual harvest yield after gathering your crop. This refines model accuracy tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {records.map((r) => {
                const isUnder = r.predictionErrorKg < 0;
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-[#EBE7DF] bg-[#FAF8F5] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#2D302D] text-sm">{r.cropName}</span>
                        <span className="text-[#6B6E6B]">({r.plotName} • {r.acreage} acres)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-[#8C8F8C] font-mono">
                          Logged: {new Date(r.loggedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                          title="Delete yield record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono">
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Predicted Yield</span>
                        <span className="font-bold text-[#2D302D]">{r.predictedYieldKg} kg</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Actual Harvest</span>
                        <span className="font-bold text-[#4A6741]">{r.actualYieldKg} kg</span>
                      </div>
                      <div>
                        <span className="text-[#6B6E6B] block text-[10px]">Prediction Variance</span>
                        <span className={`font-bold ${isUnder ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {r.predictionErrorKg > 0 ? `+${r.predictionErrorKg}` : r.predictionErrorKg} kg ({r.predictionErrorPercent}%)
                        </span>
                      </div>
                    </div>

                    {r.notes && (
                      <p className="text-[11px] text-[#6B6E6B] bg-white p-2 rounded border border-[#EBE7DF] italic">
                        "{r.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
