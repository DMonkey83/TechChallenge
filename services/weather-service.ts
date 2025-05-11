import type { WeatherData } from "../types/weather.types";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_KEY, API_URL } from "../consts";

const MAX_RETRIES = 3;
const DELAY_MS = 600;

interface CustomAxiosReqConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "x-api-key": API_KEY,
  },
});

function formatError(error: AxiosError, url: string): Error {
  const status = error.response?.status || "Unwknown";
  const message = error.message;
  const data = error.response?.data
    ? ` -- ${JSON.stringify(error.response.data)}`
    : "";
  return new Error(
    `Weather API request failed: ${status} - ${message}${data}\nURL: ${url}`
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as CustomAxiosReqConfig | undefined;
    if (!config) {
      return Promise.reject(error);
    }

    if (error.response?.status === 500) {
      const retryCount = config.retryCount || 0;
      if (retryCount < MAX_RETRIES) {
        config.retryCount = retryCount + 1;
        console.log(`Retry requirest: ${retryCount + 1} /${MAX_RETRIES}`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        return apiClient(config)
      }
    }
  }
);

export async function getWeatherData(location: string): Promise<number | null> {
  try {
    const response = await axios.get<WeatherData>(
      `${API_URL}?location=${encodeURIComponent(location)}`,
      {
        headers: { "x-api-key": API_KEY },
      }
    );
    const degreeDaysRaw = response.data?.location?.degreeDays;

    // parse degreeDays
    let degreeDays: number | undefined;
    if (typeof degreeDaysRaw === 'string') {
      degreeDays = parseFloat(degreeDaysRaw);
    } else if (typeof degreeDaysRaw === 'number') {
      degreeDays = degreeDaysRaw
    }
    // degree days validation
    if (typeof degreeDays === 'number' && !isNaN(degreeDays) && degreeDays > 0) {
      return degreeDays;
    }
    console.warn(
      `Invalid or missing degreeDays for ${location}:`,
      JSON.stringify(response.data, null, 2)
    )
    return null;
  } catch (error: unknown) {
    const url = `/weather?location=${encodeURIComponent(location)}`
    throw formatError(error as AxiosError, url)
  }
}
