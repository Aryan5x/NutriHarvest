/**
 * NUTRITION AGENT
 * Direct ICMR 2020 RDA & ICMR-NIN IFCT 2017 Composition Engine
 * Strictly deterministic calculations (No LLM guessing for RDA values).
 */

import { IFCT2017_CROP_NUTRITION, ICMR_DAILY_RDA, getCropNutritionInfo } from '../data/ifct2017_nutrition';
import { HouseholdAgeGroups, HouseholdProfile, NutrientTarget, NutritionCoverageScore } from '../types';

export class NutritionAgent {
  /**
   * Calculate daily nutrient target for a household based on age groups
   */
  static calculateHouseholdDailyRDA(ageGroups: HouseholdAgeGroups): NutrientTarget {
    const target: NutrientTarget = {
      proteinGrams: 0,
      ironMg: 0,
      calciumMg: 0,
      vitaminAMcg: 0,
      vitaminCMg: 0,
      fiberGrams: 0,
      caloriesKcal: 0,
    };

    // Sum across age groups
    const rdaMap: Array<[keyof HouseholdAgeGroups, keyof typeof ICMR_DAILY_RDA]> = [
      ['children0_5', 'children0_5'],
      ['children6_12', 'children6_12'],
      ['teens13_18', 'teens13_18'],
      ['adults19_59', 'adults19_59'],
      ['seniors60Plus', 'seniors60Plus'],
    ];

    for (const [groupKey, rdaKey] of rdaMap) {
      const count = ageGroups[groupKey] || 0;
      const rda = ICMR_DAILY_RDA[rdaKey];
      target.proteinGrams += count * rda.protein;
      target.ironMg += count * rda.iron;
      target.calciumMg += count * rda.calcium;
      target.vitaminAMcg += count * rda.vitA;
      target.vitaminCMg += count * rda.vitC;
      target.fiberGrams += count * rda.fiber;
      target.caloriesKcal += count * rda.calories;
    }

    return target;
  }

  /**
   * Compute monthly household requirement (Daily RDA * 30 days)
   */
  static calculateHouseholdMonthlyRDA(ageGroups: HouseholdAgeGroups): NutrientTarget {
    const daily = this.calculateHouseholdDailyRDA(ageGroups);
    return {
      proteinGrams: daily.proteinGrams * 30,
      ironMg: daily.ironMg * 30,
      calciumMg: daily.calciumMg * 30,
      vitaminAMcg: daily.vitaminAMcg * 30,
      vitaminCMg: daily.vitaminCMg * 30,
      fiberGrams: daily.fiberGrams * 30,
      caloriesKcal: daily.caloriesKcal * 30,
    };
  }

  /**
   * Evaluate nutritional output of a given harvest consumption allocation (in kg)
   */
  static calculateHarvestNutritionalYield(cropAllocationsKg: Record<string, number>): NutrientTarget {
    const totalYield: NutrientTarget = {
      proteinGrams: 0,
      ironMg: 0,
      calciumMg: 0,
      vitaminAMcg: 0,
      vitaminCMg: 0,
      fiberGrams: 0,
      caloriesKcal: 0,
    };

    for (const [cropKey, quantityKg] of Object.entries(cropAllocationsKg)) {
      const cropInfo = getCropNutritionInfo(cropKey);
      if (!cropInfo || quantityKg <= 0) continue;

      // 1 kg = 10 * 100g
      const multiplier = quantityKg * 10;
      const p = cropInfo.per100g;

      totalYield.proteinGrams += p.proteinGrams * multiplier;
      totalYield.ironMg += p.ironMg * multiplier;
      totalYield.calciumMg += p.calciumMg * multiplier;
      totalYield.vitaminAMcg += p.vitaminAMcg * multiplier;
      totalYield.vitaminCMg += p.vitaminCMg * multiplier;
      totalYield.fiberGrams += p.fiberGrams * multiplier;
      totalYield.caloriesKcal += p.caloriesKcal * multiplier;
    }

    return totalYield;
  }

  /**
   * Calculate Nutrition Coverage Score against Household Requirement
   * Formula: coverage = min(100, achieved / target * 100)
   */
  static computeNutritionCoverageScore(
    achieved: NutrientTarget,
    target: NutrientTarget
  ): NutritionCoverageScore {
    const safeDiv = (ach: number, tgt: number) => (tgt > 0 ? Math.min(100, Math.round((ach / tgt) * 100)) : 100);

    const proteinCov = safeDiv(achieved.proteinGrams, target.proteinGrams);
    const ironCov = safeDiv(achieved.ironMg, target.ironMg);
    const calciumCov = safeDiv(achieved.calciumMg, target.calciumMg);
    const vitACov = safeDiv(achieved.vitaminAMcg, target.vitaminAMcg);
    const vitCCov = safeDiv(achieved.vitaminCMg, target.vitaminCMg);
    const fiberCov = safeDiv(achieved.fiberGrams, target.fiberGrams);
    const calCov = safeDiv(achieved.caloriesKcal, target.caloriesKcal);

    const scores = [proteinCov, ironCov, calciumCov, vitACov, vitCCov, fiberCov, calCov];
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const deficientNutrients: string[] = [];
    const gapRecommendations: string[] = [];

    if (proteinCov < 80) {
      deficientNutrients.push('Protein');
      gapRecommendations.push('Chickpea (Chana), Pigeon Pea (Tur), or Groundnut to boost household protein');
    }
    if (ironCov < 80) {
      deficientNutrients.push('Iron');
      gapRecommendations.push('Pearl Millet (Bajra), Spinach (Palak), or Lentils to increase bioavailable iron');
    }
    if (calciumCov < 80) {
      deficientNutrients.push('Calcium');
      gapRecommendations.push('Mustard Greens, Chickpea, or Ragi/Bajra for bone health');
    }
    if (vitACov < 80) {
      deficientNutrients.push('Vitamin A');
      gapRecommendations.push('Spinach (Palak) or Sweet Potato to combat micronutrient deficiency');
    }
    if (vitCCov < 80) {
      deficientNutrients.push('Vitamin C');
      gapRecommendations.push('Fresh Okra (Bhindi), Guava, or Green Peas for immune resilience');
    }

    return {
      overallCoveragePercent: overallScore,
      proteinCoveragePercent: proteinCov,
      ironCoveragePercent: ironCov,
      calciumCoveragePercent: calciumCov,
      vitaminACoveragePercent: vitACov,
      vitaminCCoveragePercent: vitCCov,
      fiberCoveragePercent: fiberCov,
      caloriesCoveragePercent: calCov,
      deficientNutrients,
      recommendedFoodsToFillGaps: gapRecommendations,
    };
  }
}
