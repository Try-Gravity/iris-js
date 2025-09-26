import axios, { AxiosResponse, AxiosError } from 'axios';
import { IrisClient } from '../IrisClient';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IrisClient', () => {
  let client: IrisClient;
  const mockApiKey = 'test-api-key-12345';
  const mockExcludedTopics = ['politics', 'adult'];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      defaults: {
        baseURL: 'https://api.iristech.dev',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`,
        }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    
    client = new IrisClient(mockApiKey, mockExcludedTopics);
  });

  describe('Constructor', () => {
    it('creates client with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.iristech.dev',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`,
        },
      });
    });

    it('stores API key and excluded topics', () => {
      expect(client.getExcludedTopics()).toEqual(['politics', 'adult']);
    });
  });

  describe('getAd', () => {
    const mockInputPrompt = 'What is the weather like?';
    const mockResponsePrompt = 'The weather is sunny today.';
    const mockUserId = 'user-123';

    it('returns AdResponse with impression and click URLs when API call succeeds', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Try our weather app!',
          impUrl: 'https://api.iristech.dev/impression?id=abc123',
          clickUrl: 'https://api.iristech.dev/click?id=abc123&redirect=https://weather-app.com',
          payout: 0.15
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(mockPost).toHaveBeenCalledWith('/bids', {
        apiKey: mockApiKey,
        inputPrompt: mockInputPrompt,
        responsePrompt: mockResponsePrompt,
        userId: mockUserId,
        excludedTopics: mockExcludedTopics,
      });

      expect(result).toEqual({
        text: 'Try our weather app!',
        impUrl: 'https://api.iristech.dev/impression?id=abc123',
        clickUrl: 'https://api.iristech.dev/click?id=abc123&redirect=https://weather-app.com',
        payout: 0.15
      });
    });

    it('handles response with missing impression URL', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Try our weather app!',
          // impUrl is missing
          clickUrl: 'https://api.iristech.dev/click?id=abc123&redirect=https://weather-app.com',
          payout: 0.15
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toEqual({
        text: 'Try our weather app!',
        impUrl: undefined,
        clickUrl: 'https://api.iristech.dev/click?id=abc123&redirect=https://weather-app.com',
        payout: 0.15
      });
    });

    it('handles response with missing click URL', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Try our weather app!',
          impUrl: 'https://api.iristech.dev/impression?id=abc123',
          // clickUrl is missing
          payout: 0.15
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toEqual({
        text: 'Try our weather app!',
        impUrl: 'https://api.iristech.dev/impression?id=abc123',
        clickUrl: undefined,
        payout: 0.15
      });
    });

    it('handles response with null impression and click URLs', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Try our weather app!',
          impUrl: null,
          clickUrl: null,
          payout: 0.15
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toEqual({
        text: 'Try our weather app!',
        impUrl: null,
        clickUrl: null,
        payout: 0.15
      });
    });

    it('handles response with empty string URLs', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Try our weather app!',
          impUrl: '',
          clickUrl: '',
          payout: 0.15
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toEqual({
        text: 'Try our weather app!',
        impUrl: '',
        clickUrl: '',
        payout: 0.15
      });
    });

    it('returns null when response is missing required fields', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          // Missing text
          impUrl: 'https://api.iristech.dev/impression?id=abc123',
          clickUrl: 'https://api.iristech.dev/click?id=abc123',
          payout: 0.15
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toBeNull();
    });

    it('returns null when response data is null', async () => {
      const mockApiResponse: AxiosResponse = {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toBeNull();
    });

    it('returns null when response data is undefined', async () => {
      const mockApiResponse: AxiosResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    const mockInputPrompt = 'What is the weather like?';
    const mockResponsePrompt = 'The weather is sunny today.';
    const mockUserId = 'user-123';

    beforeEach(() => {
      // Mock console.error to avoid cluttering test output
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('handles network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      Object.assign(networkError, {
        code: 'NETWORK_ERROR',
        request: {}
      });

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockRejectedValue(networkError);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[IrisClient.getAd] Unexpected Error:',
        networkError
      );
    });

    it('handles HTTP error responses gracefully', async () => {
      const httpError: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 404',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'Endpoint not found' },
          headers: {},
          config: {} as any
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({})
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockRejectedValue(httpError);

      // Mock axios.isAxiosError
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[IrisClient.getAd] API Error:',
        {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'Endpoint not found' }
        }
      );
    });

    it('handles timeout errors gracefully', async () => {
      const timeoutError: AxiosError = {
        name: 'AxiosError',
        message: 'timeout of 10000ms exceeded',
        code: 'ECONNABORTED',
        request: {},
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({})
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockRejectedValue(timeoutError);

      // Mock axios.isAxiosError
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[IrisClient.getAd] Network Error:',
        {
          message: 'No response received from server',
          code: 'ECONNABORTED'
        }
      );
    });

    it('handles non-axios errors gracefully', async () => {
      const genericError = new Error('Something went wrong');

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockRejectedValue(genericError);

      // Mock axios.isAxiosError to return false
      mockedAxios.isAxiosError.mockReturnValue(false);

      const result = await client.getAd(mockInputPrompt, mockResponsePrompt, mockUserId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[IrisClient.getAd] Unexpected Error:',
        genericError
      );
    });
  });

  describe('Excluded Topics Management', () => {
    it('updates excluded topics correctly', () => {
      const newExcludedTopics = ['sports', 'technology'];
      client.updateExcludedTopics(newExcludedTopics);

      expect(client.getExcludedTopics()).toEqual(['sports', 'technology']);
    });

    it('returns a copy of excluded topics array', () => {
      const excludedTopics = client.getExcludedTopics();
      excludedTopics.push('new-topic');

      // Original array should not be modified
      expect(client.getExcludedTopics()).toEqual(['politics', 'adult']);
    });

    it('sends updated excluded topics in API requests', async () => {
      const newExcludedTopics = ['sports', 'technology'];
      client.updateExcludedTopics(newExcludedTopics);

      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Test ad',
          url: 'https://example.com',
          impUrl: 'https://api.iristech.dev/impression?id=123',
          clickUrl: 'https://api.iristech.dev/click?id=123'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      await client.getAd('input', 'response', 'user-123');

      expect(mockPost).toHaveBeenCalledWith('/bids', {
        apiKey: mockApiKey,
        inputPrompt: 'input',
        responsePrompt: 'response',
        userId: 'user-123',
        excludedTopics: newExcludedTopics,
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long URLs in response', async () => {
      const longUrl = 'https://example.com/' + 'x'.repeat(2000);
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Test ad',
          url: 'https://example.com',
          impUrl: longUrl,
          clickUrl: longUrl,
          payout: 0.25
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd('input', 'response', 'user-123');

      expect(result).toEqual({
        text: 'Test ad',
        url: 'https://example.com',
        impUrl: longUrl,
        clickUrl: longUrl,
        payout: 0.25
      });
    });

    it('handles special characters in URLs', async () => {
      const urlWithSpecialChars = 'https://example.com/path?param=value&other=test%20data';
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Test ad',
          url: 'https://example.com',
          impUrl: urlWithSpecialChars,
          clickUrl: urlWithSpecialChars,
          payout: 0.25
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd('input', 'response', 'user-123');

      expect(result).toEqual({
        text: 'Test ad',
        url: 'https://example.com',
        impUrl: urlWithSpecialChars,
        clickUrl: urlWithSpecialChars,
        payout: 0.25
      });
    });

    it('handles zero payout value', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Free ad',
          url: 'https://example.com',
          impUrl: 'https://api.iristech.dev/impression?id=123',
          clickUrl: 'https://api.iristech.dev/click?id=123',
          payout: 0
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd('input', 'response', 'user-123');

      expect(result).toEqual({
        text: 'Free ad',
        url: 'https://example.com',
        impUrl: 'https://api.iristech.dev/impression?id=123',
        clickUrl: 'https://api.iristech.dev/click?id=123',
        payout: 0
      });
    });

    it('handles negative payout value', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          text: 'Test ad',
          url: 'https://example.com',
          impUrl: 'https://api.iristech.dev/impression?id=123',
          clickUrl: 'https://api.iristech.dev/click?id=123',
          payout: -0.1
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      const mockPost = client['httpClient'].post as jest.MockedFunction<any>;
      mockPost.mockResolvedValue(mockApiResponse);

      const result = await client.getAd('input', 'response', 'user-123');

      expect(result).toEqual({
        text: 'Test ad',
        url: 'https://example.com',
        impUrl: 'https://api.iristech.dev/impression?id=123',
        clickUrl: 'https://api.iristech.dev/click?id=123',
        payout: -0.1
      });
    });
  });
});
