import type { WeatherData } from '../types/weather.types';
import axios, { AxiosError } from 'axios';
import { API_KEY, API_URL } from '../consts';

export async function getWeatherData(location: string): Promise<number | null> {
  try {
    const response = await axios.get<WeatherData>(`${API_URL}?location=${encodeURIComponent(location)}`, {
      headers: { 'x-api-key': API_KEY }
    })
    console.log('response', response.data)
    return parseInt(response.data.location.degreeDays)
  } catch (error: unknown) {
    if ((error as AxiosError).response?.status === 404) {
      return null
    }
    throw (error as AxiosError).response?.data;
  }
}
