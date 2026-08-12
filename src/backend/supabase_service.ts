/**
 * SUPABASE SERVICE & AUTHENTICATION CLIENT
 * Handles Supabase auth, session persistence across restarts, RLS database tables,
 * and persistent user profile & onboarding data storage.
 */

import { createClient } from '@supabase/supabase-js';
import { FarmProfile, HouseholdProfile } from '../types';

const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || 'https://placeholder-supabase-url.supabase.co';
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseProfile {
  id: string;
  email: string;
  farmer_name: string;
  created_at?: string;
  household_data?: HouseholdProfile;
  farm_data?: FarmProfile;
}

export class SupabaseService {
  /**
   * Checks if Supabase credentials are configured via environment variables
   */
  static isConfigured(): boolean {
    const url = meta.env?.VITE_SUPABASE_URL;
    return Boolean(url && url !== '' && !url.includes('placeholder') && !url.includes('your-project'));
  }

  /**
   * Listens to Supabase auth state changes for automatic session restoration
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!this.isConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Fetches active persistent auth session from Supabase (or local session registry)
   */
  static async getSession() {
    if (!this.isConfigured()) {
      try {
        const storedSession = localStorage.getItem('nutriharvest_active_session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          if (parsed?.user?.id) {
            return { session: { user: parsed.user }, error: null };
          }
        }
      } catch (err) {
        console.warn('Error reading local active session:', err);
      }
      return { session: null, error: null };
    }

    const { data, error } = await supabase.auth.getSession();
    if (data?.session?.user) {
      const u = data.session.user;
      return {
        session: {
          user: {
            id: u.id,
            email: u.email || '',
            farmerName: u.user_metadata?.farmer_name || 'Farmer',
          },
        },
        error: null,
      };
    }

    return { session: null, error };
  }

  /**
   * Creates a new user account with Supabase Auth and bootstraps user profile
   */
  static async signUp(email: string, password: string, farmerName: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { user: null, session: null, error: new Error('Email and password are required.') };
    }

    if (!this.isConfigured()) {
      // Local User Registry Simulation
      let users: any[] = [];
      try {
        const stored = localStorage.getItem('nutriharvest_users_db');
        if (stored) users = JSON.parse(stored);
      } catch {}

      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return {
          user: null,
          session: null,
          error: new Error('An account with this email already exists. Please log in instead.'),
        };
      }

      const newUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: cleanEmail,
        password: cleanPassword,
        farmerName: farmerName || 'Farmer',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('nutriharvest_users_db', JSON.stringify(users));

      const sessionUser = { id: newUser.id, email: newUser.email, farmerName: newUser.farmerName };
      localStorage.setItem('nutriharvest_active_session', JSON.stringify({ user: sessionUser }));

      return { user: sessionUser, session: { user: sessionUser }, error: null };
    }

    // Live Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: { farmer_name: farmerName },
      },
    });

    if (error || !data.user) {
      return { user: null, session: null, error: error || new Error('Sign up failed.') };
    }

    const sessionUser = {
      id: data.user.id,
      email: data.user.email || cleanEmail,
      farmerName: data.user.user_metadata?.farmer_name || farmerName || 'Farmer',
    };

    try {
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          email: cleanEmail,
          farmer_name: farmerName || 'Farmer',
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Supabase profile creation note:', err);
    }

    return { user: sessionUser, session: data.session || { user: sessionUser }, error: null };
  }

  /**
   * Signs in an existing user with Supabase Auth
   */
  static async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { user: null, session: null, error: new Error('Please enter both email and password.') };
    }

    if (!this.isConfigured()) {
      // Local User Registry Simulation
      let users: any[] = [];
      try {
        const stored = localStorage.getItem('nutriharvest_users_db');
        if (stored) users = JSON.parse(stored);
      } catch {}

      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        return {
          user: null,
          session: null,
          error: new Error('No account found or incorrect email/password. Please sign up or check your credentials.'),
        };
      }

      if (found.password !== cleanPassword) {
        return {
          user: null,
          session: null,
          error: new Error('No account found or incorrect email/password. Please sign up or check your credentials.'),
        };
      }

      const sessionUser = { id: found.id, email: found.email, farmerName: found.farmerName || 'Farmer' };
      localStorage.setItem('nutriharvest_active_session', JSON.stringify({ user: sessionUser }));

      return { user: sessionUser, session: { user: sessionUser }, error: null };
    }

    // Live Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error || !data.user) {
      return {
        user: null,
        session: null,
        error: new Error('No account found or incorrect email/password. Please sign up or check your credentials.'),
      };
    }

    const sessionUser = {
      id: data.user.id,
      email: data.user.email || cleanEmail,
      farmerName: data.user.user_metadata?.farmer_name || 'Farmer',
    };

    return { user: sessionUser, session: data.session, error: null };
  }

  /**
   * Signs out the current user session
   */
  static async signOut() {
    try {
      localStorage.removeItem('nutriharvest_active_session');
    } catch {}

    if (this.isConfigured()) {
      const { error } = await supabase.auth.signOut();
      return { error };
    }

    return { error: null };
  }

  /**
   * Gets the current authenticated user object
   */
  static async getCurrentUser() {
    if (!this.isConfigured()) {
      try {
        const storedSession = localStorage.getItem('nutriharvest_active_session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          return parsed?.user || null;
        }
      } catch {}
      return null;
    }

    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        farmerName: data.user.user_metadata?.farmer_name || 'Farmer',
      };
    }
    return null;
  }

  /**
   * Stores initial guided onboarding data into Supabase database (and local storage fallback)
   */
  static async saveOnboardingProfile(
    userId: string,
    data: { farmer: HouseholdProfile; farm: FarmProfile }
  ) {
    if (!userId) {
      return { success: false, mode: 'failed', error: 'User ID is missing.' };
    }

    // 1. Save locally for instant restore & offline capability
    try {
      localStorage.setItem(`nutriharvest_onboarding_${userId}`, JSON.stringify(data));

      let dbMap: Record<string, any> = {};
      const storedMap = localStorage.getItem('nutriharvest_onboarding_db');
      if (storedMap) dbMap = JSON.parse(storedMap);
      dbMap[userId] = data;
      localStorage.setItem('nutriharvest_onboarding_db', JSON.stringify(dbMap));
    } catch (e) {
      console.warn('LocalStorage save note:', e);
    }

    if (!this.isConfigured()) {
      return { success: true, mode: 'local' };
    }

    try {
      // Upsert into farmer_onboarding table in Supabase
      const { error: onboardingErr } = await supabase.from('farmer_onboarding').upsert([
        {
          user_id: userId,
          farmer_name: data.farmer.farmerName,
          household_size: data.farmer.householdSize,
          diet_preference: data.farmer.dietPreference,
          age_groups: data.farmer.ageGroups,
          land_area_acres: data.farm.landAreaAcres,
          state: data.farm.state,
          district: data.farm.district,
          water_source: data.farm.waterSource,
          budget_inr: data.farm.budgetInr,
          soil_type: data.farm.soil?.type || 'Alluvial Loam',
          soil_ph: data.farm.soil?.pH || 7.2,
          soil_nitrogen: data.farm.soil?.nitrogenKgHa || 140,
          soil_phosphorus: data.farm.soil?.phosphorusKgHa || 28,
          crop_history: data.farm.cropHistory || ['Wheat', 'Rice'],
          updated_at: new Date().toISOString(),
        },
      ]);

      if (onboardingErr) {
        console.warn('Note on Supabase farmer_onboarding table upsert:', onboardingErr.message);
      }

      // Also update profiles table
      await supabase.from('profiles').upsert([
        {
          id: userId,
          farmer_name: data.farmer.farmerName,
          updated_at: new Date().toISOString(),
        },
      ]);

      return { success: true, mode: 'supabase' };
    } catch (err) {
      console.warn('Error saving to Supabase database, cached locally:', err);
      return { success: true, mode: 'local_fallback' };
    }
  }

  /**
   * Retrieves onboarding data for a user from Supabase database (or local storage fallback)
   */
  static async getOnboardingProfile(userId: string): Promise<{
    farmer: HouseholdProfile | null;
    farm: FarmProfile | null;
    hasCompleted: boolean;
  }> {
    if (!userId) {
      return { farmer: null, farm: null, hasCompleted: false };
    }

    let localProfile: { farmer: HouseholdProfile; farm: FarmProfile } | null = null;
    try {
      const storedIndividual = localStorage.getItem(`nutriharvest_onboarding_${userId}`);
      if (storedIndividual) {
        localProfile = JSON.parse(storedIndividual);
      } else {
        const storedMap = localStorage.getItem('nutriharvest_onboarding_db');
        if (storedMap) {
          const dbMap = JSON.parse(storedMap);
          if (dbMap[userId]) {
            localProfile = dbMap[userId];
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage read note:', e);
    }

    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('farmer_onboarding')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (data && !error) {
          const farmer: HouseholdProfile = {
            id: userId,
            farmerName: data.farmer_name || 'Farmer',
            householdSize: data.household_size || 5,
            ageGroups: data.age_groups || { children0_5: 1, children6_12: 1, teens13_18: 0, adults19_59: 2, seniors60Plus: 1 },
            dietPreference: data.diet_preference || 'VEGETARIAN',
          };

          const farm: FarmProfile = {
            id: `farm_${userId}`,
            farmerId: userId,
            farmName: `${data.farmer_name || 'Farmer'}'s Field`,
            state: data.state || 'Haryana',
            district: data.district || 'Karnal',
            latitude: 29.6857,
            longitude: 76.9905,
            landAreaAcres: data.land_area_acres || 2.5,
            waterSource: data.water_source || 'IRRIGATED_BOREWELL',
            budgetInr: data.budget_inr || 25000,
            cropHistory: Array.isArray(data.crop_history) ? data.crop_history : ['Wheat', 'Rice'],
            soil: {
              type: data.soil_type || 'Alluvial Loam',
              pH: data.soil_ph || 7.2,
              nitrogenKgHa: data.soil_nitrogen || 140,
              phosphorusKgHa: data.soil_phosphorus || 28,
              potassiumKgHa: 195,
              organicCarbonPercent: 0.65,
            },
          };

          try {
            localStorage.setItem(`nutriharvest_onboarding_${userId}`, JSON.stringify({ farmer, farm }));
          } catch {}

          return { farmer, farm, hasCompleted: true };
        }
      } catch (err) {
        console.warn('Note on fetching Supabase onboarding profile:', err);
      }
    }

    if (localProfile?.farmer && localProfile?.farm) {
      if (!Array.isArray(localProfile.farm.cropHistory)) {
        localProfile.farm.cropHistory = ['Wheat', 'Rice'];
      }
      if (!localProfile.farm.soil) {
        localProfile.farm.soil = {
          type: 'Alluvial Loam',
          pH: 7.2,
          nitrogenKgHa: 140,
          phosphorusKgHa: 28,
          potassiumKgHa: 195,
          organicCarbonPercent: 0.65,
        };
      }
      return { farmer: localProfile.farmer, farm: localProfile.farm, hasCompleted: true };
    }

    return {
      farmer: null,
      farm: null,
      hasCompleted: false,
    };
  }
}
