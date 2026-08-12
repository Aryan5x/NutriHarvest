import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { NutritionAgent } from './src/backend/nutrition_agent';
import { CropPlanningAgent } from './src/backend/crop_planning_agent';
import { ClimateAgent } from './src/backend/climate_agent';
import { MarketAgent } from './src/backend/market_agent';
import { FinanceOptimizationAgent } from './src/backend/finance_optimization_agent';
import { GeminiExplainer } from './src/backend/gemini_explainer';
import { PROVENANCE_REGISTRY } from './src/data/data_sources';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes FIRST

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'NutriHarvest AI Backend Engine' });
  });

  // 2. Data Provenance Registry
  app.get('/api/data-sources', (req, res) => {
    res.json({ sources: PROVENANCE_REGISTRY });
  });

  // 3. XGBoost ML Yield Model Metrics
  app.get('/api/ml/metrics', (req, res) => {
    const metrics = CropPlanningAgent.getModelMetrics();
    res.json({ metrics });
  });

  // 4. Nutrition Agent calculation
  app.post('/api/nutrition/calculate', (req, res) => {
    const { ageGroups, cropAllocationsKg } = req.body;
    const target = NutritionAgent.calculateHouseholdMonthlyRDA(ageGroups || { children0_5: 1, children6_12: 1, teens13_18: 0, adults19_59: 2, seniors60Plus: 0 });
    const achieved = NutritionAgent.calculateHarvestNutritionalYield(cropAllocationsKg || { WHEAT: 250, CHICKPEA: 80, TOMATO: 50 });
    const coverage = NutritionAgent.computeNutritionCoverageScore(achieved, target);

    res.json({ target, achieved, coverage });
  });

  // 5. Crop Planning & XGBoost Yield Prediction
  app.post('/api/crops/plan', (req, res) => {
    const { farm, season } = req.body;
    const candidates = CropPlanningAgent.generateCropPlan(farm, season || 'RABI');
    const modelMetrics = CropPlanningAgent.getModelMetrics();

    res.json({ candidates, modelMetrics });
  });

  // 6. Climate Agent & Open-Meteo Weather
  app.get('/api/climate/weather', async (req, res) => {
    const lat = Number(req.query.lat) || 29.6857; // Karnal, Haryana
    const lng = Number(req.query.lng) || 76.9905;

    const weatherData = await ClimateAgent.fetchHyperlocalWeather(lat, lng);
    res.json(weatherData);
  });

  // 7. Market Agent & AGMARKNET Mandi Prices + Prophet Forecast
  app.get('/api/market/prices', (req, res) => {
    const state = req.query.state as string;
    const commodity = req.query.commodity as string;

    const records = MarketAgent.getMandiPrices(state, commodity);
    const primaryRecord = records[0] || { modalPricePerKg: 24.0, commodity: commodity || 'Wheat' };
    const forecast = MarketAgent.forecastPrice(primaryRecord.commodity, primaryRecord.modalPricePerKg);

    res.json({ records, primaryForecast: forecast });
  });

  // 8. Finance & Closed-Loop OR-Tools Harvest Optimization
  app.post('/api/finance/optimize', (req, res) => {
    const { crop, ageGroups, mandiPrice, forecast, storageCapacityKg, transportCostPerKg, storageCostPerKg } = req.body;

    const allocation = FinanceOptimizationAgent.solveHarvestAllocation(
      crop,
      ageGroups,
      mandiPrice,
      forecast,
      storageCapacityKg || 500,
      transportCostPerKg || 1.2,
      storageCostPerKg || 0.8
    );

    res.json({ allocation });
  });

  // 9. Gemini AI Farm Plan Explainer
  app.post('/api/gemini/explain', async (req, res) => {
    const { structuredData, targetLanguage } = req.body;
    const explanation = await GeminiExplainer.explainFarmPlan(structuredData, targetLanguage || 'English');
    res.json(explanation);
  });

  // 10. Gemini Farmer Assistant Q&A
  app.post('/api/gemini/ask', async (req, res) => {
    const { query, farmContext, targetLanguage } = req.body;
    const answer = await GeminiExplainer.answerFarmerQuery(query, farmContext, targetLanguage || 'English');
    res.json({ answer });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NutriHarvest AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
