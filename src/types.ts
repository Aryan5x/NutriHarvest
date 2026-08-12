/**
 * NutriHarvest AI - Shared Domain Types
 */

export type DietPreference = 'VEGETARIAN' | 'NON_VEGETARIAN' | 'EGGETARIAN' | 'VEGAN';

export type Season = 'KHARIF' | 'RABI' | 'ZAID' | 'WHOLE_YEAR';

export interface HouseholdAgeGroups {
  children0_5: number;   // 0-5 yrs
  children6_12: number;  // 6-12 yrs
  teens13_18: number;   // 13-18 yrs
  adults19_59: number;  // 19-59 yrs
  seniors60Plus: number;// 60+ yrs
}

export interface HouseholdProfile {
  id: string;
  farmerName: string;
  householdSize: number;
  ageGroups: HouseholdAgeGroups;
  dietPreference: DietPreference;
}

export interface NutrientTarget {
  proteinGrams: number;
  ironMg: number;
  calciumMg: number;
  vitaminAMcg: number;
  vitaminCMg: number;
  fiberGrams: number;
  caloriesKcal: number;
}

export interface CropNutritionInfo {
  cropId: string;
  cropName: string;
  category: 'Cereal' | 'Pulse' | 'Vegetable' | 'Oilseed' | 'Tuber';
  per100g: {
    proteinGrams: number;
    ironMg: number;
    calciumMg: number;
    vitaminAMcg: number;
    vitaminCMg: number;
    fiberGrams: number;
    caloriesKcal: number;
  };
  provenance: string; // e.g. "ICMR-NIN IFCT 2017"
}

export interface SoilInfo {
  type: string; // Alluvial, Black, Red, Clay, Sandy, Loam
  pH: number;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  organicCarbonPercent: number;
  isSoilTestProvided?: boolean;
  soilSourceType?: 'FARMER_PROVIDED' | 'VERIFIED_ESTIMATE' | 'UNAVAILABLE';
  soilSourceLabel?: string;
  provenanceDetails?: string;
}

export interface FarmProfile {
  id: string;
  farmerId: string;
  farmName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  landAreaAcres: number;
  waterSource: 'IRRIGATED_CANAL' | 'IRRIGATED_BOREWELL' | 'RAINFED' | 'DRIP_IRRIGATION';
  soil: SoilInfo;
  budgetInr: number;
  cropHistory: string[];
  plannedCrop?: string;
  plannedCrops?: string[];
}

export interface MultiCropPlanItem {
  cropName: string;
  category: string;
  plannedAreaAcres: number;
  agronomicSuitability: {
    status: 'HIGHLY_SUITABLE' | 'SUITABLE' | 'MODERATE' | 'MARGINAL';
    reasons: string[];
    waterReqMm: number;
    durationDays: number;
  };
  yieldPrediction: {
    status: 'AWAITING_ANTIGRAVITY_MODEL' | 'VALIDATED';
    predictedYieldKgPerAcre?: number;
    totalExpectedYieldKg?: number;
    label: string;
  };
  nutritionContribution: {
    status: 'AWAITING_YIELD_PREDICTION' | 'CALCULATED';
    ifctProvenance: string;
    targetNutrients: string[];
    label: string;
  };
  profitEstimation: {
    status: 'REQUIRES_VERIFIED_PRICE_DATA';
    label: string;
  };
  areaAllocation: {
    recommendedAcres: number;
    optimizationStatus: 'PENDING_ANTIGRAVITY_MODEL';
    label: string;
  };
}

export interface CandidateCrop {
  id: string;
  name: string;
  category: 'Cereal' | 'Pulse' | 'Vegetable' | 'Oilseed' | 'Tuber';
  season: Season;
  durationDays: number;
  waterReqMm: number;
  costPerAcreInr: number;
  recommendedAcreage: number;
  predictedYieldKgPerAcre: number;
  totalExpectedYieldKg: number;
  yieldConfidenceInterval: [number, number];
  recommendationReasons: string[];
  predictionMode?: 'PRE_SEASON' | 'IN_SEASON';
  predictionModeLabel?: string;
  xgboostFeatures: {
    state: string;
    season: string;
    area: number;
    rainfallMm: number;
    tempC: number;
    soilN: number;
    soilP: number;
    soilK: number;
  };
}

export interface ActualYieldRecord {
  id: string;
  userId: string;
  cropId: string;
  cropName: string;
  plotName: string;
  acreage: number;
  sowingDate: string;
  harvestDate: string;
  predictedYieldKg: number;
  actualYieldKg: number;
  predictionErrorKg: number;
  predictionErrorPercent: number;
  notes?: string;
  loggedAt: string;
}

export interface DailyFarmLog {
  id: string;
  userId: string;
  cropName: string;
  plotName: string;
  date: string; // YYYY-MM-DD
  growthStage: 'SOWING' | 'VEGETATIVE' | 'FLOWERING' | 'GRAIN_FILLING' | 'HARVESTING';
  irrigationLiters?: number;
  irrigationMethod?: string;
  rainfallMm?: number;
  fertilizerUsed?: string;
  pestObservation?: string;
  cropCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  activityNotes: string;
  loggedAt: string;
}

export interface CropTestPerformance {
  crop: string;
  samples: number;
  r2Score: number;
  mae: number;
  rmse: number;
}

export interface ModelMetrics {
  modelName: string;
  targetVariable: string;
  algorithm: string;
  predictionMode: 'PRE_SEASON' | 'IN_SEASON';
  predictionModeLabel: string;
  trainingDataset: string;
  datasetSourceUrl: string;
  trainingPeriod: string;
  testPeriod: string;
  trainingSamples: number;
  validationSamples: number;
  testSamples: number;
  mae: number;
  rmse: number;
  r2Score: number;
  baselineGlobalMean: {
    r2Score: number;
    mae: number;
    rmse: number;
  };
  baselineCropMean: {
    r2Score: number;
    mae: number;
    rmse: number;
  };
  perCropPerformance: CropTestPerformance[];
  evaluatedAt: string;
}

export interface WeatherObservation {
  timestamp: string;
  latitude: number;
  longitude: number;
  tempCurrentC: number;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
  precipitationProbPercent: number;
  humidityPercent: number;
  windSpeedKmH: number;
  et0MmDay: number; // Evapotranspiration
  soilMoisturePercent?: number;
  source: 'Open-Meteo REST API' | 'Cached Open-Meteo Snapshot';
}

export interface WeatherAlert {
  id: string;
  type: 'RAIN_ALERT' | 'IRRIGATION_SCHEDULE' | 'HEAT_WARNING' | 'PLANTING_WINDOW';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  actionableRecommendation: string;
  source: string;
  timestamp: string;
}

export interface MandiPriceRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  minPricePerKg: number;
  maxPricePerKg: number;
  modalPricePerKg: number;
  arrivalDate: string;
  source: 'AGMARKNET Data.gov.in' | 'AGMARKNET Historical Dataset';
}

export interface PriceForecast {
  commodity: string;
  market: string;
  observedModalPrice: number;
  forecastedModalPrice: number;
  forecastDate: string;
  trend: 'UPWARD' | 'STABLE' | 'DOWNWARD';
  confidenceInterval: [number, number];
  recommendedSellingWindow: string;
  modelName: 'Prophet Time Series Forecaster' | 'Historical Moving Average Fallback';
}

export interface HarvestAllocation {
  totalHarvestKg: number;
  familyConsumptionKg: number;
  marketSaleKg: number;
  storageKg: number;
  emergencyBufferKg: number;
  seedReserveKg: number;
  netExpectedIncomeInr: number;
  storageCostInr: number;
  transportCostInr: number;
  nutritionSatisfactionScorePercent: number;
  isFeasible: boolean;
  constraintWarnings: string[];
}

export interface NutritionCoverageScore {
  overallCoveragePercent: number;
  proteinCoveragePercent: number;
  ironCoveragePercent: number;
  calciumCoveragePercent: number;
  vitaminACoveragePercent: number;
  vitaminCCoveragePercent: number;
  fiberCoveragePercent: number;
  caloriesCoveragePercent: number;
  deficientNutrients: string[];
  recommendedFoodsToFillGaps: string[];
}

export interface DataProvenanceItem {
  id: string;
  name: string;
  provider: string;
  sourceUrl: string;
  retrievedAt: string;
  license: string;
  description: string;
  status: 'LIVE_CONNECTED' | 'VERIFIED_SNAPSHOT' | 'FALLBACK';
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    farmerName?: string;
  } | null;
  isLoggedIn: boolean;
  isOffline: boolean;
  lastSyncedAt: string;
}
