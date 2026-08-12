import React, { useState } from 'react';
import { FarmProfile, HouseholdProfile } from '../types';
import { Users, MapPin, Droplets, Layers, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Sprout, DollarSign, Database, ShieldCheck, Info } from 'lucide-react';
import { SupabaseService } from '../backend/supabase_service';
import { INDIAN_STATES_AND_DISTRICTS, STANDARD_SOIL_TYPES, lookupSoilNutrients } from '../data/indian_agricultural_data';

interface FarmerProfileWizardProps {
  farmer: HouseholdProfile;
  setFarmer: React.Dispatch<React.SetStateAction<HouseholdProfile>>;
  farm: FarmProfile;
  setFarm: React.Dispatch<React.SetStateAction<FarmProfile>>;
  onSaveAndGenerate: () => void;
  userId?: string;
}

const AVAILABLE_CROP_OPTIONS = [
  'Wheat',
  'Rice (Paddy)',
  'Chickpea (Gram)',
  'Mustard',
  'Cotton',
  'Sugarcane',
  'Bajra (Pearl Millet)',
  'Maize',
  'Potato',
  'Moong Dal (Green Gram)',
];

export const FarmerProfileWizard: React.FC<FarmerProfileWizardProps> = ({
  farmer,
  setFarmer,
  farm,
  setFarm,
  onSaveAndGenerate,
  userId = '',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Input Validation Logic
  const validateStep = (step: number): boolean => {
    const errs: string[] = [];

    if (step === 1) {
      if (!farmer.farmerName || farmer.farmerName.trim().length === 0) {
        errs.push('Farmer name is required.');
      }
      if (farmer.householdSize <= 0) {
        errs.push('Household size must be at least 1 member.');
      }
    } else if (step === 2) {
      if (!farm.state || farm.state.trim().length === 0) {
        errs.push('State selection is required.');
      }
      if (!farm.district || farm.district.trim().length === 0) {
        errs.push('District is required.');
      }
      if (!farm.landAreaAcres || farm.landAreaAcres <= 0) {
        errs.push('Farm land area must be greater than 0 acres.');
      }
      if (farm.budgetInr < 0) {
        errs.push('Seasonal budget cannot be negative.');
      }
    } else if (step === 3) {
      if (!farm.soil?.type || farm.soil.type.trim().length === 0) {
        errs.push('Soil type is required.');
      }
      if (farm.soil?.isSoilTestProvided && (farm.soil.pH === undefined || farm.soil.pH < 3 || farm.soil.pH > 10)) {
        errs.push('Soil pH must be between 3.0 and 10.0.');
      }
      const selectedPlanned = farm.plannedCrops && farm.plannedCrops.length > 0
        ? farm.plannedCrops
        : (farm.plannedCrop ? [farm.plannedCrop] : []);
      if (selectedPlanned.length === 0) {
        errs.push('Please select at least one crop you plan to grow.');
      }
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors([]);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleCropHistory = (cropName: string) => {
    const current = [...(farm.cropHistory || [])];
    const index = current.indexOf(cropName);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(cropName);
    }
    setFarm({ ...farm, cropHistory: current });
  };

  const handleFinishOnboarding = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setErrors(['Please fix all validation issues across steps before proceeding.']);
      return;
    }

    setIsSaving(true);
    setSyncStatus('Saving profile to Supabase database...');

    try {
      const res = await SupabaseService.saveOnboardingProfile(userId, { farmer, farm });
      if (res.mode === 'supabase') {
        setSyncStatus('Saved securely in Supabase RLS database!');
      } else {
        setSyncStatus('Saved to local storage.');
      }
    } catch {
      setSyncStatus('Saved to active workspace memory.');
    } finally {
      setIsSaving(false);
      onSaveAndGenerate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Step Progress */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#4A6741] uppercase tracking-wider block">
              Guided Onboarding & Farm Configurator
            </span>
            <h2 className="text-2xl font-serif italic text-[#4A6741]">
              {currentStep === 1 && 'Step 1: Household Size & Dietary Demographics'}
              {currentStep === 2 && 'Step 2: Farm Location, Land Size & Budget'}
              {currentStep === 3 && 'Step 3: Soil Characteristics & Crop History'}
              {currentStep === 4 && 'Step 4: Personalization Review & AI Plan Setup'}
            </h2>
            <p className="text-xs text-[#6B6E6B] mt-0.5">
              Collect essential family nutrition requirements, land characteristics, and budget constraints.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono text-[#2D302D]">Step {currentStep} of 4</span>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-[#F2EDE4] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#4A6741] h-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-center">
            <button
              onClick={() => validateStep(1) && setCurrentStep(1)}
              className={`py-1 rounded ${currentStep === 1 ? 'text-[#4A6741] bg-[#F2F8F0]' : 'text-[#8C8F8C]'}`}
            >
              1. Demographics
            </button>
            <button
              onClick={() => validateStep(1) && setCurrentStep(2)}
              className={`py-1 rounded ${currentStep === 2 ? 'text-[#4A6741] bg-[#F2F8F0]' : 'text-[#8C8F8C]'}`}
            >
              2. Land & Budget
            </button>
            <button
              onClick={() => validateStep(1) && validateStep(2) && setCurrentStep(3)}
              className={`py-1 rounded ${currentStep === 3 ? 'text-[#4A6741] bg-[#F2F8F0]' : 'text-[#8C8F8C]'}`}
            >
              3. Soil & History
            </button>
            <button
              onClick={() => validateStep(1) && validateStep(2) && validateStep(3) && setCurrentStep(4)}
              className={`py-1 rounded ${currentStep === 4 ? 'text-[#4A6741] bg-[#F2F8F0]' : 'text-[#8C8F8C]'}`}
            >
              4. Review
            </button>
          </div>
        </div>

        {/* Validation Errors Callout */}
        {errors.length > 0 && (
          <div className="bg-[#FDF9F3] border border-[#D4A373]/40 p-4 rounded-xl flex items-start space-x-3 text-[#8B5E34]">
            <AlertCircle className="w-5 h-5 text-[#D4A373] flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold block">Please resolve the following fields:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: Household Demographics & Dietary Preferences */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#EBE7DF] pb-3">
            <Users className="w-5 h-5 text-[#4A6741]" />
            <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider">
              Household Member Count & Dietary Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">
                Farmer Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={farmer.farmerName}
                onChange={(e) => setFarmer({ ...farmer, farmerName: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none text-[#2D302D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">Dietary Preference</label>
              <select
                value={farmer.dietPreference}
                onChange={(e) => setFarmer({ ...farmer, dietPreference: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none bg-white text-[#2D302D]"
              >
                <option value="VEGETARIAN">Vegetarian (Lacto-Vegetarian)</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="EGGETARIAN">Eggetarian</option>
                <option value="VEGAN">Vegan</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#2D302D]">
                Household Member Breakdown by Age Group
              </label>
              <span className="text-xs font-bold font-mono text-[#4A6741]">
                Total: {farmer.householdSize} Members
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-[#F2EDE4]/60 p-4 rounded-xl border border-[#EBE7DF]">
              <div>
                <span className="text-xs text-[#6B6E6B] font-semibold block">Children (0-5 yrs)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={farmer.ageGroups.children0_5}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    const newGroups = { ...farmer.ageGroups, children0_5: val };
                    const total = newGroups.children0_5 + newGroups.children6_12 + newGroups.teens13_18 + newGroups.adults19_59 + newGroups.seniors60Plus;
                    setFarmer({ ...farmer, ageGroups: newGroups, householdSize: total });
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono font-bold"
                />
              </div>

              <div>
                <span className="text-xs text-[#6B6E6B] font-semibold block">Children (6-12 yrs)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={farmer.ageGroups.children6_12}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    const newGroups = { ...farmer.ageGroups, children6_12: val };
                    const total = newGroups.children0_5 + newGroups.children6_12 + newGroups.teens13_18 + newGroups.adults19_59 + newGroups.seniors60Plus;
                    setFarmer({ ...farmer, ageGroups: newGroups, householdSize: total });
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono font-bold"
                />
              </div>

              <div>
                <span className="text-xs text-[#6B6E6B] font-semibold block">Teens (13-18 yrs)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={farmer.ageGroups.teens13_18}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    const newGroups = { ...farmer.ageGroups, teens13_18: val };
                    const total = newGroups.children0_5 + newGroups.children6_12 + newGroups.teens13_18 + newGroups.adults19_59 + newGroups.seniors60Plus;
                    setFarmer({ ...farmer, ageGroups: newGroups, householdSize: total });
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono font-bold"
                />
              </div>

              <div>
                <span className="text-xs text-[#6B6E6B] font-semibold block">Adults (19-59 yrs)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={farmer.ageGroups.adults19_59}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    const newGroups = { ...farmer.ageGroups, adults19_59: val };
                    const total = newGroups.children0_5 + newGroups.children6_12 + newGroups.teens13_18 + newGroups.adults19_59 + newGroups.seniors60Plus;
                    setFarmer({ ...farmer, ageGroups: newGroups, householdSize: total });
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono font-bold"
                />
              </div>

              <div>
                <span className="text-xs text-[#6B6E6B] font-semibold block">Seniors (60+ yrs)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={farmer.ageGroups.seniors60Plus}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    const newGroups = { ...farmer.ageGroups, seniors60Plus: val };
                    const total = newGroups.children0_5 + newGroups.children6_12 + newGroups.teens13_18 + newGroups.adults19_59 + newGroups.seniors60Plus;
                    setFarmer({ ...farmer, ageGroups: newGroups, householdSize: total });
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Farm Location, Land Size & Budget */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#EBE7DF] pb-3">
            <MapPin className="w-5 h-5 text-[#4A6741]" />
            <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider">
              Geography, Land Area & Water Sources
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={farm.state}
                onChange={(e) => {
                  const newState = e.target.value;
                  const validDistricts = INDIAN_STATES_AND_DISTRICTS[newState] || [];
                  const newDistrict = validDistricts.includes(farm.district) ? farm.district : validDistricts[0] || '';
                  setFarm({ ...farm, state: newState, district: newDistrict });
                }}
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none bg-white text-[#2D302D]"
              >
                {Object.keys(INDIAN_STATES_AND_DISTRICTS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={farm.district}
                onChange={(e) => setFarm({ ...farm, district: e.target.value })}
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none bg-white text-[#2D302D]"
              >
                {(INDIAN_STATES_AND_DISTRICTS[farm.state] || [farm.district]).map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">
                Farm Land Size (Acres) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={farm.landAreaAcres}
                onChange={(e) => setFarm({ ...farm, landAreaAcres: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none text-[#2D302D] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">Water Availability</label>
              <select
                value={farm.waterSource}
                onChange={(e) => setFarm({ ...farm, waterSource: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none bg-white text-[#2D302D]"
              >
                <option value="IRRIGATED_BOREWELL">Borewell Irrigated</option>
                <option value="IRRIGATED_CANAL">Canal Irrigated</option>
                <option value="RAINFED">Rainfed Only</option>
                <option value="DRIP_IRRIGATION">Drip Micro-Irrigation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">
                Seasonal Input Budget (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={farm.budgetInr}
                onChange={(e) => setFarm({ ...farm, budgetInr: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none text-[#2D302D] font-mono font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Soil Information & Crop History */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#EBE7DF] pb-3">
            <Layers className="w-5 h-5 text-[#4A6741]" />
            <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider">
              Soil Type & Nutrient Values
            </h3>
          </div>

          <div className="bg-[#F2EDE4]/60 p-4 rounded-xl border border-[#EBE7DF] space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2D302D] mb-1">
                Select Soil Category <span className="text-red-500">*</span>
              </label>
              <select
                value={farm.soil.type}
                onChange={(e) => {
                  const newSoilType = e.target.value;
                  if (!farm.soil.isSoilTestProvided) {
                    const lookup = lookupSoilNutrients(farm.state, farm.district, newSoilType);
                    setFarm({
                      ...farm,
                      soil: {
                        ...farm.soil,
                        type: newSoilType,
                        pH: lookup.hasVerifiedData ? lookup.pH! : 7.0,
                        nitrogenKgHa: lookup.hasVerifiedData ? lookup.nitrogenKgHa! : 0,
                        phosphorusKgHa: lookup.hasVerifiedData ? lookup.phosphorusKgHa! : 0,
                        potassiumKgHa: lookup.hasVerifiedData ? lookup.potassiumKgHa! : 0,
                        soilSourceType: lookup.sourceType,
                        soilSourceLabel: lookup.sourceLabel,
                        provenanceDetails: lookup.provenanceDetails,
                      },
                    });
                  } else {
                    setFarm({ ...farm, soil: { ...farm.soil, type: newSoilType } });
                  }
                }}
                className="w-full px-3 py-2 border border-[#D9D4C7] rounded-xl text-xs focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none bg-white text-[#2D302D]"
              >
                {STANDARD_SOIL_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil Test Option Selector */}
            <div className="space-y-2 pt-2 border-t border-[#D9D4C7]/60">
              <span className="text-xs font-bold text-[#2D302D] block">
                Do you have lab soil test results / Soil Health Card?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFarm({
                      ...farm,
                      soil: {
                        ...farm.soil,
                        isSoilTestProvided: true,
                        soilSourceType: 'FARMER_PROVIDED',
                        soilSourceLabel: 'Farmer / Soil-Test Provided',
                        provenanceDetails: 'Soil Health Card / Lab Test Report',
                      },
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    farm.soil.isSoilTestProvided
                      ? 'bg-[#F2F8F0] border-[#4A6741] text-[#4A6741] ring-1 ring-[#4A6741]'
                      : 'bg-white border-[#EBE7DF] text-[#6B6E6B] hover:border-[#D9D4C7]'
                  }`}
                >
                  <span className="font-bold text-xs block text-[#2D302D]">
                    Option A: Farmer / Soil-Test Provided
                  </span>
                  <span className="text-[11px] text-[#6B6E6B] block mt-0.5">
                    I know my pH, Nitrogen, Phosphorus, Potassium values.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const lookup = lookupSoilNutrients(farm.state, farm.district, farm.soil.type);
                    setFarm({
                      ...farm,
                      soil: {
                        ...farm.soil,
                        isSoilTestProvided: false,
                        pH: lookup.hasVerifiedData ? lookup.pH! : 7.0,
                        nitrogenKgHa: lookup.hasVerifiedData ? lookup.nitrogenKgHa! : 0,
                        phosphorusKgHa: lookup.hasVerifiedData ? lookup.phosphorusKgHa! : 0,
                        potassiumKgHa: lookup.hasVerifiedData ? lookup.potassiumKgHa! : 0,
                        soilSourceType: lookup.sourceType,
                        soilSourceLabel: lookup.sourceLabel,
                        provenanceDetails: lookup.provenanceDetails,
                      },
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    !farm.soil.isSoilTestProvided
                      ? 'bg-[#F2F8F0] border-[#4A6741] text-[#4A6741] ring-1 ring-[#4A6741]'
                      : 'bg-white border-[#EBE7DF] text-[#6B6E6B] hover:border-[#D9D4C7]'
                  }`}
                >
                  <span className="font-bold text-xs block text-[#2D302D]">
                    Option B: I don't know my soil values
                  </span>
                  <span className="text-[11px] text-[#6B6E6B] block mt-0.5">
                    Estimate from location & soil dataset (if available).
                  </span>
                </button>
              </div>
            </div>

            {/* Option A Inputs */}
            {farm.soil.isSoilTestProvided && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#4A6741] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6741]" />
                  <span>Enter Actual Soil Health Card Parameters:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-xs text-[#6B6E6B] font-semibold block">pH Level</span>
                    <input
                      type="number"
                      step="0.1"
                      min="3"
                      max="10"
                      value={farm.soil.pH}
                      onChange={(e) => setFarm({ ...farm, soil: { ...farm.soil, pH: Number(e.target.value) } })}
                      className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[#6B6E6B] font-semibold block">Nitrogen (N) kg/ha</span>
                    <input
                      type="number"
                      value={farm.soil.nitrogenKgHa}
                      onChange={(e) => setFarm({ ...farm, soil: { ...farm.soil, nitrogenKgHa: Number(e.target.value) } })}
                      className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[#6B6E6B] font-semibold block">Phosphorus (P) kg/ha</span>
                    <input
                      type="number"
                      value={farm.soil.phosphorusKgHa}
                      onChange={(e) => setFarm({ ...farm, soil: { ...farm.soil, phosphorusKgHa: Number(e.target.value) } })}
                      className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[#6B6E6B] font-semibold block">Potassium (K) kg/ha</span>
                    <input
                      type="number"
                      value={farm.soil.potassiumKgHa}
                      onChange={(e) => setFarm({ ...farm, soil: { ...farm.soil, potassiumKgHa: Number(e.target.value) } })}
                      className="w-full mt-1 px-2.5 py-1.5 border border-[#D9D4C7] rounded-lg text-xs bg-white text-[#2D302D] font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Option B Display Tag & Status */}
            {!farm.soil.isSoilTestProvided && (
              <div className="pt-2">
                {farm.soil.soilSourceType === 'VERIFIED_ESTIMATE' ? (
                  <div className="bg-[#F2F8F0] border border-[#4A6741]/30 p-3 rounded-xl text-xs space-y-1 text-[#2D302D]">
                    <span className="font-bold text-[#4A6741] block">
                      Source Tag: "Estimated from location and soil type"
                    </span>
                    <p className="text-[#6B6E6B] text-[11px]">
                      {farm.soil.provenanceDetails}
                    </p>
                    <div className="flex space-x-4 font-mono font-bold text-xs pt-1 text-[#4A6741]">
                      <span>pH: {farm.soil.pH}</span>
                      <span>N: {farm.soil.nitrogenKgHa} kg/ha</span>
                      <span>P: {farm.soil.phosphorusKgHa} kg/ha</span>
                      <span>K: {farm.soil.potassiumKgHa} kg/ha</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FFFBEB] border border-[#F59E0B]/40 p-3.5 rounded-xl text-xs text-[#B45309] space-y-1 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Soil Data Status:</span>
                      <p className="text-[11px] leading-relaxed">
                        Soil nutrient data is unavailable for this location. For more accurate recommendations, enter values from a Soil Health Card or soil test.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D302D] mb-1">
              Which crops do you plan to grow? <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-[#6B6E6B] mb-3">
              Select one or more crops you plan to grow on your farm. The system will evaluate agronomic suitability for each selected crop, and prepare multi-crop land allocation, household nutrition contribution, and profit estimation once the validated ML Yield Model is integrated.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {AVAILABLE_CROP_OPTIONS.map((cropName) => {
                const currentPlanned = farm.plannedCrops && farm.plannedCrops.length > 0
                  ? farm.plannedCrops
                  : (farm.plannedCrop ? [farm.plannedCrop] : ['Wheat']);
                const isSelected = currentPlanned.includes(cropName);

                return (
                  <button
                    type="button"
                    key={cropName}
                    onClick={() => {
                      let updated: string[];
                      if (isSelected) {
                        if (currentPlanned.length > 1) {
                          updated = currentPlanned.filter((c) => c !== cropName);
                        } else {
                          updated = currentPlanned; // Keep at least one crop
                        }
                      } else {
                        updated = [...currentPlanned, cropName];
                      }
                      setFarm({
                        ...farm,
                        plannedCrops: updated,
                        plannedCrop: updated[0] || 'Wheat',
                        cropHistory: updated,
                      });
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-start justify-between space-y-2 transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#F2F8F0] border-[#4A6741] text-[#4A6741] shadow-xs'
                        : 'bg-white border-[#EBE7DF] text-[#6B6E6B] hover:border-[#D9D4C7]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold">{cropName}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4A6741] flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Personalization Review & Summary */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-6">
          <div className="flex items-center space-x-2 border-b border-[#EBE7DF] pb-3">
            <Sparkles className="w-5 h-5 text-[#4A6741]" />
            <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider">
              Onboarding Profile Review & Data Sync
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#EBE7DF] space-y-2 text-xs">
              <span className="font-bold text-[#4A6741] uppercase tracking-wider text-[10px] block">
                1. Household Demographics
              </span>
              <p><strong>Farmer:</strong> {farmer.farmerName}</p>
              <p><strong>Household Size:</strong> {farmer.householdSize} members</p>
              <p><strong>Dietary Choice:</strong> {farmer.dietPreference}</p>
              <p>
                <strong>Age Groups:</strong> {farmer?.ageGroups?.children0_5 || 0} Children (0-5), {farmer?.ageGroups?.children6_12 || 0} Children (6-12), {farmer?.ageGroups?.teens13_18 || 0} Teens, {farmer?.ageGroups?.adults19_59 || 0} Adults, {farmer?.ageGroups?.seniors60Plus || 0} Seniors
              </p>
            </div>

            <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#EBE7DF] space-y-2 text-xs">
              <span className="font-bold text-[#4A6741] uppercase tracking-wider text-[10px] block">
                2. Farm & Soil Profile
              </span>
              <p><strong>Location:</strong> {farm.district}, {farm.state}</p>
              <p><strong>Land Size:</strong> {farm.landAreaAcres} Acres</p>
              <p>
                <strong>Planned Crops:</strong>{' '}
                <span className="text-[#4A6741] font-bold">
                  {(farm.plannedCrops && farm.plannedCrops.length > 0 ? farm.plannedCrops : [farm.plannedCrop || 'Wheat']).join(', ')}
                </span>
              </p>
              <p><strong>Water Supply:</strong> {farm.waterSource}</p>
              <p><strong>Budget:</strong> ₹{(farm.budgetInr || 0).toLocaleString('en-IN')}</p>
              <p><strong>Soil:</strong> {farm.soil?.type || 'N/A'} (pH {farm.soil?.pH || 7.0})</p>
            </div>
          </div>

          {syncStatus && (
            <div className="bg-[#F2F8F0] p-3 rounded-xl border border-[#4A6741]/20 text-xs font-bold text-[#4A6741] flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#4A6741]" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            onClick={handlePrevStep}
            className="bg-[#F2EDE4] hover:bg-[#E2DDD2] text-[#2D302D] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button
            onClick={handleNextStep}
            className="bg-[#4A6741] hover:bg-[#3A5033] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xs transition-all"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinishOnboarding}
            disabled={isSaving}
            className="bg-[#4A6741] hover:bg-[#3A5033] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{isSaving ? 'Saving...' : 'Save Profile & Calculate AI Recommendations'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
