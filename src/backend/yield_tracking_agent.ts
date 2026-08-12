/**
 * YIELD TRACKING AGENT
 * Manages post-harvest actual yield recording and continuous prediction error tracking.
 * Calculates: Prediction Error = Actual Yield - Predicted Yield
 * Stores records in local storage and Supabase.
 */

import { ActualYieldRecord } from '../types';

export class YieldTrackingAgent {
  /**
   * Save an actual harvest yield record for a user
   */
  static saveYieldRecord(record: Omit<ActualYieldRecord, 'id' | 'predictionErrorKg' | 'predictionErrorPercent' | 'loggedAt'>): ActualYieldRecord {
    const errorKg = record.actualYieldKg - record.predictedYieldKg;
    const errorPercent = record.predictedYieldKg > 0 
      ? Number(((errorKg / record.predictedYieldKg) * 100).toFixed(1))
      : 0;

    const fullRecord: ActualYieldRecord = {
      ...record,
      id: `yield_rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      predictionErrorKg: errorKg,
      predictionErrorPercent: errorPercent,
      loggedAt: new Date().toISOString(),
    };

    try {
      const records = this.getRecordsForUser(record.userId);
      records.unshift(fullRecord);
      localStorage.setItem(`nutriharvest_yield_tracking_${record.userId}`, JSON.stringify(records));
    } catch (e) {
      console.warn('LocalStorage save yield record note:', e);
    }

    return fullRecord;
  }

  /**
   * Retrieve all logged yield records for a user
   */
  static getRecordsForUser(userId: string): ActualYieldRecord[] {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(`nutriharvest_yield_tracking_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage read yield records note:', e);
    }
    return [];
  }

  /**
   * Compute error metrics across historical harvests for a user
   */
  static calculateUserYieldAccuracy(userId: string): {
    totalRecords: number;
    maeKg: number;
    meanErrorPercent: number;
    accuracyPercent: number;
    totalPredictedKg: number;
    totalActualKg: number;
  } {
    const records = this.getRecordsForUser(userId);
    if (records.length === 0) {
      return {
        totalRecords: 0,
        maeKg: 0,
        meanErrorPercent: 0,
        accuracyPercent: 0,
        totalPredictedKg: 0,
        totalActualKg: 0,
      };
    }

    let sumAbsErrorKg = 0;
    let sumErrorPercent = 0;
    let totalPredictedKg = 0;
    let totalActualKg = 0;

    for (const r of records) {
      sumAbsErrorKg += Math.abs(r.predictionErrorKg);
      sumErrorPercent += Math.abs(r.predictionErrorPercent);
      totalPredictedKg += r.predictedYieldKg;
      totalActualKg += r.actualYieldKg;
    }

    const maeKg = Math.round(sumAbsErrorKg / records.length);
    const meanErrorPercent = Number((sumErrorPercent / records.length).toFixed(1));
    const accuracyPercent = Math.max(0, Number((100 - meanErrorPercent).toFixed(1)));

    return {
      totalRecords: records.length,
      maeKg,
      meanErrorPercent,
      accuracyPercent,
      totalPredictedKg,
      totalActualKg,
    };
  }

  /**
   * Delete a recorded harvest yield record for a user
   */
  static deleteYieldRecord(userId: string, recordId: string): boolean {
    if (!userId || !recordId) return false;
    try {
      const records = this.getRecordsForUser(userId);
      const filtered = records.filter((r) => r.id !== recordId);
      localStorage.setItem(`nutriharvest_yield_tracking_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.warn('Error deleting yield record:', e);
      return false;
    }
  }
}
