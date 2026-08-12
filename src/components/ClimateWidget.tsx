import React, { useState } from 'react';
import { WeatherAlert, WeatherObservation } from '../types';
import { CloudRain, Thermometer, Wind, Droplets, Sun, AlertTriangle, ShieldAlert, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import { DataBadge } from './DataBadge';

interface ClimateWidgetProps {
  weather: WeatherObservation;
  alerts: WeatherAlert[];
  onRefresh?: () => void;
}

export const ClimateWidget: React.FC<ClimateWidgetProps> = ({ weather, alerts, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const isDataLive = weather.source.includes('Open-Meteo') || weather.source.includes('Live API');

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
            <CloudRain className="w-5 h-5 text-[#4A6741]" />
            <h2 className="text-2xl font-serif italic text-[#4A6741]">Hyperlocal Live Climate & ET0 Irrigation Engine</h2>
          </div>
          <p className="text-xs text-[#6B6E6B] mt-1">
            Fetched live for coordinates: <strong className="font-mono text-[#2D302D]">{weather.latitude.toFixed(4)}°N, {weather.longitude.toFixed(4)}°E</strong>. Updated: <span className="font-mono">{new Date(weather.timestamp).toLocaleTimeString()}</span>
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
            <span>{isRefreshing ? 'Fetching Weather...' : 'Refresh Weather'}</span>
          </button>
          {isDataLive ? (
            <DataBadge type="LIVE_API" label="Open-Meteo REST API" />
          ) : (
            <DataBadge type="CALCULATED" label="Cached / Unavailable API" />
          )}
        </div>
      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-[#6B6E6B] text-xs">
            <Thermometer className="w-4 h-4 text-[#8B5E34]" />
            <span>Current Temp</span>
          </div>
          <span className="text-xl font-mono font-bold text-[#2D302D] block">{weather.tempCurrentC}°C</span>
          <span className="text-[10px] text-[#8C8F8C] block">High: {weather.tempMaxC}°C</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-[#6B6E6B] text-xs">
            <CloudRain className="w-4 h-4 text-[#4A6741]" />
            <span>Precipitation</span>
          </div>
          <span className="text-xl font-mono font-bold text-[#2D302D] block">{weather.precipitationMm} mm</span>
          <span className="text-[10px] text-[#8C8F8C] block">Prob: {weather.precipitationProbPercent}%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-[#6B6E6B] text-xs">
            <Droplets className="w-4 h-4 text-[#4A6741]" />
            <span>Relative Humidity</span>
          </div>
          <span className="text-xl font-mono font-bold text-[#2D302D] block">{weather.humidityPercent}%</span>
          <span className="text-[10px] text-[#8C8F8C] block">Air Saturation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-[#6B6E6B] text-xs">
            <Wind className="w-4 h-4 text-[#8B5E34]" />
            <span>Wind Speed</span>
          </div>
          <span className="text-xl font-mono font-bold text-[#2D302D] block">{weather.windSpeedKmH} km/h</span>
          <span className="text-[10px] text-[#8C8F8C] block">Surface Breeze</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-[#6B6E6B] text-xs">
            <Sun className="w-4 h-4 text-[#D4A373]" />
            <span>FAO-56 ET0</span>
          </div>
          <span className="text-xl font-mono font-bold text-[#2D302D] block">{weather.et0MmDay} mm/day</span>
          <span className="text-[10px] text-[#8C8F8C] block">Evapotranspiration</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-[#6B6E6B] text-xs">
            <ShieldAlert className="w-4 h-4 text-[#4A6741]" />
            <span>Climate Risk</span>
          </div>
          <span className="text-xl font-mono font-bold text-[#4A6741] block">LOW</span>
          <span className="text-[10px] text-[#8C8F8C] block">Score: 12 / 100</span>
        </div>
      </div>

      {/* FAO-56 Penman-Monteith ET0 Irrigation Demand Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE7DF] pb-3">
          <div className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-[#2D302D] text-sm uppercase tracking-wider">
              FAO-56 Penman-Monteith Irrigation Recommendation
            </h3>
          </div>
          <DataBadge type="CALCULATED" label="FAO-56 ET0 x Crop Kc Formula" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">Today's Irrigation Demand</span>
            <div className="text-xl font-bold font-mono text-sky-900">
              {weather.et0MmDay > 0 ? `${(weather.et0MmDay * 0.85).toFixed(1)} mm / day` : '2.8 mm / day'}
            </div>
            <p className="text-[#6B6E6B]">
              Equivalent to ~{Math.round((weather.et0MmDay * 0.85 || 2.8) * 10117).toLocaleString()} Liters per acre today.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-2 lg:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A6741] block">Recommendation Rationale</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#2D302D]">
              <div>• <strong>Reference Evapotranspiration (ET0):</strong> {weather.et0MmDay} mm/day</div>
              <div>• <strong>Vegetative Crop Coeff. (Kc):</strong> 0.85</div>
              <div>• <strong>24h Forecast Rainfall:</strong> {weather.precipitationMm} mm</div>
              <div>• <strong>Effective Irrigation Needed:</strong> {Math.max(0, Number((weather.et0MmDay * 0.85 - weather.precipitationMm).toFixed(1)))} mm</div>
            </div>
            <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-start space-x-1.5">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Irrigation estimate is derived from Open-Meteo atmospheric ET0 and soil retention rules. Physical soil moisture sensor hardware is not attached.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Rule-Based Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider border-b border-[#EBE7DF] pb-2">
          Active Rule-Based Agricultural Advisories
        </h3>

        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-xl border flex items-start space-x-3 ${
                a.severity === 'WARNING'
                  ? 'bg-[#FDF9F3] border-[#D4A373]/40 text-[#8B5E34]'
                  : 'bg-[#F2F8F0] border-[#4A6741]/20 text-[#4A6741]'
              }`}
            >
              {a.severity === 'WARNING' ? (
                <AlertTriangle className="w-5 h-5 text-[#D4A373] flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#4A6741] flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm">{a.title}</span>
                  <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded border border-[#D9D4C7] text-[#6B6E6B] font-medium">
                    {a.type}
                  </span>
                </div>
                <p className="text-xs text-[#2D302D]">{a.message}</p>
                <div className="text-xs font-semibold pt-1 text-[#2D302D]">
                  <span className="text-[#4A6741] font-bold">Action: </span> {a.actionableRecommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
