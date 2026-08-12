/**
 * FARM PROGRESS SERVICE
 * Manages day-to-day farm progress logging and timeline events.
 * Enables farmers to log daily operations, growth stages, irrigation, rainfall, fertilizer, and pest observations.
 */

import { DailyFarmLog } from '../types';

export class FarmProgressService {
  /**
   * Add a new daily progress log entry
   */
  static addLogEntry(entry: Omit<DailyFarmLog, 'id' | 'loggedAt'>): DailyFarmLog {
    const fullLog: DailyFarmLog = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      loggedAt: new Date().toISOString(),
    };

    try {
      const logs = this.getLogsForUser(entry.userId);
      logs.unshift(fullLog);
      localStorage.setItem(`nutriharvest_daily_logs_${entry.userId}`, JSON.stringify(logs));
    } catch (e) {
      console.warn('LocalStorage save daily log note:', e);
    }

    return fullLog;
  }

  /**
   * Get all daily logs for a user, sorted chronologically
   */
  static getLogsForUser(userId: string): DailyFarmLog[] {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(`nutriharvest_daily_logs_${userId}`);
      if (stored) {
        const logs: DailyFarmLog[] = JSON.parse(stored);
        return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (e) {
      console.warn('LocalStorage read daily logs note:', e);
    }
    return [];
  }

  /**
   * Get default initial logs if user has no logs yet, based on user's crops
   */
  static getOrInitializeLogs(userId: string, cropName: string, plotName: string): DailyFarmLog[] {
    const existing = this.getLogsForUser(userId);
    if (existing.length > 0) return existing;

    // Provide initial timeline starter based on user's actual profile creation
    const today = new Date().toISOString().split('T')[0];
    const initialLogs: DailyFarmLog[] = [
      {
        id: `log_init_1`,
        userId,
        cropName,
        plotName,
        date: today,
        growthStage: 'SOWING',
        irrigationLiters: 5000,
        irrigationMethod: 'Drip / Tube-well',
        fertilizerUsed: 'Organic Compost (50 kg/acre) & Neem Cake',
        cropCondition: 'EXCELLENT',
        activityNotes: `Sowing completed for ${cropName} in ${plotName}. Baseline soil moisture checked.`,
        loggedAt: new Date().toISOString(),
      },
    ];

    try {
      localStorage.setItem(`nutriharvest_daily_logs_${userId}`, JSON.stringify(initialLogs));
    } catch {}

    return initialLogs;
  }

  /**
   * Delete a daily log entry for a user
   */
  static deleteLogEntry(userId: string, logId: string): boolean {
    if (!userId || !logId) return false;
    try {
      const logs = this.getLogsForUser(userId);
      const filtered = logs.filter((l) => l.id !== logId);
      localStorage.setItem(`nutriharvest_daily_logs_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.warn('Error deleting daily log entry:', e);
      return false;
    }
  }
}
