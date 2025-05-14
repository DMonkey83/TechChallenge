import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { WeatherData } from "../types/weather.types";
import { API_KEY, API_URL } from "../consts";

// Configuration for retries
const MAX_RETRIES = 3;
const DELAY_MS = 1000;

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "x-api-key": API_KEY,
  },
});

// Add retry interceptor
// weather-service.ts, in the response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = (error.config || {}) as AxiosRequestConfig & { retryCount?: number };
    let retryCount = config.retryCount || 0;
    if (retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }
    config['retryCount'] = retryCount + 1;
    console.log(`Retrying request to ${config.url} (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    return apiClient.request(config);
  }
);

// Fetch weather data for a given location
export async function getWeatherData(location: string): Promise<number | null> {
  try {
    const response = await apiClient.get(
      `/weather?location=${encodeURIComponent(location)}`
    );

    // Access degreeDays from nested location object
    const degreeDaysRaw = response.data?.location?.degreeDays;

    // Parse degreeDays
    let degreeDays: number | undefined;
    if (typeof degreeDaysRaw === "string") {
      degreeDays = parseFloat(degreeDaysRaw);
    } else if (typeof degreeDaysRaw === "number") {
      degreeDays = degreeDaysRaw;
    }

    // Validate degreeDays
    if (
      typeof degreeDays === "number" &&
      degreeDays !== undefined &&
      !isNaN(degreeDays) &&
      degreeDays > 0
    ) {
      return degreeDays;
    }

    // Log unexpected response structure
    console.warn(
      `Invalid or missing degreeDays for ${location}:`,
      degreeDays,
      JSON.stringify(response.data, null, 2)
    );
    return null;
  } catch (error) {
    console.error(
      `Error fetching weather data for ${location}:`,
      (error as Error).message,
      "\nRaw error:",
      JSON.stringify(error, null, 2)
    );
    return null;
  }
}
