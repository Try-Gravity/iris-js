/**
 * Shared type definitions for Iris packages
 */

/**
 * Configuration options for the IrisClient
 */
export interface IrisClientConfig {
  apiKey: string;
  excludedTopics: string[];
}

/**
 * Parameters for getting an advertisement
 */
export interface GetAdParams {
  inputPrompt: string;
  responsePrompt: string;
  userId: string;
}

/**
 * Advertisement response structure
 */
export interface AdResponse {
  text: string;
  impUrl?: string;
  clickUrl?: string;
  payout?: number;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * React component props for IrisAd
 * Note: React-specific types are declared conditionally to avoid dependencies in non-React packages
 */
export interface IrisAdProps {
  /** The advertisement data to display */
  ad: AdResponse;
  /** CSS class for the container element */
  className?: string;
  /** CSS class for the text element */
  textClassName?: string;
  /** CSS class for the button element */
  buttonClassName?: string;
  /** Custom button text, defaults to "Learn More" */
  buttonText?: string;
  /** Custom click handler, defaults to opening URL in new tab */
  onButtonClick?: (url: string, event: any) => void;
  /** Whether to render the component (useful for conditional rendering) */
  show?: boolean;
}