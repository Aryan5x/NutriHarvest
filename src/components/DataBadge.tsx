import React from 'react';

export type DataBadgeType = 'USER' | 'LIVE_API' | 'DATASET' | 'ML_MODEL' | 'CALCULATED';

interface DataBadgeProps {
  type: DataBadgeType;
  label?: string;
  className?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ type, label, className = '' }) => {
  const configs: Record<DataBadgeType, { bg: string; text: string; border: string; dot: string; defaultLabel: string }> = {
    USER: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      dot: 'bg-emerald-500',
      defaultLabel: 'User-Provided Data',
    },
    LIVE_API: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800/50',
      dot: 'bg-sky-500 animate-pulse',
      defaultLabel: 'Live API Data',
    },
    DATASET: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800/50',
      dot: 'bg-purple-500',
      defaultLabel: 'Verified Dataset',
    },
    ML_MODEL: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/50',
      dot: 'bg-amber-500',
      defaultLabel: 'ML Model Prediction',
    },
    CALCULATED: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
      defaultLabel: 'Calculated Metric',
    },
  };

  const config = configs[type] || configs.CALCULATED;
  const displayText = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
      title={`Data Provenance: ${displayText}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayText}</span>
    </span>
  );
};
