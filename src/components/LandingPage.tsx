import React from 'react';
import { Sprout, ShieldCheck, Sparkles, HeartPulse, CloudSun, TrendingUp, ArrowRight, CheckCircle2, Lock, Scale, Award, MessageSquareText } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D302D] font-sans flex flex-col selection:bg-[#4A6741] selection:text-white">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#EBE7DF] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A6741] flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-2xl tracking-tight text-[#4A6741] font-serif">NutriHarvest AI</span>
                <span className="bg-[#F2F8F0] text-[#4A6741] text-[10px] px-2.5 py-0.5 rounded-full border border-[#4A6741]/20 font-bold uppercase tracking-wider">
                  v1.0 Live
                </span>
              </div>
              <p className="text-xs text-[#6B6E6B] font-medium hidden sm:block">
                Crop-to-Plate Decision Support & Household Nutrition Planner
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLogin}
              className="text-xs font-bold text-[#2D302D] hover:text-[#4A6741] px-4 py-2.5 rounded-xl border border-[#D9D4C7] hover:bg-[#F2EDE4] transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="text-xs font-bold text-white bg-[#4A6741] hover:bg-[#3A5033] px-5 py-2.5 rounded-xl shadow-xs hover:shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-[#F2F8F0] border border-[#4A6741]/25 px-4 py-1.5 rounded-full text-xs font-bold text-[#4A6741] mb-6 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#4A6741]" />
          <span>AI-Driven Smallholder Crop & Harvest Optimization</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif italic text-[#4A6741] max-w-4xl mx-auto leading-tight tracking-tight">
          Balancing Household Nutrition Security & Peak Farm Revenues
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#6B6E6B] max-w-2xl mx-auto leading-relaxed font-normal">
          A full-stack agricultural decision engine combining <strong>ICMR IFCT 2017 dietary standards</strong>, <strong>Open-Meteo climate advisories</strong>, <strong>AGMARKNET mandi price forecasting</strong>, and <strong>OR-Tools harvest allocation optimization</strong>.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-[#4A6741] hover:bg-[#3A5033] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span>Create Free Account & Start</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onLogin}
            className="w-full sm:w-auto bg-white hover:bg-[#F2EDE4] text-[#2D302D] border border-[#D9D4C7] font-bold text-sm px-8 py-4 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            I Already Have an Account
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-[#EBE7DF] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] flex items-center space-x-3 shadow-2xs">
            <Award className="w-6 h-6 text-[#4A6741] flex-shrink-0" />
            <div>
              <span className="font-bold text-xs text-[#2D302D] block">ICMR IFCT 2017</span>
              <span className="text-[11px] text-[#6B6E6B]">Verified Nutrition RDA Data</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] flex items-center space-x-3 shadow-2xs">
            <CloudSun className="w-6 h-6 text-[#4A6741] flex-shrink-0" />
            <div>
              <span className="font-bold text-xs text-[#2D302D] block">Open-Meteo REST</span>
              <span className="text-[11px] text-[#6B6E6B]">Hyperlocal Climate Forecast</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] flex items-center space-x-3 shadow-2xs">
            <TrendingUp className="w-6 h-6 text-[#4A6741] flex-shrink-0" />
            <div>
              <span className="font-bold text-xs text-[#2D302D] block">AGMARKNET Prices</span>
              <span className="text-[11px] text-[#6B6E6B]">Prophet Mandi Forecaster</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EBE7DF] flex items-center space-x-3 shadow-2xs">
            <Lock className="w-6 h-6 text-[#4A6741] flex-shrink-0" />
            <div>
              <span className="font-bold text-xs text-[#2D302D] block">Supabase Auth</span>
              <span className="text-[11px] text-[#6B6E6B]">Row-Level Security Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits & Modules Showcase */}
      <section className="py-16 bg-white border-y border-[#EBE7DF] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#4A6741] uppercase tracking-wider">
              Comprehensive Agricultural Intelligence
            </span>
            <h2 className="text-3xl font-serif italic text-[#4A6741]">
              How NutriHarvest AI Transforms Smallholder Farming
            </h2>
            <p className="text-xs text-[#6B6E6B] leading-relaxed">
              Designed specifically for smallholder families in South Asia and global developing agrarian economies to eliminate hidden hunger and boost farm profits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#F9F7F2] p-6 rounded-2xl border border-[#EBE7DF] space-y-4 hover:border-[#4A6741]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741]">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#2D302D]">1. ICMR Family Nutrition RDA Engine</h3>
              <p className="text-xs text-[#6B6E6B] leading-relaxed">
                Calculates monthly household requirements for Energy, Protein, Iron, Calcium, Vitamin A, Vitamin C, and Zinc based on age group demographics.
              </p>
              <ul className="text-xs space-y-2 text-[#2D302D] pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6741]" />
                  <span>Prevents micronutrient deficiency & stunting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6741]" />
                  <span>Dietary preferences (Veg, Vegan, Non-Veg)</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F9F7F2] p-6 rounded-2xl border border-[#EBE7DF] space-y-4 hover:border-[#4A6741]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741]">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#2D302D]">2. OR-Tools Harvest Allocation Solver</h3>
              <p className="text-xs text-[#6B6E6B] leading-relaxed">
                Uses mathematical optimization to partition your total harvest between home consumption, market sales, seed reserves, and seasonal storage.
              </p>
              <ul className="text-xs space-y-2 text-[#2D302D] pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6741]" />
                  <span>Maximizes net expected income in ₹</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6741]" />
                  <span>Accounts for transport & storage shrinkage</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F9F7F2] p-6 rounded-2xl border border-[#EBE7DF] space-y-4 hover:border-[#4A6741]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741]">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#2D302D]">3. Gemini 3.6 Flash Advisory</h3>
              <p className="text-xs text-[#6B6E6B] leading-relaxed">
                Translates complex mathematical and meteorological outputs into clear, encouraging guidance in Hindi, Punjabi, Marathi, and English.
              </p>
              <ul className="text-xs space-y-2 text-[#2D302D] pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6741]" />
                  <span>Strict anti-hallucination groundings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6741]" />
                  <span>Interactive Q&A voice assistant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How Onboarding & Authentication Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-mono font-bold text-[#4A6741] uppercase tracking-wider">
            Simple 3-Step Journey
          </span>
          <h2 className="text-3xl font-serif italic text-[#4A6741]">
            Get Your Customized Farm Plan in Minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] text-center space-y-3 shadow-2xs relative">
            <div className="w-10 h-10 rounded-full bg-[#4A6741] text-white font-mono font-bold text-sm flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="font-bold text-sm text-[#2D302D]">Sign Up or Log In</h4>
            <p className="text-xs text-[#6B6E6B] leading-relaxed">
              Create a secure Supabase profile using your email and password. Your data is protected by Row-Level Security.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] text-center space-y-3 shadow-2xs relative">
            <div className="w-10 h-10 rounded-full bg-[#4A6741] text-white font-mono font-bold text-sm flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="font-bold text-sm text-[#2D302D]">Complete Guided Onboarding</h4>
            <p className="text-xs text-[#6B6E6B] leading-relaxed">
              Input household demographics, land size, location, soil N-P-K parameters, and seasonal budget constraints.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] text-center space-y-3 shadow-2xs relative">
            <div className="w-10 h-10 rounded-full bg-[#4A6741] text-white font-mono font-bold text-sm flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="font-bold text-sm text-[#2D302D]">Access Protected Dashboard</h4>
            <p className="text-xs text-[#6B6E6B] leading-relaxed">
              Unlock personalized crop yield predictions, nutrition RDA coverage scores, mandi price trends, and climate alerts.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onGetStarted}
            className="bg-[#4A6741] hover:bg-[#3A5033] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-xs flex items-center justify-center space-x-2 mx-auto transition-all cursor-pointer"
          >
            <span>Begin Guided Setup Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D302D] text-[#EBE7DF] py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sprout className="w-5 h-5 text-[#4A6741]" />
            <span className="font-bold text-sm text-white font-serif">NutriHarvest AI</span>
            <span className="text-[#8C8F8C]">• Smallholder Agriculture & Nutrition Planner</span>
          </div>
          <div className="text-[#8C8F8C] text-[11px]">
            Powered by Supabase Auth, ICMR IFCT 2017, Open-Meteo REST API, and Gemini 3.6 Flash.
          </div>
        </div>
      </footer>
    </div>
  );
};
