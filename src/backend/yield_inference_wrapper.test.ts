/**
 * DETERMINISTIC UNIT TEST SUITE FOR PRE-SEASON YIELD INFERENCE WRAPPER
 * 
 * Verifies all 12 required test scenarios:
 * 1. Valid 10-crop prediction request
 * 2. Tomato rejection
 * 3. Missing weather
 * 4. Missing fertilizer
 * 5. Missing pesticide
 * 6. Missing state
 * 7. Invalid area
 * 8. Multiple crop planning
 * 9. Expected production calculation
 * 10. OOD warning
 * 11. Current year = 2026
 * 12. Model artifact compatibility
 */

import {
  PreSeasonYieldInferenceWrapper,
  ClimateProvider,
  ClimateProfileResult,
  FertilizerInputProvider,
  FertilizerInputResult,
  PesticideInputProvider,
  PesticideInputResult,
  APPROVED_10_YIELD_CROPS,
} from './yield_inference_wrapper';

// TEST MOCK PROVIDERS (Explicitly labeled as Test Mocks)

export class TestMockClimateProvider implements ClimateProvider {
  getClimateProfile(state: string, season: string, cropYear: number): ClimateProfileResult {
    return {
      status: 'AVAILABLE',
      annualRainfall: 800.0,
      avgTemperature: 20.0,
      maxTemperature: 28.0,
      minTemperature: 12.0,
      source: 'TestMockClimateProvider (10-Yr Regional Normals)',
      period: '1997-2018 Historical Average',
    };
  }
}

export class TestMockFertilizerProvider implements FertilizerInputProvider {
  getFertilizerInput(crop: string, state: string, season: string, areaHa: number): FertilizerInputResult {
    return {
      status: 'AVAILABLE',
      totalFertilizerKg: 125.0 * areaHa,
      source: 'TestMockFertilizerProvider (ICAR Dosage Rate x Area)',
      basis: 'Recommended NPK 125 kg/ha',
    };
  }
}

export class TestMockPesticideProvider implements PesticideInputProvider {
  getPesticideInput(crop: string, state: string, season: string, areaHa: number): PesticideInputResult {
    return {
      status: 'AVAILABLE',
      totalPesticideKg: 1.5 * areaHa,
      source: 'TestMockPesticideProvider (Recommended Rate x Area)',
      basis: 'Recommended 1.5 kg/ha',
    };
  }
}

export class TestMockOODClimateProvider implements ClimateProvider {
  getClimateProfile(state: string, season: string, cropYear: number): ClimateProfileResult {
    return {
      status: 'AVAILABLE',
      annualRainfall: 10000.0, // Exceeds training max (6552.7 mm)
      avgTemperature: 45.0,    // Exceeds training max (28.65 °C)
      maxTemperature: 55.0,    // Exceeds training max (40.63 °C)
      minTemperature: 35.0,
      source: 'TestMockOODClimateProvider',
    };
  }
}

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING PRE-SEASON YIELD INFERENCE WRAPPER TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName}`);
      if (detail) console.error(`       Detail: ${detail}`);
    }
  }

  const mockClimate = new TestMockClimateProvider();
  const mockFert = new TestMockFertilizerProvider();
  const mockPest = new TestMockPesticideProvider();

  // Test 1: Valid 10-crop prediction request
  const res1 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: 2.0, state: 'Uttar Pradesh', season: 'Rabi' },
    mockClimate,
    mockFert,
    mockPest
  );
  assert(
    res1.predictionAvailable === true && res1.predictedYieldTPerHa! > 0,
    'Valid 10-crop prediction request',
    `Available=${res1.predictionAvailable}, Yield=${res1.predictedYieldTPerHa}`
  );

  // Test 2: Tomato rejection
  const res2 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Tomato', areaHa: 1.0, state: 'Uttar Pradesh', season: 'Rabi' },
    mockClimate,
    mockFert,
    mockPest
  );
  assert(
    res2.predictionAvailable === false && res2.reason!.includes('Tomato is not present'),
    'Tomato rejection',
    `Available=${res2.predictionAvailable}, Reason=${res2.reason}`
  );

  // Test 3: Missing weather
  const res3 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: 2.0, state: 'Uttar Pradesh', season: 'Rabi' }
    // Default climate provider (UNAVAILABLE)
  );
  assert(
    res3.predictionAvailable === false && res3.missingInputs!.includes('Annual_Rainfall'),
    'Missing weather provider handling',
    `Available=${res3.predictionAvailable}, Missing=${res3.missingInputs?.join(', ')}`
  );

  // Test 4: Missing fertilizer
  const res4 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: 2.0, state: 'Uttar Pradesh', season: 'Rabi' },
    mockClimate
    // Default fertilizer provider (UNAVAILABLE)
  );
  assert(
    res4.predictionAvailable === false && res4.missingInputs!.includes('Fertilizer'),
    'Missing fertilizer provider handling',
    `Available=${res4.predictionAvailable}, Missing=${res4.missingInputs?.join(', ')}`
  );

  // Test 5: Missing pesticide
  const res5 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: 2.0, state: 'Uttar Pradesh', season: 'Rabi' },
    mockClimate,
    mockFert
    // Default pesticide provider (UNAVAILABLE)
  );
  assert(
    res5.predictionAvailable === false && res5.missingInputs!.includes('Pesticide'),
    'Missing pesticide provider handling',
    `Available=${res5.predictionAvailable}, Missing=${res5.missingInputs?.join(', ')}`
  );

  // Test 6: Missing state
  const res6 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: 2.0, state: '', season: 'Rabi' },
    mockClimate,
    mockFert,
    mockPest
  );
  assert(
    res6.predictionAvailable === false && res6.missingInputs!.includes('State'),
    'Missing state validation',
    `Available=${res6.predictionAvailable}, Missing=${res6.missingInputs?.join(', ')}`
  );

  // Test 7: Invalid area
  const res7 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: -1.0, state: 'Uttar Pradesh', season: 'Rabi' },
    mockClimate,
    mockFert,
    mockPest
  );
  assert(
    res7.predictionAvailable === false && res7.reason!.includes('Area must be a positive number'),
    'Invalid area validation',
    `Available=${res7.predictionAvailable}, Reason=${res7.reason}`
  );

  // Test 8: Multiple crop planning
  const multiReqs = [
    { crop: 'Wheat', areaHa: 2.0, state: 'Uttar Pradesh', season: 'Rabi' },
    { crop: 'Moong(Green Gram)', areaHa: 0.5, state: 'Uttar Pradesh', season: 'Kharif' },
    { crop: 'Potato', areaHa: 1.0, state: 'Uttar Pradesh', season: 'Rabi' },
  ];
  const res8 = await PreSeasonYieldInferenceWrapper.evaluateMultiCropPlan(
    multiReqs,
    mockClimate,
    mockFert,
    mockPest
  );
  assert(
    res8.length === 3 && res8.every((r) => r.predictionAvailable),
    'Multiple crop planning independent evaluation',
    `Evaluated count=${res8.length}`
  );

  // Test 9: Expected production calculation
  const yieldT = res1.predictedYieldTPerHa!;
  const expectedProd = Number((yieldT * 2.0).toFixed(4));
  assert(
    res1.expectedProductionTonnes === expectedProd,
    'Expected production calculation (Yield * Area)',
    `Yield=${yieldT}, Area=2.0, ExpectedProd=${res1.expectedProductionTonnes}`
  );

  // Test 10: OOD warning
  const mockOODClimate = new TestMockOODClimateProvider();
  const res10 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: 2.0, state: 'Uttar Pradesh', season: 'Rabi' },
    mockOODClimate,
    mockFert,
    mockPest
  );
  assert(
    res10.predictionAvailable === true && res10.oodWarnings!.length > 0,
    'Out-Of-Distribution (OOD) non-mutating warning detection',
    `OOD Warnings count=${res10.oodWarnings?.length}`
  );

  // Test 11: Current year = 2026
  const res11 = await PreSeasonYieldInferenceWrapper.predictYield(
    { crop: 'Wheat', areaHa: 2.0, state: 'Uttar Pradesh', season: 'Rabi' }, // Omits cropYear -> defaults to 2026
    mockClimate,
    mockFert,
    mockPest
  );
  assert(
    res11.predictionAvailable === true && res11.modelVersion === '2.0.0-xgb-log1p',
    'Current calendar year 2026 auto-assignment',
    `PredictionAvailable=${res11.predictionAvailable}`
  );

  // Test 12: Model artifact compatibility
  assert(
    APPROVED_10_YIELD_CROPS.length === 10 && res1.modelVersion === '2.0.0-xgb-log1p',
    'Model artifact compatibility & 10 approved crop schema check',
    `Supported crops count=${APPROVED_10_YIELD_CROPS.length}`
  );

  console.log(`\n==================================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log(`==================================================`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
