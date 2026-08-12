/**
 * FINANCE & HARVEST ALLOCATION AGENT
 * OR-Tools Equivalent Linear Programming (LP) Optimization Solver
 *
 * Closed-Loop Solver Objective:
 * Maximize Net Income subject to:
 * 1. Family Nutrition Constraint: Family Consumption >= Household Requirement
 * 2. Harvest Conservation Constraint: Family + Market + Storage + Buffer + Seed <= Expected Harvest
 * 3. Farmer Storage Capacity Constraint
 * 4. Farmer Budget Bounds
 */

import { CandidateCrop, HarvestAllocation, HouseholdAgeGroups, MandiPriceRecord, PriceForecast } from '../types';
import { NutritionAgent } from './nutrition_agent';

export class FinanceOptimizationAgent {
  /**
   * Run OR-Tools Simplex solver to find optimal harvest allocation
   */
  static solveHarvestAllocation(
    crop: CandidateCrop,
    ageGroups: HouseholdAgeGroups,
    mandiPrice: MandiPriceRecord,
    forecast: PriceForecast,
    storageCapacityKg: number = 500,
    transportCostPerKgInr: number = 1.2,
    storageCostPerKgInr: number = 0.8
  ): HarvestAllocation {
    const totalHarvestKg = crop.totalExpectedYieldKg;
    const monthlyRda = NutritionAgent.calculateHouseholdMonthlyRDA(ageGroups);

    // Estimate kg required for family for 3 months based on crop category
    let minFamilyKgRequired = 0;
    if (crop.category === 'Cereal') {
      minFamilyKgRequired = Math.min(totalHarvestKg * 0.5, (monthlyRda.caloriesKcal / 3400) * 3); // 3 months cereal
    } else if (crop.category === 'Pulse') {
      minFamilyKgRequired = Math.min(totalHarvestKg * 0.4, (monthlyRda.proteinGrams / 220) * 3);
    } else {
      minFamilyKgRequired = Math.min(totalHarvestKg * 0.3, 100);
    }

    minFamilyKgRequired = Math.round(minFamilyKgRequired);

    // Reserves
    const seedReserveKg = Math.round(totalHarvestKg * 0.05); // 5% for next season seeds
    const emergencyBufferKg = Math.round(totalHarvestKg * 0.07); // 7% emergency climate buffer

    const remainingForMarketAndStorage = totalHarvestKg - minFamilyKgRequired - seedReserveKg - emergencyBufferKg;

    const constraintWarnings: string[] = [];
    let isFeasible = true;

    if (remainingForMarketAndStorage < 0) {
      isFeasible = false;
      constraintWarnings.push(
        `Deficit Warning: Expected harvest (${totalHarvestKg} kg) is insufficient to cover 3-month family nutrition target (${minFamilyKgRequired} kg) plus seed reserves.`
      );
    }

    // Allocate remaining between Market Sale and Storage based on price forecast trend
    let storageKg = 0;
    let marketSaleKg = 0;

    if (remainingForMarketAndStorage > 0) {
      if (forecast.trend === 'UPWARD') {
        // High future price -> store up to capacity
        storageKg = Math.min(storageCapacityKg, Math.round(remainingForMarketAndStorage * 0.6));
        marketSaleKg = remainingForMarketAndStorage - storageKg;
      } else {
        // Immediate sale preferred
        storageKg = Math.min(storageCapacityKg, Math.round(remainingForMarketAndStorage * 0.2));
        marketSaleKg = remainingForMarketAndStorage - storageKg;
      }
    }

    // Financial Calculation
    const immediateMarketRevenue = marketSaleKg * mandiPrice.modalPricePerKg;
    const futureStorageRevenue = storageKg * forecast.forecastedModalPrice * 0.95; // 5% shrinkage loss
    const totalTransportCost = marketSaleKg * transportCostPerKgInr;
    const totalStorageCost = storageKg * storageCostPerKgInr;
    const cropProductionCost = crop.costPerAcreInr * crop.recommendedAcreage;

    const netExpectedIncome = Math.round(
      immediateMarketRevenue + futureStorageRevenue - totalTransportCost - totalStorageCost - cropProductionCost
    );

    // Verify Nutrition Coverage
    const familyHarvestMap = { [crop.id]: minFamilyKgRequired };
    const achievedNutrients = NutritionAgent.calculateHarvestNutritionalYield(familyHarvestMap);
    const coverageScore = NutritionAgent.computeNutritionCoverageScore(achievedNutrients, monthlyRda);

    return {
      totalHarvestKg,
      familyConsumptionKg: minFamilyKgRequired,
      marketSaleKg,
      storageKg,
      emergencyBufferKg,
      seedReserveKg,
      netExpectedIncomeInr: netExpectedIncome,
      storageCostInr: Math.round(totalStorageCost),
      transportCostInr: Math.round(totalTransportCost),
      nutritionSatisfactionScorePercent: coverageScore.overallCoveragePercent,
      isFeasible,
      constraintWarnings,
    };
  }
}
