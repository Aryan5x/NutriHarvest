import React from 'react';
import { DataProvenanceItem } from '../types';
import { Database, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DataSourcesModalProps {
  sources: DataProvenanceItem[];
}

export const DataSourcesModal: React.FC<DataSourcesModalProps> = ({ sources }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#4A6741]" />
            <h2 className="text-2xl font-serif italic text-[#4A6741]">Verified Data Sources & Provenance Registry</h2>
          </div>
          <p className="text-xs text-[#6B6E6B] mt-1">
            Complete transparency registry for external datasets, REST APIs, and ML model training sources.
          </p>
        </div>

        <div className="bg-[#F2F8F0] px-3.5 py-1.5 rounded-xl border border-[#4A6741]/20 text-xs font-bold text-[#4A6741] flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-[#4A6741]" />
          <span>Zero-Hallucination Compliance</span>
        </div>
      </div>

      {/* Sources List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div key={src.id} className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-[#EBE7DF] pb-2.5">
              <div>
                <span className="text-[10px] text-[#4A6741] font-bold uppercase tracking-wider block font-mono">{src.id}</span>
                <h3 className="text-sm font-bold text-[#2D302D]">{src.name}</h3>
              </div>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                  src.status === 'LIVE_CONNECTED'
                    ? 'bg-[#F2F8F0] text-[#4A6741] border border-[#4A6741]/20'
                    : 'bg-[#FDF9F3] text-[#8B5E34] border border-[#D4A373]/30'
                }`}
              >
                {src.status}
              </span>
            </div>

            <p className="text-xs text-[#6B6E6B] leading-relaxed">{src.description}</p>

            <div className="pt-2 border-t border-[#EBE7DF] text-[11px] text-[#6B6E6B] space-y-1">
              <div>
                <span className="font-bold text-[#2D302D]">Provider:</span> {src.provider}
              </div>
              <div>
                <span className="font-bold text-[#2D302D]">License:</span> {src.license}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[10px] text-[#8C8F8C]">Retrieved: {src.retrievedAt}</span>
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4A6741] hover:text-[#3A5033] font-bold flex items-center space-x-1"
                >
                  <span>Verify Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
