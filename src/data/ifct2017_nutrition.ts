/**
 * Source of Truth: Indian Food Composition Tables (IFCT 2017)
 * National Institute of Nutrition (NIN) / Indian Council of Medical Research (ICMR)
 * License / Attribution: ICMR-NIN IFCT 2017 (http://www.nin.res.in)
 */

import { CropNutritionInfo } from '../types';

export const IFCT2017_CROP_NUTRITION: Record<string, CropNutritionInfo> = {
  RICE: {
    cropId: 'RICE',
    cropName: 'Paddy / Rice (Oryza sativa)',
    category: 'Cereal',
    per100g: {
      proteinGrams: 7.1,
      ironMg: 0.7,
      calciumMg: 10,
      vitaminAMcg: 0,
      vitaminCMg: 0,
      fiberGrams: 0.2,
      caloriesKcal: 345,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table A.1 Raw Milled Rice)',
  },
  WHEAT: {
    cropId: 'WHEAT',
    cropName: 'Whole Wheat (Triticum aestivum)',
    category: 'Cereal',
    per100g: {
      proteinGrams: 11.8,
      ironMg: 3.9,
      calciumMg: 41,
      vitaminAMcg: 29,
      vitaminCMg: 0,
      fiberGrams: 11.2,
      caloriesKcal: 346,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table A.2 Whole Wheat Grain)',
  },
  BAJRA: {
    cropId: 'BAJRA',
    cropName: 'Pearl Millet / Bajra (Pennisetum glaucum)',
    category: 'Cereal',
    per100g: {
      proteinGrams: 11.6,
      ironMg: 8.0,
      calciumMg: 42,
      vitaminAMcg: 132,
      vitaminCMg: 0,
      fiberGrams: 11.5,
      caloriesKcal: 361,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table A.5 Pearl Millet)',
  },
  JOWAR: {
    cropId: 'JOWAR',
    cropName: 'Sorghum / Jowar (Sorghum bicolor)',
    category: 'Cereal',
    per100g: {
      proteinGrams: 10.4,
      ironMg: 4.1,
      calciumMg: 25,
      vitaminAMcg: 47,
      vitaminCMg: 0,
      fiberGrams: 9.7,
      caloriesKcal: 349,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table A.6 Sorghum Grain)',
  },
  MAIZE: {
    cropId: 'MAIZE',
    cropName: 'Maize / Corn (Zea mays)',
    category: 'Cereal',
    per100g: {
      proteinGrams: 11.1,
      ironMg: 2.3,
      calciumMg: 10,
      vitaminAMcg: 90,
      vitaminCMg: 0,
      fiberGrams: 12.2,
      caloriesKcal: 342,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table A.4 Dry Maize Grain)',
  },
  CHICKPEA: {
    cropId: 'CHICKPEA',
    cropName: 'Bengal Gram / Chickpea / Chana (Cicer arietinum)',
    category: 'Pulse',
    per100g: {
      proteinGrams: 20.1,
      ironMg: 5.3,
      calciumMg: 149,
      vitaminAMcg: 189,
      vitaminCMg: 3,
      fiberGrams: 25.2,
      caloriesKcal: 360,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table B.1 Whole Bengal Gram)',
  },
  PIGEON_PEA: {
    cropId: 'PIGEON_PEA',
    cropName: 'Red Gram / Pigeon Pea / Tur (Cajanus cajan)',
    category: 'Pulse',
    per100g: {
      proteinGrams: 22.3,
      ironMg: 2.7,
      calciumMg: 73,
      vitaminAMcg: 132,
      vitaminCMg: 0,
      fiberGrams: 15.0,
      caloriesKcal: 335,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table B.2 Red Gram Dal)',
  },
  LENTIL: {
    cropId: 'LENTIL',
    cropName: 'Lentil / Masoor (Lens culinaris)',
    category: 'Pulse',
    per100g: {
      proteinGrams: 25.1,
      ironMg: 7.5,
      calciumMg: 69,
      vitaminAMcg: 450,
      vitaminCMg: 0,
      fiberGrams: 10.7,
      caloriesKcal: 343,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table B.4 Masoor Dal)',
  },
  MOONG_BEAN: {
    cropId: 'MOONG_BEAN',
    cropName: 'Green Gram / Moong (Vigna radiata)',
    category: 'Pulse',
    per100g: {
      proteinGrams: 24.0,
      ironMg: 4.4,
      calciumMg: 124,
      vitaminAMcg: 83,
      vitaminCMg: 0,
      fiberGrams: 16.3,
      caloriesKcal: 334,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table B.3 Green Gram Whole)',
  },
  GROUNDNUT: {
    cropId: 'GROUNDNUT',
    cropName: 'Groundnut / Peanut (Arachis hypogaea)',
    category: 'Oilseed',
    per100g: {
      proteinGrams: 25.8,
      ironMg: 2.5,
      calciumMg: 90,
      vitaminAMcg: 37,
      vitaminCMg: 0,
      fiberGrams: 8.5,
      caloriesKcal: 567,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table C.1 Raw Groundnut Seeds)',
  },
  MUSTARD: {
    cropId: 'MUSTARD',
    cropName: 'Mustard Seed (Brassica juncea)',
    category: 'Oilseed',
    per100g: {
      proteinGrams: 20.0,
      ironMg: 7.9,
      calciumMg: 490,
      vitaminAMcg: 260,
      vitaminCMg: 0,
      fiberGrams: 8.0,
      caloriesKcal: 541,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table C.3 Mustard Seeds)',
  },
  POTATO: {
    cropId: 'POTATO',
    cropName: 'Potato (Solanum tuberosum)',
    category: 'Tuber',
    per100g: {
      proteinGrams: 1.6,
      ironMg: 0.5,
      calciumMg: 10,
      vitaminAMcg: 24,
      vitaminCMg: 17,
      fiberGrams: 1.7,
      caloriesKcal: 70,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table D.1 Potato Tuber)',
  },
  TOMATO: {
    cropId: 'TOMATO',
    cropName: 'Tomato (Solanum lycopersicum)',
    category: 'Vegetable',
    per100g: {
      proteinGrams: 0.9,
      ironMg: 0.6,
      calciumMg: 48,
      vitaminAMcg: 351,
      vitaminCMg: 27,
      fiberGrams: 1.7,
      caloriesKcal: 20,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table E.3 Ripe Tomato)',
  },
  ONION: {
    cropId: 'ONION',
    cropName: 'Onion (Allium cepa)',
    category: 'Vegetable',
    per100g: {
      proteinGrams: 1.2,
      ironMg: 0.6,
      calciumMg: 46,
      vitaminAMcg: 15,
      vitaminCMg: 11,
      fiberGrams: 2.1,
      caloriesKcal: 50,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table D.3 Raw Onion)',
  },
  SPINACH: {
    cropId: 'SPINACH',
    cropName: 'Spinach / Palak (Spinacia oleracea)',
    category: 'Vegetable',
    per100g: {
      proteinGrams: 2.0,
      ironMg: 1.14,
      calciumMg: 73,
      vitaminAMcg: 5580,
      vitaminCMg: 28,
      fiberGrams: 2.5,
      caloriesKcal: 26,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table F.1 Palak Leaves)',
  },
  OKRA: {
    cropId: 'OKRA',
    cropName: 'Okra / Bhindi (Abelmoschus esculentus)',
    category: 'Vegetable',
    per100g: {
      proteinGrams: 1.9,
      ironMg: 0.4,
      calciumMg: 66,
      vitaminAMcg: 52,
      vitaminCMg: 13,
      fiberGrams: 4.3,
      caloriesKcal: 27,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table E.1 Raw Lady Finger)',
  },
  BRINJAL: {
    cropId: 'BRINJAL',
    cropName: 'Brinjal / Eggplant / Baingan (Solanum melongena)',
    category: 'Vegetable',
    per100g: {
      proteinGrams: 1.4,
      ironMg: 0.4,
      calciumMg: 18,
      vitaminAMcg: 74,
      vitaminCMg: 12,
      fiberGrams: 1.3,
      caloriesKcal: 25,
    },
    provenance: 'ICMR-NIN IFCT 2017 (Table E.4 Brinjal)',
  },
};

/**
 * Robust resolver function for matching crop names/IDs to IFCT 2017 nutrition dataset
 */
export function getCropNutritionInfo(cropKey: string): CropNutritionInfo | null {
  if (!cropKey) return null;
  const upperKey = cropKey.toUpperCase().trim();

  // Direct key match
  if (IFCT2017_CROP_NUTRITION[upperKey]) {
    return IFCT2017_CROP_NUTRITION[upperKey];
  }

  // Synonym & substring match
  const clean = cropKey.toLowerCase().trim();

  if (clean.includes('wheat')) return IFCT2017_CROP_NUTRITION.WHEAT;
  if (clean.includes('rice') || clean.includes('paddy')) return IFCT2017_CROP_NUTRITION.RICE;
  if (clean.includes('bajra') || clean.includes('pearl millet')) return IFCT2017_CROP_NUTRITION.BAJRA;
  if (clean.includes('jowar') || clean.includes('sorghum')) return IFCT2017_CROP_NUTRITION.JOWAR;
  if (clean.includes('maize') || clean.includes('corn')) return IFCT2017_CROP_NUTRITION.MAIZE;
  if (clean.includes('chickpea') || clean.includes('chana') || clean.includes('bengal gram')) return IFCT2017_CROP_NUTRITION.CHICKPEA;
  if (clean.includes('pigeon') || clean.includes('tur') || clean.includes('arhar') || clean.includes('red gram')) return IFCT2017_CROP_NUTRITION.PIGEON_PEA;
  if (clean.includes('lentil') || clean.includes('masoor')) return IFCT2017_CROP_NUTRITION.LENTIL;
  if (clean.includes('moong') || clean.includes('green gram')) return IFCT2017_CROP_NUTRITION.MOONG_BEAN;
  if (clean.includes('groundnut') || clean.includes('peanut')) return IFCT2017_CROP_NUTRITION.GROUNDNUT;
  if (clean.includes('mustard')) return IFCT2017_CROP_NUTRITION.MUSTARD;
  if (clean.includes('potato')) return IFCT2017_CROP_NUTRITION.POTATO;
  if (clean.includes('tomato')) return IFCT2017_CROP_NUTRITION.TOMATO;
  if (clean.includes('onion')) return IFCT2017_CROP_NUTRITION.ONION;
  if (clean.includes('spinach') || clean.includes('palak')) return IFCT2017_CROP_NUTRITION.SPINACH;
  if (clean.includes('okra') || clean.includes('bhindi') || clean.includes('lady finger')) return IFCT2017_CROP_NUTRITION.OKRA;
  if (clean.includes('brinjal') || clean.includes('eggplant') || clean.includes('baingan')) return IFCT2017_CROP_NUTRITION.BRINJAL;

  for (const info of Object.values(IFCT2017_CROP_NUTRITION)) {
    if (info.cropName.toLowerCase().includes(clean) || clean.includes(info.cropId.toLowerCase())) {
      return info;
    }
  }

  return null;
}

/**
 * ICMR 2020 Recommended Dietary Allowances (RDA) per person per day
 */
export const ICMR_DAILY_RDA = {
  children0_5: { protein: 12.5, iron: 8, calcium: 500, vitA: 350, vitC: 30, fiber: 15, calories: 1060 },
  children6_12: { protein: 23.0, iron: 15, calcium: 600, vitA: 600, vitC: 40, fiber: 20, calories: 1700 },
  teens13_18: { protein: 45.0, iron: 28, calcium: 1000, vitA: 870, vitC: 65, fiber: 30, calories: 2400 },
  adults19_59: { protein: 54.0, iron: 19, calcium: 1000, vitA: 1000, vitC: 80, fiber: 30, calories: 2110 },
  seniors60Plus: { protein: 48.0, iron: 17, calcium: 1200, vitA: 1000, vitC: 80, fiber: 25, calories: 1800 },
};

