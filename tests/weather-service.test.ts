import axios, { AxiosError, AxiosResponse, AxiosRequestHeaders } from 'axios';
import { getWeatherData, apiClient } from '../services/weather-service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('WeatherService', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.resetModules(); // Clear module cache to reload weather-service.ts
    jest.clearAllMocks();

    // Create a mock Axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    };

    // Mock axios.create to return the mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getWeatherData', () => {
    it('returns degreeDays when response contains valid number', async () => {
      const mockResponse: AxiosResponse = {
        data: { location: { degreeDays: 1835 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData('Severn Valley (Filton)');

      expect(result).toBe(1835);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('parses and returns degreeDays when response contains valid string', async () => {
      const mockResponse: AxiosResponse = {
        data: { location: { degreeDays: '1835.5' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData('Severn Valley (Filton)');

      expect(result).toBe(1835.5);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns null when degreeDays is missing', async () => {
      const mockResponse: AxiosResponse = {
        data: { location: {} },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData('Severn Valley (Filton)');

      expect(result).toBeNull();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        `Invalid or missing degreeDays for Severn Valley (Filton):`,
        expect.any(String)
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns null when degreeDays is NaN', async () => {
      const mockResponse: AxiosResponse = {
        data: { location: { degreeDays: 'invalid' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData('Severn Valley (Filton)');

      expect(result).toBeNull();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        `Invalid or missing degreeDays for Severn Valley (Filton):`,
        expect.any(String)
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns null when degreeDays is negative', async () => {
      const mockResponse: AxiosResponse = {
        data: { location: { degreeDays: -1835 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData('Severn Valley (Filton)');

      expect(result).toBeNull();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        `Invalid or missing degreeDays for Severn Valley (Filton):`,
        expect.any(String)
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns null for network error', async () => {
      const mockError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);

      const result = await getWeatherData('Severn Valley (Filton)');

      expect(result).toBeNull();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching weather data for Severn Valley (Filton):`,
        'Network Error',
        expect.any(String)
      );
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('returns null for non-500 status code', async () => {
      const mockError: AxiosError = new AxiosError(
        'Not Found',
        '404',
        undefined,
        undefined,
        { status: 404, data: {}, statusText: 'Not Found', headers: {}, config: { headers: {} as AxiosRequestHeaders } }
      );
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);

      const result = await getWeatherData('Severn Valley (Filton)');

      expect(result).toBeNull();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching weather data for Severn Valley (Filton):`,
        'Not Found',
        expect.any(String)
      );
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('retries up to 3 times for 500 error and succeeds', async () => {
      jest.useFakeTimers();
      const mockError: AxiosError = new AxiosError(
        'Internal Server Error',
        '500',
        { url: '/weather?location=Severn%20Valley%20(Filton)', headers: {} as AxiosRequestHeaders },
        undefined,
        { status: 500, data: {}, statusText: 'Internal Server Error', headers: {}, config: { url: '/weather?location=Severn%20Valley%20(Filton)', headers: {} as AxiosRequestHeaders } }
      );
      const mockSuccess: AxiosResponse = {
        data: { location: { degreeDays: 1835 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/weather?location=Severn%20Valley%20(Filton)', headers: {} as AxiosRequestHeaders },
      };

      // Fail twice, succeed on third attempt
      mockAxiosInstance.get
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const promise = getWeatherData('Severn Valley (Filton)');

      // Advance timers for retries
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(1000); // Second retry

      const result = await promise;

      expect(result).toBe(1835);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Retrying request to /weather?location=Severn%20Valley%20(Filton) (Attempt 2/3)`
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Retrying request to /weather?location=Severn%20Valley%20(Filton) (Attempt 3/3)`
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('fails after 3 retries for persistent 500 error', async () => {
      jest.useFakeTimers();
      const mockError: AxiosError = new AxiosError(
        'Internal Server Error',
        '500',
        { url: '/weather?location=Severn%20Valley%20(Filton)', headers: {} as AxiosRequestHeaders },
        undefined,
        { status: 500, data: {}, statusText: 'Internal Server Error', headers: {}, config: { url: '/weather?location=Severn%20Valley%20(Filton)', headers: {} as AxiosRequestHeaders } }
      );

      // Fail all retries
      mockAxiosInstance.get
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError);

      const promise = getWeatherData('Severn Valley (Filton)');

      // Advance timers for retries
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(1000); // Second retry

      const result = await promise;

      expect(result).toBeNull();
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather?location=Severn%20Valley%20(Filton)');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Retrying request to /weather?location=Severn%20Valley%20(Filton) (Attempt 2/3)`
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Retrying request to /weather?location=Severn%20Valley%20(Filton) (Attempt 3/3)`
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching weather data for Severn Valley (Filton):`,
        'Internal Server Error',
        expect.any(String)
      );
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });
});