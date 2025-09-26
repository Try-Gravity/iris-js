import axios, { AxiosInstance, AxiosError } from 'axios';
import { AdResponse, ApiErrorResponse } from '../../shared-types';

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
      // TODO: Replace with actual API endpoint
      baseURL: 'https://api.iristech.dev',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  /**
   * Get a targeted advertisement based on input parameters
   * @param inputPrompt - The input prompt context
   * @param responsePrompt - The response prompt context  
   * @param userId - The user identifier
   * @returns Promise<AdResponse | null> - Advertisement data or null if no ad found
   */
  async getAd(inputPrompt: string, responsePrompt: string, userId: string): Promise<AdResponse | null> {
    try {
      const response = await this.httpClient.post('/bids', {
        apiKey: this.apiKey,
        inputPrompt,
        responsePrompt,
        userId,
        excludedTopics: this.excludedTopics,
      });

      // Check if response contains valid ad data
      if (response.data && response.data.text) {
        return {
          text: response.data.text,
          impUrl: response.data.impUrl,
          clickUrl: response.data.clickUrl,
          payout: response.data.payout,
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