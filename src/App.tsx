import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { FarmerProfileWizard } from './components/FarmerProfileWizard';
import { NutritionDashboard } from './components/NutritionDashboard';
import { CropPlanCard } from './components/CropPlanCard';
import { ClimateWidget } from './components/ClimateWidget';
import { MarketTrendsCard } from './components/MarketTrendsCard';
import { HarvestAllocationOptimizer } from './components/HarvestAllocationOptimizer';
import { GeminiAssistant } from './components/GeminiAssistant';
import { DataSourcesModal } from './components/DataSourcesModal';
import { AuthModal } from './components/AuthModal';
import { FarmProgressTracker } from './components/FarmProgressTracker';
import { YieldTrackingModal } from './components/YieldTrackingModal';

import { PROVENANCE_REGISTRY } from './data/data_sources';

import { NutritionAgent } from './backend/nutrition_agent';
import { CropPlanningAgent } from './backend/crop_planning_agent';
import { ClimateAgent } from './backend/climate_agent';
import { MarketAgent } from './backend/market_agent';
import { FinanceOptimizationAgent } from './backend/finance_optimization_agent';
import { GeminiExplainer } from './backend/gemini_explainer';
import { YieldTrackingAgent } from './backend/yield_tracking_agent';

import { SupabaseService } from './backend/supabase_service';
import { CandidateCrop, HarvestAllocation, ModelMetrics, NutritionCoverageScore, PriceForecast, UserSession, WeatherAlert, WeatherObservation, HouseholdProfile, FarmProfile } from './types';
import { Sprout, ShieldCheck, AlertTriangle } from 'lucide-react';

const INITIAL_HOUSEHOLD_PROFILE: HouseholdProfile = {
  id: 'HOUSEHOLD_01',
  farmerName: 'Farmer',
  householdSize: 4,
  dietPreference: 'VEGETARIAN',
  ageGroups: {
    children0_5: 0,
    children6_12: 1,
    teens13_18: 0,
    adults19_59: 2,
    seniors60Plus: 1,
  },
};

const INITIAL_FARM_PROFILE: FarmProfile = {
  id: 'FARM_01',
  farmerId: 'FRM_2026_01',
  farmName: 'My Farm',
  state: 'Haryana',
  district: 'Karnal',
  latitude: 29.6857,
  longitude: 76.9905,
  landAreaAcres: 2.5,
  waterSource: 'IRRIGATED_BOREWELL',
  budgetInr: 35000,
  soil: {
    type: 'Alluvial Clay-Loam',
    pH: 7.2,
    nitrogenKgHa: 140,
    phosphorusKgHa: 35,
    potassiumKgHa: 180,
    organicCarbonPercent: 0.55,
  },
  cropHistory: ['Wheat', 'Paddy'],
  plannedCrop: 'Wheat',
  plannedCrops: ['Wheat', 'Rice (Paddy)', 'Chickpea (Gram)'],
};

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // Profile States
  const [farmer, setFarmer] = useState<HouseholdProfile>(INITIAL_HOUSEHOLD_PROFILE);
  const [farm, setFarm] = useState<FarmProfile>(INITIAL_FARM_PROFILE);

  // User Session State
  const [session, setSession] = useState<UserSession>({
    user: null,
    isLoggedIn: false,
    isOffline: false,
    lastSyncedAt: new Date().toLocaleTimeString(),
  });

  // Agent State Engine
  const [candidates, setCandidates] = useState<CandidateCrop[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>(CropPlanningAgent.getModelMetrics());
  const [weatherObs, setWeatherObs] = useState<WeatherObservation>({
    timestamp: new Date().toISOString(),
    latitude: 29.6857,
    longitude: 76.9905,
    tempCurrentC: 28.5,
    tempMaxC: 34.0,
    tempMinC: 22.0,
    precipitationMm: 12.0,
    precipitationProbPercent: 70,
    humidityPercent: 65,
    windSpeedKmH: 12,
    et0MmDay: 4.2,
    source: 'Open-Meteo REST API',
  });
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [mandiRecords, setMandiRecords] = useState<any[]>([]);
  const [priceForecast, setPriceForecast] = useState<PriceForecast>({
    commodity: 'Wheat',
    market: 'Karnal Mandi APMC',
    observedModalPrice: 24.0,
    forecastedModalPrice: 25.5,
    forecastDate: '2026-09-11',
    trend: 'UPWARD',
    confidenceInterval: [23.8, 27.2],
    recommendedSellingWindow: 'Hold for 3-4 weeks for peak mandi arrivals',
    modelName: 'Prophet Time Series Forecaster',
  });

  const [harvestAllocation, setHarvestAllocation] = useState<HarvestAllocation>({
    totalHarvestKg: 4550,
    familyConsumptionKg: 350,
    marketSaleKg: 3200,
    storageKg: 500,
    emergencyBufferKg: 320,
    seedReserveKg: 180,
    netExpectedIncomeInr: 68500,
    storageCostInr: 400,
    transportCostInr: 3840,
    nutritionSatisfactionScorePercent: 100,
    isFeasible: true,
    constraintWarnings: [],
  });

  const [nutritionTarget, setNutritionTarget] = useState<any>(NutritionAgent.calculateHouseholdMonthlyRDA(INITIAL_HOUSEHOLD_PROFILE.ageGroups));
  const [nutritionAchieved, setNutritionAchieved] = useState<any>(NutritionAgent.calculateHarvestNutritionalYield({ WHEAT: 250, CHICKPEA: 80 }));
  const [nutritionCoverage, setNutritionCoverage] = useState<NutritionCoverageScore>(
    NutritionAgent.computeNutritionCoverageScore(
      NutritionAgent.calculateHarvestNutritionalYield({ WHEAT: 250, CHICKPEA: 80 }),
      NutritionAgent.calculateHouseholdMonthlyRDA(INITIAL_HOUSEHOLD_PROFILE.ageGroups)
    )
  );
  const [nutritionSourceInfo, setNutritionSourceInfo] = useState<{
    yieldSource: 'ACTUAL' | 'PREDICTED';
    yieldLabel: string;
    activeCrops: Array<{ cropId: string; cropName: string; yieldKg: number; source: 'ACTUAL' | 'PREDICTED' }>;
  }>({
    yieldSource: 'PREDICTED',
    yieldLabel: 'Estimated nutrition based on predicted yield from ML models',
    activeCrops: [],
  });

  const [explanationText, setExplanationText] = useState<string>(
    'Loading AI farm plan summary...'
  );

  // Synchronize multi-agent calculations
  const recalculateAgents = async () => {
    const userId = session.user?.id || 'demo-user';

    // 1. Nutrition Target & Preliminary Gaps
    const rdaTarget = NutritionAgent.calculateHouseholdMonthlyRDA(farmer.ageGroups);
    setNutritionTarget(rdaTarget);

    // 2. Crop Candidates & Yields with Nutritional Deficiencies targeting
    const preliminaryGaps = ['Protein', 'Iron', 'Vitamin A'];
    const crops = CropPlanningAgent.generateCropPlan(farm, 'RABI', preliminaryGaps);
    setCandidates(crops);
    const metrics = CropPlanningAgent.getModelMetrics();
    setModelMetrics(metrics);

    // 3. Hyperlocal Weather using Farm's actual coordinates
    const lat = farm.latitude || 29.6857;
    const lon = farm.longitude || 76.9905;
    const { observation, alerts } = await ClimateAgent.fetchHyperlocalWeather(lat, lon);
    setWeatherObs(observation);
    setWeatherAlerts(alerts);

    // 4. Mandi Prices
    const prices = MarketAgent.getMandiPrices(farm.state, crops[0]?.name || 'Wheat');
    setMandiRecords(prices);
    const primaryModalPrice = prices[0]?.modalPricePerKg || 24.0;
    const forecast = MarketAgent.forecastPrice(crops[0]?.name || 'Wheat', primaryModalPrice);
    setPriceForecast(forecast);

    // 5. Primary crop for allocation
    const primaryCrop = crops[0] || {
      id: 'WHEAT',
      name: 'Wheat',
      category: 'Cereal',
      season: 'RABI',
      durationDays: 120,
      waterReqMm: 450,
      costPerAcreInr: 12000,
      recommendedAcreage: 1.0,
      predictedYieldKgPerAcre: 1821,
      totalExpectedYieldKg: 1821,
      yieldConfidenceInterval: [1600, 2000],
      recommendationReasons: [
        `✓ Suitable for ${farm.soil.type} soil pH ${farm.soil.pH}`,
        `✓ Fits available water source in ${farm.district}, ${farm.state}`,
      ],
      xgboostFeatures: {} as any,
    };

    // 6. OR-Tools Allocation
    const allocation = FinanceOptimizationAgent.solveHarvestAllocation(
      primaryCrop,
      farmer.ageGroups,
      prices[0] || { id: 'MP_1', source: 'AGMARKNET Data.gov.in', modalPricePerKg: 24.0, state: 'Haryana', district: 'Karnal', market: 'Karnal Mandi', commodity: 'Wheat', variety: 'Dara', minPricePerKg: 22.0, maxPricePerKg: 25.0, arrivalDate: '2026-08-11' },
      forecast,
      500,
      1.2,
      0.8
    );
    setHarvestAllocation(allocation);

    // 7. Precise Nutrition Calculation (Actual Harvest Logs vs Predicted Yield)
    const actualYieldRecords = YieldTrackingAgent.getRecordsForUser(userId);
    let allocMap: Record<string, number> = {};
    let source: 'ACTUAL' | 'PREDICTED' = 'PREDICTED';
    let label = 'Estimated nutrition based on predicted yield';
    let activeCropsList: Array<{ cropId: string; cropName: string; yieldKg: number; source: 'ACTUAL' | 'PREDICTED' }> = [];

    if (actualYieldRecords.length > 0) {
      source = 'ACTUAL';
      label = 'Nutrition based on actual recorded yield from post-harvest logs';
      for (const rec of actualYieldRecords) {
        const cropKey = rec.cropName.toUpperCase();
        allocMap[cropKey] = (allocMap[cropKey] || 0) + rec.actualYieldKg;
        activeCropsList.push({
          cropId: rec.cropId || rec.cropName,
          cropName: rec.cropName,
          yieldKg: rec.actualYieldKg,
          source: 'ACTUAL',
        });
      }
    } else {
      source = 'PREDICTED';
      label = 'Estimated nutrition based on predicted yield from ML models';
      for (const c of crops) {
        allocMap[c.id] = c.totalExpectedYieldKg;
        activeCropsList.push({
          cropId: c.id,
          cropName: c.name,
          yieldKg: c.totalExpectedYieldKg,
          source: 'PREDICTED',
        });
      }
    }

    setNutritionSourceInfo({
      yieldSource: source,
      yieldLabel: label,
      activeCrops: activeCropsList,
    });

    const achieved = NutritionAgent.calculateHarvestNutritionalYield(allocMap);
    setNutritionAchieved(achieved);

    const cov = NutritionAgent.computeNutritionCoverageScore(achieved, rdaTarget);
    setNutritionCoverage(cov);

    // 8. Gemini Explanation
    const structuredPlan = {
      farmer: farmer.farmerName,
      location: `${farm.district}, ${farm.state}`,
      landAcres: farm.landAreaAcres,
      selectedCrops: crops.map((c) => ({ name: c.name, acreage: c.recommendedAcreage, yieldKg: c.totalExpectedYieldKg })),
      harvestAllocation: allocation,
      nutritionCoveragePercent: cov.overallCoveragePercent,
      weatherAlert: alerts[0]?.title || 'Normal irrigation',
      yieldSource: source,
    };

    const exp = await GeminiExplainer.explainFarmPlan(structuredPlan, 'English');
    setExplanationText(exp.text);
  };

  useEffect(() => {
    if (session.isLoggedIn && hasCompletedOnboarding) {
      recalculateAgents();
    }
  }, [farm, farmer]);

  // Supabase Auth session & onboarding status check on application startup
  useEffect(() => {
    const initAuthSession = async () => {
      setIsCheckingAuth(true);
      try {
        const { session: currentSession } = await SupabaseService.getSession();
        if (currentSession?.user) {
          const userId = currentSession.user.id;
          const userEmail = currentSession.user.email || 'farmer@example.com';
          const userName = currentSession.user.user_metadata?.farmer_name || 'Ramesh Kumar';

          setSession({
            user: { id: userId, email: userEmail, farmerName: userName },
            isLoggedIn: true,
            isOffline: false,
            lastSyncedAt: new Date().toLocaleTimeString(),
          });

          // Retrieve onboarding profile
          const onboarding = await SupabaseService.getOnboardingProfile(userId);
          if (onboarding.farmer) setFarmer(onboarding.farmer);
          if (onboarding.farm) setFarm(onboarding.farm);

          setHasCompletedOnboarding(onboarding.hasCompleted);
          if (onboarding.hasCompleted) {
            setActiveTab('dashboard');
          } else {
            setActiveTab('profile');
          }
        } else {
          setSession({
            user: null,
            isLoggedIn: false,
            isOffline: false,
            lastSyncedAt: new Date().toLocaleTimeString(),
          });
          setHasCompletedOnboarding(false);
        }
      } catch (err) {
        console.warn('Error verifying session:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initAuthSession();

    // Subscribe to Supabase auth state events
    const { data: authListener } = SupabaseService.onAuthStateChange(async (event, currentSession) => {
      if (currentSession?.user) {
        const userId = currentSession.user.id;
        const userEmail = currentSession.user.email || '';
        const userName = currentSession.user.user_metadata?.farmer_name || 'Ramesh Kumar';

        setSession({
          user: { id: userId, email: userEmail, farmerName: userName },
          isLoggedIn: true,
          isOffline: false,
          lastSyncedAt: new Date().toLocaleTimeString(),
        });

        const onboarding = await SupabaseService.getOnboardingProfile(userId);
        if (onboarding.farmer) setFarmer(onboarding.farmer);
        if (onboarding.farm) setFarm(onboarding.farm);

        setHasCompletedOnboarding(onboarding.hasCompleted);
        if (onboarding.hasCompleted) {
          setActiveTab('dashboard');
        } else {
          setActiveTab('profile');
        }
      } else if (event === 'SIGNED_OUT') {
        setSession({
          user: null,
          isLoggedIn: false,
          isOffline: false,
          lastSyncedAt: new Date().toLocaleTimeString(),
        });
        setHasCompletedOnboarding(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = async (userId: string) => {
    setIsCheckingAuth(true);
    const onboarding = await SupabaseService.getOnboardingProfile(userId);
    if (onboarding.farmer) setFarmer(onboarding.farmer);
    if (onboarding.farm) setFarm(onboarding.farm);

    setHasCompletedOnboarding(onboarding.hasCompleted);
    if (onboarding.hasCompleted) {
      setActiveTab('dashboard');
      recalculateAgents();
    } else {
      setActiveTab('profile');
    }
    setIsCheckingAuth(false);
  };

  const handleTranslateLanguage = async (lang: string) => {
    const structuredPlan = {
      farmer: farmer.farmerName,
      location: `${farm.district}, ${farm.state}`,
      landAcres: farm.landAreaAcres,
      selectedCrops: candidates.map((c) => ({ name: c.name, acreage: c.recommendedAcreage, yieldKg: c.totalExpectedYieldKg })),
      harvestAllocation,
      nutritionCoveragePercent: nutritionCoverage.overallCoveragePercent,
    };

    const exp = await GeminiExplainer.explainFarmPlan(structuredPlan, lang);
    setExplanationText(exp.text);
  };

  const handleResetDemoScenario = () => {
    setFarmer(INITIAL_HOUSEHOLD_PROFILE);
    setFarm(INITIAL_FARM_PROFILE);
    setHasCompletedOnboarding(true);
    recalculateAgents();
    setActiveTab('dashboard');
  };

  const handleSignOut = async () => {
    await SupabaseService.signOut();
    setSession({ user: null, isLoggedIn: false, isOffline: false, lastSyncedAt: new Date().toLocaleTimeString() });
    setHasCompletedOnboarding(false);
  };

  // 1. Loading state during auth check to prevent flash of protected content
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] text-[#2D302D] flex flex-col items-center justify-center p-6 space-y-4 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-[#4A6741] flex items-center justify-center text-white shadow-md animate-pulse">
          <Sprout className="w-8 h-8 text-white" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-serif italic text-[#4A6741]">NutriHarvest AI</h2>
          <p className="text-xs text-[#6B6E6B] font-medium">Verifying authentication & profile status...</p>
        </div>
        <div className="w-48 h-1.5 bg-[#EBE7DF] rounded-full overflow-hidden">
          <div className="h-full bg-[#4A6741] animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state -> Intro / Landing Page
  if (!session.isLoggedIn) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthModalMode('signup');
            setIsAuthOpen(true);
          }}
          onLogin={() => {
            setAuthModalMode('signin');
            setIsAuthOpen(true);
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          session={session}
          setSession={setSession}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // 3. Authenticated but Incomplete Onboarding state -> Mandatory Onboarding
  if (session.isLoggedIn && !hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] text-[#2D302D] font-sans flex flex-col antialiased">
        <Navbar
          session={session}
          activeTab="profile"
          setActiveTab={() => {}}
          onOpenAuth={() => setIsAuthOpen(true)}
          hasCompletedOnboarding={false}
          onSignOut={handleSignOut}
        />

        <div className="bg-[#FDF9F3] border-b border-[#D4A373]/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-3 text-xs text-[#8B5E34]">
            <AlertTriangle className="w-4 h-4 text-[#8B5E34] flex-shrink-0" />
            <span>
              <strong>Mandatory Step:</strong> Please complete your farm and household demographics below. All protected dashboard features will unlock automatically after saving.
            </span>
          </div>
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <FarmerProfileWizard
            farmer={farmer}
            setFarmer={setFarmer}
            farm={farm}
            setFarm={setFarm}
            userId={session.user?.id || ''}
            onSaveAndGenerate={() => {
              setHasCompletedOnboarding(true);
              recalculateAgents();
              setActiveTab('dashboard');
            }}
          />
        </main>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          session={session}
          setSession={setSession}
          onSignOut={handleSignOut}
        />
      </div>
    );
  }

  // 4. Authenticated & Completed Onboarding state -> Main Protected Application
  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D302D] font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        hasCompletedOnboarding={true}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            farmer={farmer}
            farm={farm}
            coverage={nutritionCoverage}
            candidates={candidates}
            weather={weatherObs}
            alerts={weatherAlerts}
            forecast={priceForecast}
            allocation={harvestAllocation}
            metrics={modelMetrics}
            onNavigateTab={setActiveTab}
            onRefresh={recalculateAgents}
          />
        )}

        {activeTab === 'profile' && (
          <FarmerProfileWizard
            farmer={farmer}
            setFarmer={setFarmer}
            farm={farm}
            setFarm={setFarm}
            userId={session.user?.id || ''}
            onSaveAndGenerate={() => {
              recalculateAgents();
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionDashboard
            coverage={nutritionCoverage}
            target={nutritionTarget}
            achieved={nutritionAchieved}
            sourceInfo={nutritionSourceInfo}
            onRefresh={recalculateAgents}
            onNavigateToFarm={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'crops' && (
          <CropPlanCard
            candidates={candidates}
            metrics={modelMetrics}
            farm={farm}
            farmer={farmer}
            onRefresh={recalculateAgents}
          />
        )}

        {activeTab === 'progress' && (
          <FarmProgressTracker
            userId={session.user?.id || 'demo-user'}
            defaultCropName={candidates[0]?.name || 'Wheat'}
            defaultPlotName="Main Plot A"
            onRefresh={recalculateAgents}
          />
        )}

        {activeTab === 'yield_tracking' && (
          <YieldTrackingModal
            userId={session.user?.id || 'demo-user'}
            candidateCrops={candidates}
            onYieldUpdated={recalculateAgents}
          />
        )}

        {activeTab === 'climate' && (
          <ClimateWidget
            weather={weatherObs}
            alerts={weatherAlerts}
            onRefresh={recalculateAgents}
          />
        )}

        {activeTab === 'market' && (
          <MarketTrendsCard
            records={mandiRecords}
            forecast={priceForecast}
            onRefresh={recalculateAgents}
          />
        )}

        {activeTab === 'allocation' && (
          <HarvestAllocationOptimizer
            crop={candidates[0] || { id: 'WHEAT', name: 'Wheat', totalExpectedYieldKg: 1800, costPerAcreInr: 12000, recommendedAcreage: 1.0 } as any}
            allocation={harvestAllocation}
            onSolve={recalculateAgents}
          />
        )}

        {activeTab === 'gemini' && (
          <GeminiAssistant
            explanationText={explanationText}
            onTranslateLanguage={handleTranslateLanguage}
            farmContext={{ farmer, farm, harvestAllocation, nutritionCoverage }}
          />
        )}

        {activeTab === 'provenance' && (
          <DataSourcesModal sources={PROVENANCE_REGISTRY} />
        )}
      </main>

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={session}
        setSession={setSession}
        onSignOut={handleSignOut}
      />

      {/* Footer */}
      <footer className="bg-[#2D302D] border-t border-[#3A3D3A] text-[#EBE7DF] py-6 px-4 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white font-serif text-sm">NutriHarvest AI Platform</span>
            <p className="text-[#8C8F8C] mt-0.5">Powered by ICMR IFCT 2017, Open-Meteo REST API, AGMARKNET, XGBoost & Gemini 3.6 Flash.</p>
          </div>
          <div className="flex items-center space-x-4 text-[#8C8F8C]">
            <span>Verified Datasets</span>
            <span>•</span>
            <span>Zero Target Leakage ML</span>
            <span>•</span>
            <span>OR-Tools Allocation Solver</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
