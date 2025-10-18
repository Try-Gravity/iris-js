import axios, { AxiosInstance, AxiosError } from 'axios';
import { BidParams, BidResponse, ApiErrorResponse } from '../../shared-types';

/**
 * IrisClient - A client for interacting with the Iris advertising API
 */
export class IrisClient {
  private apiKey: string;
  private excludedTopics: string[];
  private httpClient: AxiosInstance;

  constructor(apiKey: string, excludedTopics: string[]) {
    this.apiKey = apiKey;
    this.excludedTopics = excludedTopics;
    
    this.httpClient = axios.create({
      baseURL: 'https://api.iristech.dev',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  /**
   * Get a targeted advertisement via the bids endpoint
   * @param params - BidParams matching the server schema
   * @returns Promise<BidResponse | null>
   */
  async getAd(params: BidParams): Promise<BidResponse | null> {
    try {
      const body: BidParams = {
        ...params,
        // prefer explicit apiKey in params, else default to client's apiKey
        apiKey: params.apiKey ?? this.apiKey,
        // supply top-level excludedTopics if not provided
        excludedTopics: params.excludedTopics ?? this.excludedTopics,
      };
      const response = await this.httpClient.post('/bids', body);

      // Check if response contains valid ad data
      if (response.status === 204) return null;

      if (response.data && response.data.adText) {
        const payload = response.data as BidResponse;
        return {
          adText: payload.adText,
          impUrl: payload.impUrl,
          clickUrl: payload.clickUrl,
          payout: payload.payout,
        };
      }

      // No ad found or invalid response structure
      return null;
    } catch (error) {
      this.handleError(error, 'getAd');
      return null;
    }
  }

  /**
   * Handle API errors with logging
   * @param error - The error object
   * @param method - The method name where error occurred
   */
  private handleError(error: any, method: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      if (axiosError.response) {
        // Server responded with error status
        console.error(`[IrisClient.${method}] API Error:`, {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
        });
      } else if (axiosError.request) {
        // Request was made but no response received
        console.error(`[IrisClient.${method}] Network Error:`, {
          message: 'No response received from server',
          code: axiosError.code,
        });
      } else {
        // Something else happened
        console.error(`[IrisClient.${method}] Request Error:`, axiosError.message);
      }
    } else {
      // Non-axios error
      console.error(`[IrisClient.${method}] Unexpected Error:`, error);
    }
  }

  /**
   * Update excluded topics
   * @param excludedTopics - New array of excluded topics
   */
  updateExcludedTopics(excludedTopics: string[]): void {
    this.excludedTopics = excludedTopics;
  }

  /**
   * Get current excluded topics
   * @returns Array of excluded topics
   */
  getExcludedTopics(): string[] {
    return [...this.excludedTopics];
  }
}