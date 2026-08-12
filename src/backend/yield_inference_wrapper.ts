/**
 * PRE-SEASON YIELD INFERENCE WRAPPER
 * 
 * Clean abstraction layer around the trained XGBoost Yield ML model (v2.0.0-xgb-log1p).
 * Strictly enforces approved crop restrictions, pre-season feature validation,
 * climate/fertilizer/pesticide provider abstractions, OOD warnings, and downstream nutrition handoffs.
 * 
 * DO NOT MUTATE THE TRAINED MODEL ARTIFACTS.
 */

import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export const APPROVED_10_YIELD_CROPS = [
  'Wheat',
  'Rice',
  'Gram',
  'Rapeseed &Mustard',
  'Cotton(lint)',
  'Sugarcane',
  'Bajra',
  'Maize',
  'Potato',
  'Moong(Green Gram)',
] as const;

export type ApprovedYieldCrop = typeof APPROVED_10_YIELD_CROPS[number];

export interface FarmerPlanningInput {
  crop: string;
  areaHa: number;
  state: string;
  season: string;
  cropYear?: number; // Defaults to current calendar year (e.g. 2026)
}

export interface ClimateProfileResult {
  annualRainfall?: number;
  avgTemperature?: number;
  maxTemperature?: number;
  minTemperature?: number;
  source?: string;
  period?: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  message?: string;
}

export interface ClimateProvider {
  getClimateProfile(state: string, season: string, cropYear: number): ClimateProfileResult | Promise<ClimateProfileResult>;
}

export interface FertilizerInputResult {
  totalFertilizerKg?: number;
  source?: string;
  basis?: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  message?: string;
}

export interface FertilizerInputProvider {
  getFertilizerInput(crop: string, state: string, season: string, areaHa: number): FertilizerInputResult | Promise<FertilizerInputResult>;
}

export interface PesticideInputResult {
  totalPesticideKg?: number;
  source?: string;
  basis?: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  message?: string;
}

export interface PesticideInputProvider {
  getPesticideInput(crop: string, state: string, season: string, areaHa: number): PesticideInputResult | Promise<PesticideInputResult>;
}

export interface YieldInferenceResult {
  predictionAvailable: boolean;
  crop: string;
  areaHa: number;
  predictedYieldTPerHa?: number;
  expectedProductionTonnes?: number;
  modelVersion?: string;
  inputSources?: Record<string, string>;
  warnings?: string[];
  oodWarnings?: string[];
  missingInputs?: string[];
  reason?: string;
}

// DEFAULT UNCONNECTED PROVIDERS (Return UNAVAILABLE)

export class DefaultClimateProvider implements ClimateProvider {
  getClimateProfile(state: string, season: string, cropYear: number): ClimateProfileResult {
    return {
      status: 'UNAVAILABLE',
      message: 'Legitimate pre-season climate profile provider is not connected.',
    };
  }
}

export class DefaultFertilizerInputProvider implements FertilizerInputProvider {
  getFertilizerInput(crop: string, state: string, season: string, areaHa: number): FertilizerInputResult {
    return {
      status: 'UNAVAILABLE',
      message: 'Verified pre-season fertilizer input provider is not connected.',
    };
  }
}

export class DefaultPesticideInputProvider implements PesticideInputProvider {
  getPesticideInput(crop: string, state: string, season: string, areaHa: number): PesticideInputResult {
    return {
      status: 'UNAVAILABLE',
      message: 'Verified pre-season pesticide input provider is not connected.',
    };
  }
}

// TRAINING BOUNDS FOR NON-MUTATING OOD CHECKING
const TRAINING_BOUNDS = {
  Area: { min: 0.5, max: 50808100.0 },
  Annual_Rainfall: { min: 301.3, max: 6552.7 },
  Fertilizer: { min: 54.17, max: 4835406877.0 },
  Pesticide: { min: 0.09, max: 15750511.0 },
  Avg_Temperature: { min: -5.115, max: 28.652 },
  Max_Temperature: { min: 7.701, max: 40.632 },
  Min_Temperature: { min: -19.359, max: 24.972 },
};

export class PreSeasonYieldInferenceWrapper {
  /**
   * Main Yield Inference Execution
   */
  public static async predictYield(
    input: FarmerPlanningInput,
    climateProvider: ClimateProvider = new DefaultClimateProvider(),
    fertProvider: FertilizerInputProvider = new DefaultFertilizerInputProvider(),
    pestProvider: PesticideInputProvider = new DefaultPesticideInputProvider()
  ): Promise<YieldInferenceResult> {
    const cropYear = input.cropYear || new Date().getFullYear();
    const cropRaw = input.crop ? input.crop.trim() : '';

    // 1. Tomato Rejection & Supported Crop Check
    if (!cropRaw) {
      return {
        predictionAvailable: false,
        crop: '',
        areaHa: input.areaHa || 0,
        missingInputs: ['Crop'],
        reason: 'Crop name is required.',
      };
    }

    if (cropRaw.toLowerCase() === 'tomato') {
      return {
        predictionAvailable: false,
        crop: cropRaw,
        areaHa: input.areaHa || 0,
        reason: 'Tomato is not present in the validated Yield ML training dataset.',
      };
    }

    const matchedCrop = APPROVED_10_YIELD_CROPS.find(
      (c) => c.toLowerCase() === cropRaw.toLowerCase()
    );

    if (!matchedCrop) {
      return {
        predictionAvailable: false,
        crop: cropRaw,
        areaHa: input.areaHa || 0,
        reason: `Crop '${cropRaw}' is not supported by the Yield ML model. Supported crops: ${APPROVED_10_YIELD_CROPS.join(', ')}.`,
      };
    }

    // 2. Input Validation (Area, State, Season)
    const missingInputs: string[] = [];

    if (!input.areaHa || typeof input.areaHa !== 'number' || input.areaHa <= 0) {
      return {
        predictionAvailable: false,
        crop: matchedCrop,
        areaHa: input.areaHa || 0,
        reason: 'Area must be a positive number.',
      };
    }

    if (!input.state || !input.state.trim()) {
      missingInputs.push('State');
    }

    if (!input.season || !input.season.trim()) {
      missingInputs.push('Season');
    }

    // 3. Fetch Provider Data
    const climateRes = await climateProvider.getClimateProfile(input.state || '', input.season || '', cropYear);
    const fertRes = await fertProvider.getFertilizerInput(matchedCrop, input.state || '', input.season || '', input.areaHa);
    const pestRes = await pestProvider.getPesticideInput(matchedCrop, input.state || '', input.season || '', input.areaHa);

    if (climateRes.status === 'UNAVAILABLE' || climateRes.annualRainfall === undefined) {
      missingInputs.push('Annual_Rainfall', 'Avg_Temperature', 'Max_Temperature', 'Min_Temperature');
    }
    if (fertRes.status === 'UNAVAILABLE' || fertRes.totalFertilizerKg === undefined) {
      missingInputs.push('Fertilizer');
    }
    if (pestRes.status === 'UNAVAILABLE' || pestRes.totalPesticideKg === undefined) {
      missingInputs.push('Pesticide');
    }

    if (missingInputs.length > 0) {
      const uniqueMissing = Array.from(new Set(missingInputs));
      return {
        predictionAvailable: false,
        crop: matchedCrop,
        areaHa: input.areaHa,
        missingInputs: uniqueMissing,
        reason: 'Required pre-season model inputs are unavailable.',
      };
    }

    // 4. Non-mutating OOD Range Checks
    const oodWarnings: string[] = [];

    const checkOOD = (name: keyof typeof TRAINING_BOUNDS, val: number) => {
      const b = TRAINING_BOUNDS[name];
      if (b && (val < b.min || val > b.max)) {
        oodWarnings.push(`Input ${name} (${val}) is outside the observed training distribution [${b.min}, ${b.max}].`);
      }
    };

    checkOOD('Area', input.areaHa);
    checkOOD('Annual_Rainfall', climateRes.annualRainfall!);
    checkOOD('Fertilizer', fertRes.totalFertilizerKg!);
    checkOOD('Pesticide', pestRes.totalPesticideKg!);
    checkOOD('Avg_Temperature', climateRes.avgTemperature!);
    checkOOD('Max_Temperature', climateRes.maxTemperature!);
    checkOOD('Min_Temperature', climateRes.minTemperature!);

    // 5. Execute Model Prediction via Python Runner
    try {
      const modelInputPayload = {
        Crop: matchedCrop,
        Crop_Year: cropYear,
        Season: input.season.trim(),
        State: input.state.trim(),
        Area: input.areaHa,
        Annual_Rainfall: climateRes.annualRainfall,
        Fertilizer: fertRes.totalFertilizerKg,
        Pesticide: pestRes.totalPesticideKg,
        Avg_Temperature: climateRes.avgTemperature,
        Max_Temperature: climateRes.maxTemperature,
        Min_Temperature: climateRes.minTemperature,
      };

      let pyScript = path.resolve(process.cwd(), 'src', 'backend', 'predict_yield.py');
      if (!fs.existsSync(pyScript)) {
        pyScript = path.join(__dirname, 'predict_yield.py');
      }

      const pyOutput = execFileSync('python', [pyScript], {
        input: JSON.stringify(modelInputPayload),
        encoding: 'utf-8',
      });

      const resJson = JSON.parse(pyOutput);

      if (!resJson.success || resJson.predictedYieldTPerHa === undefined) {
        return {
          predictionAvailable: false,
          crop: matchedCrop,
          areaHa: input.areaHa,
          reason: `Model evaluation error: ${resJson.error || 'Unknown error'}`,
        };
      }

      const predictedYieldTPerHa = Number(resJson.predictedYieldTPerHa);
      const expectedProductionTonnes = Number((predictedYieldTPerHa * input.areaHa).toFixed(4));

      return {
        predictionAvailable: true,
        crop: matchedCrop,
        areaHa: input.areaHa,
        predictedYieldTPerHa,
        expectedProductionTonnes,
        modelVersion: '2.0.0-xgb-log1p',
        inputSources: {
          climate: climateRes.source || 'ClimateProvider',
          fertilizer: fertRes.source || 'FertilizerInputProvider',
          pesticide: pestRes.source || 'PesticideInputProvider',
        },
        warnings: [],
        oodWarnings,
      };
    } catch (err: any) {
      return {
        predictionAvailable: false,
        crop: matchedCrop,
        areaHa: input.areaHa,
        reason: `Model execution failure: ${err.message || String(err)}`,
      };
    }
  }

  /**
   * Multi-crop planning evaluation
   */
  public static async evaluateMultiCropPlan(
    requests: FarmerPlanningInput[],
    climateProvider: ClimateProvider = new DefaultClimateProvider(),
    fertProvider: FertilizerInputProvider = new DefaultFertilizerInputProvider(),
    pestProvider: PesticideInputProvider = new DefaultPesticideInputProvider()
  ): Promise<YieldInferenceResult[]> {
    const results: YieldInferenceResult[] = [];
    for (const req of requests) {
      const res = await this.predictYield(req, climateProvider, fertProvider, pestProvider);
      results.push(res);
    }
    return results;
  }

  /**
   * Nutrition Handoff Helper — Calculates Edible Production (Tonnes)
   * Applies conversion factors without modifying Nutrition Engine:
   * - Rice (Paddy -> Milled Rice): 0.67
   * - Sugarcane (Stalk -> Juice): 0.70
   * - Cotton: 0 (Non-edible)
   */
  public static calculateEdibleProductionTonnes(crop: string, expectedProductionTonnes: number): number {
    const cLower = crop.toLowerCase();
    if (cLower.includes('rice')) {
      return Number((expectedProductionTonnes * 0.67).toFixed(4));
    } else if (cLower.includes('sugarcane')) {
      return Number((expectedProductionTonnes * 0.70).toFixed(4));
    } else if (cLower.includes('cotton')) {
      return 0;
    }
    return expectedProductionTonnes;
  }
}
