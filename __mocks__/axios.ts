console.log('Loading axios mock'); // Debug log

class MockAxiosError extends Error {
  public config: any;
  public code?: string;
  public request?: any;
  public response?: any;
  public isAxiosError: boolean = true;

  constructor(message: string, code?: string, config?: any, request?: any, response?: any) {
    super(message);
    this.config = config;
    this.code = code;
    this.request = request;
    this.response = response;
  }
}

const mockAxiosInstance = {
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
  },
};

console.log('Exporting AxiosError:', MockAxiosError); // Debug log

export default {
  create: jest.fn(() => mockAxiosInstance),
  get: jest.fn(),
  AxiosError: MockAxiosError,
};