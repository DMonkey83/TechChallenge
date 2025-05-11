import axios, { AxiosHeaders } from 'axios';

// Mock axios (uses __mocks__/axios.ts)
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('WeatherService', () => {
  let getWeatherData: any, apiClient: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    // import weather service functions
    const module = await import('../services/weather-service');
    getWeatherData = module.getWeatherData;
    apiClient = module.apiClient;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  const jestMock = mockedAxios.create().get as jest.Mock;

  describe('getWeatherData', () => {
    it('returns degreeDays for valid response', async () => {
      const location = 'Test Region';
      const mockResponse = {
        data: { location: { degreeDays: 1835 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} },
      };
      jestMock.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData(location);

      expect(result).toBe(1835);
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns number for string degreeDays', async () => {
      const location = 'Test Region';
      const mockResponse = {
        data: { location: { degreeDays: '1835.5' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} },
      };
      jestMock.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData(location);

      expect(result).toBe(1835.5);
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns null for invalid degreeDays string', async () => {
      const location = 'Test Region';
      const mockResponse = {
        data: { location: { degreeDays: 'invalid' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} },
      };
      jestMock.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData(location);

      expect(result).toBeNull();
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        `Invalid or missing degreeDays for ${location}:`,
        NaN,
        expect.any(String)
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns null for negative degreeDays', async () => {
      const location = 'Test Region';
      const mockResponse = {
        data: { location: { degreeDays: -1835 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} },
      };
      jestMock.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData(location);

      expect(result).toBeNull();
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        `Invalid or missing degreeDays for ${location}:`,
        -1835,
        expect.any(String)
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('returns null for missing degreeDays', async () => {
      const location = 'Test Region';
      const mockResponse = {
        data: { location: {} },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} },
      };
      jestMock.mockResolvedValueOnce(mockResponse);

      const result = await getWeatherData(location);

      expect(result).toBeNull();
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        `Invalid or missing degreeDays for ${location}:`,
        undefined,
        expect.any(String)
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
    it('returns null for 404 error', async () => {
      const location = 'North-Eastern (Leeming)';
      const mockError = new mockedAxios.AxiosError(
        'Request failed with status code 404',
        '404',
        { headers: {} as AxiosHeaders},
        undefined,
        { status: 404, data: 'Not Found', statusText: 'Not Found', headers: {}, config: { headers: {} as AxiosHeaders} }
      );
      jestMock.mockRejectedValueOnce(mockError);

      const result = await getWeatherData(location);

      expect(result).toBeNull();
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching weather data for ${location}:`,
        'Request failed with status code 404',
        '\nRaw error:',
        expect.any(String)
      );
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('returns null for network error', async () => {
      const location = 'Test Region';
      const mockError = new Error('Network Error');
      jestMock.mockRejectedValueOnce(mockError);

      const result = await getWeatherData(location);

      expect(result).toBeNull();
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching weather data for ${location}:`,
        'Network Error',
        '\nRaw error:',
        expect.any(String)
      );
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
    it('returns null for 500 error due to retry failure', async () => {
      jest.useFakeTimers();
      const location = 'Thames Valley (Heathrow)';
      const mockError = new mockedAxios.AxiosError(
        'Internal Server Error',
        '500',
        { url: `/weather?location=${encodeURIComponent(location)}`, headers: {}  as AxiosHeaders},
        undefined,
        { status: 500, data: 'Internal Server Error', statusText: 'Internal Server Error', headers: {}, config: { url: `/weather?location=${encodeURIComponent(location)}`, headers: {} as AxiosHeaders} }
      );

      jestMock.mockRejectedValueOnce(mockError);

      const promise = getWeatherData(location);

      jest.advanceTimersByTime(1000); // Attempt to trigger retry (won't happen due to bug)

      const result = await promise;

      expect(result).toBeNull();
      expect(mockedAxios.create().get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching weather data for ${location}:`,
        'Internal Server Error',
        '\nRaw error:',
        expect.any(String)
      );
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('fails after one attempt for persistent 500 error due to retry failure', async () => {
      jest.useFakeTimers();
      const location = 'Thames Valley (Heathrow)';
      const mockError = new mockedAxios.AxiosError(
        'Internal Server Error',
        '500',
        { url: `/weather?location=${encodeURIComponent(location)}`, headers: {} as AxiosHeaders},
        undefined,
        { status: 500, data: 'Internal Server Error', statusText: 'Internal Server Error', headers: {}, config: { url: `/weather?location=${encodeURIComponent(location)}`, headers: {} as AxiosHeaders} }
      );

      jestMock.mockRejectedValueOnce(mockError);

      const promise = getWeatherData(location);

      jest.advanceTimersByTime(1000); // Attempt to trigger retry (won't happen due to bug)

      const result = await promise;

      expect(result).toBeNull();
      expect(mockedAxios.create().get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.create().get).toHaveBeenCalledWith(`/weather?location=${encodeURIComponent(location)}`);
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        `Error fetching weather data for ${location}:`,
        'Internal Server Error',
        '\nRaw error:',
        expect.any(String)
      );
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });
});