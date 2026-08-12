/**
 * CLIMATE AGENT
 * Open-Meteo REST API Connector & Rule-Based Advisory Engine
 * Strict Anti-Hallucination: Weather data originates directly from Open-Meteo REST API call or cached snapshot.
 */

import { WeatherAlert, WeatherObservation } from '../types';
import { OpenMeteoWeatherProvider } from './weather_provider';

export class ClimateAgent {
  /**
   * Fetch live weather from Open-Meteo REST API using OpenMeteoWeatherProvider
   */
  static async fetchHyperlocalWeather(
    latitude: number,
    longitude: number
  ): Promise<{ observation: WeatherObservation; alerts: WeatherAlert[] }> {
    const provider = OpenMeteoWeatherProvider.getInstance();
    return provider.getWeatherForecast(latitude, longitude);
  }
}
