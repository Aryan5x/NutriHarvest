import React from 'react';
import { Sprout, Wifi, WifiOff, User, RefreshCw, LogOut, Lock } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  session: UserSession;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  hasCompletedOnboarding?: boolean;
  onSignOut?: () => void;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  activeTab,
  setActiveTab,
  onOpenAuth,
  hasCompletedOnboarding = true,
  onSignOut,
  onNavigateHome,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Farm & Family' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'crops', label: 'Crop Plan & Yield' },
    { id: 'progress', label: 'Daily Farm Journal' },
    { id: 'yield_tracking', label: 'Harvest & Actual Yields' },
    { id: 'climate', label: 'Climate Alerts' },
    { id: 'market', label: 'Mandi Prices' },
    { id: 'allocation', label: 'Harvest Allocation' },
    { id: 'gemini', label: 'AI Explainer & Voice' },
    { id: 'provenance', label: 'Data Provenance' },
  ];

  return (
    <header className="bg-[#EBE7DF] text-[#2D302D] border-b border-[#D9D4C7] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else if (hasCompletedOnboarding) setActiveTab('dashboard');
            }}
          >
            <div className="w-9 h-9 rounded-lg bg-[#4A6741] flex items-center justify-center text-white font-bold shadow-xs">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-[#4A6741] font-serif">NutriHarvest AI</span>
                <span className="bg-[#F2F8F0] text-[#4A6741] text-[10px] px-2 py-0.5 rounded-md border border-[#4A6741]/20 font-semibold uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-xs text-[#6B6E6B] font-medium hidden sm:block">Crop-to-Plate Decision Support & Household Nutrition</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Connection status */}
            <div className="hidden md:flex items-center space-x-1.5 bg-[#F2EDE4] px-2.5 py-1.5 rounded-lg border border-[#D9D4C7] text-xs text-[#6B6E6B]">
              {session.isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#4A6741] animate-pulse" />
                  <span className="font-medium text-[#2D302D]">Services Live</span>
                </>
              )}
            </div>

            {/* User session & auth menu */}
            {session.isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 bg-[#F2F8F0] hover:bg-[#E3EFE0] text-[#4A6741] border border-[#4A6741]/30 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#4A6741]" />
                  <span className="max-w-[120px] truncate">{session.user?.farmerName || session.user?.email}</span>
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Sign Out"
                    className="flex items-center space-x-1 bg-[#8B5E34] hover:bg-[#6B4727] text-white text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-[#4A6741] hover:bg-[#3A5033] text-white text-xs px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        {hasCompletedOnboarding ? (
          <div className="flex space-x-1 overflow-x-auto pb-2 pt-1 no-scrollbar border-t border-[#D9D4C7]/60">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D9D4C7] text-[#4A6741] font-bold shadow-xs'
                      : 'text-[#6B6E6B] hover:text-[#2D302D] hover:bg-[#D9D4C7]/40 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-2 border-t border-[#D9D4C7]/60 flex items-center justify-between text-xs text-[#8B5E34]">
            <div className="flex items-center space-x-2 font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#8B5E34]" />
              <span>Mandatory Onboarding in Progress — Complete form below to unlock features</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#FDF9F3] text-[#8B5E34] px-2 py-0.5 rounded border border-[#D4A373]/30">
              Protected App State
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
