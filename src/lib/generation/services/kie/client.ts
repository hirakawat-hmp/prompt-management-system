/**
 * Kie.ai HTTP Client
 *
 * Handles authentication, request/response processing, error handling,
 * and exponential backoff retry logic for Kie.ai API calls.
 */

import type { ProviderParams } from '@/types/generation';

// ============================================================================
// Types
// ============================================================================

/**
 * Kie.ai API Response wrapper
 */
export interface KieApiResponse<T = unknown> {
  code: number;
  msg?: string;
  data: T;
  details?: Record<string, unknown>;
}

/**
 * Kie.ai task creation response
 */
export interface KieCreateTaskResponse {
  taskId: string;
}

/**
 * Kie.ai task query response
 */
export interface KieTaskData {
  taskId: string;
  state?: string; // Imagen4, Sora2
  successFlag?: number; // Veo3, Midjourney (0=pending, 1=success, 2/3=failed)
  resultJson?: string; // Imagen4, Sora2
  response?: {
    resultUrls?: string[];
  }; // Veo3, Midjourney
  failCode?: string;
  failMsg?: string;
}

/**
 * Kie.ai task query response
 */
export interface KieQueryTaskResponse {
  code: number;
  msg?: string;
  data: KieTaskData;
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  maxRetries?: number;
  timeout?: number;
}

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Custom error for Kie.ai API responses
 */
export class KieApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'KieApiError';
  }
}

// ============================================================================
// Kie.ai HTTP Client
// ============================================================================

/**
 * HTTP client for Kie.ai API
 *
 * Features:
 * - Bearer token authentication
 * - Request/response processing
 * - Error handling with detailed messages
 * - Exponential backoff retry for transient errors
 * - Request timeouts
 */
export class KieClient {
  /** Base URL for Kie.ai API */
  public baseUrl = 'https://api.kie.ai';

  /** API key for authentication */
  private apiKey: string;

  /**
   * Initialize Kie.ai client
   *
   * @throws {Error} If KIE_API_KEY environment variable is not set
   */
  constructor() {
    const apiKey = process.env.KIE_API_KEY;
    if (!apiKey) {
      throw new Error('KIE_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  /**
   * Make GET request to Kie.ai API
   *
   * @param endpoint API endpoint path
   * @param params Query parameters
   * @param options Request options
   * @returns Parsed API response
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<KieApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this._request('GET', url.toString(), undefined, options);
  }

  /**
   * Make POST request to Kie.ai API
   *
   * @param endpoint API endpoint path
   * @param body Request body
   * @param options Request options
   * @returns Parsed API response
   */
  async post<T = unknown>(
    endpoint: string,
    body: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<KieApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this._request('POST', url, body, options);
  }

  /**
   * Internal method to make HTTP requests with retry logic
   *
   * @param method HTTP method
   * @param url Full URL
   * @param body Request body (optional)
   * @param options Request options
   * @returns Parsed API response
   */
  private async _request<T = unknown>(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<KieApiResponse<T>> {
    const maxRetries = options?.maxRetries ?? 3;
    const timeout = options?.timeout ?? 30000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add delay for retries (exponential backoff)
        if (attempt > 0) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this._sleep(delayMs);
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          // Make fetch request
          const response = await fetch(url, {
            method,
            headers: this._getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Parse response
          const data: KieApiResponse<T> = await response.json();

          // Check for HTTP errors
          if (!response.ok) {
            const errorMessage = this._getErrorMessage(response.status, data);

            // Determine if we should retry
            if (this._shouldRetry(response.status) && attempt < maxRetries) {
              lastError = new KieApiError(
                errorMessage,
                response.status,
                data.code,
                data.details
              );
              continue; // Retry
            }

            // Throw error if not retrying
            throw new KieApiError(errorMessage, response.status, data.code, data.details);
          }

          return data;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If this was our last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Check if error is retryable
        if (error instanceof KieApiError && !this._shouldRetry(error.statusCode)) {
          throw error;
        }
      }
    }

    // Should not reach here, but just in case
    throw lastError || new Error('Unknown error');
  }

  /**
   * Get request headers with authentication
   */
  private _getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Format error message based on HTTP status
   */
  private _getErrorMessage(status: number, response: any): string {
    const msg = response?.msg || 'Unknown error';

    switch (status) {
      case 401:
        return `Unauthorized (401): ${msg}`;
      case 402:
        return `Payment Required (402): ${msg}`;
      case 422:
        return `Validation Error (422): ${msg}`;
      case 429:
        return `Rate Limited (429): ${msg}`;
      case 500:
        return `Server Error (500): ${msg}`;
      default:
        return `HTTP Error (${status}): ${msg}`;
    }
  }

  /**
   * Determine if HTTP status code is retryable
   *
   * Retryable: 429 (rate limit), 500 (server error)
   * Non-retryable: 401 (auth), 402 (payment), 422 (validation)
   */
  private _shouldRetry(statusCode: number): boolean {
    return statusCode === 429 || statusCode === 500;
  }

  /**
   * Sleep for specified milliseconds
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// High-level API Functions
// ============================================================================

/**
 * Create a generation task on Kie.ai
 *
 * Handles routing to the correct endpoint based on model type.
 *
 * @param params Provider parameters with service + model
 * @returns Task ID
 * @throws {KieApiError} If API call fails
 *
 * @example
 * const { taskId } = await createKieTask({
 *   service: 'KIE',
 *   model: 'IMAGEN4',
 *   apiModel: 'google/imagen4-fast',
 *   input: { prompt: 'A sunset over mountains' },
 * });
 */
export async function createKieTask(params: ProviderParams): Promise<KieCreateTaskResponse> {
  const client = new KieClient();

  // Determine endpoint based on model
  const endpoint = _getCreateEndpoint(params);

  // Transform params to API request format
  const requestBody = _transformToKieFormat(params);

  // Make API call
  const response = await client.post<{ taskId: string }>(endpoint, requestBody);

  // Extract and return taskId
  return {
    taskId: response.data.taskId,
  };
}

/**
 * Query task status on Kie.ai
 *
 * Handles routing to the correct endpoint based on model type.
 *
 * @param model Model type (determines endpoint)
 * @param taskId External task ID from Kie.ai
 * @returns Task status response
 * @throws {KieApiError} If API call fails
 *
 * @example
 * const response = await queryKieTask('IMAGEN4', 'task_abc123');
 * if (response.data.state === 'success') {
 *   const urls = JSON.parse(response.data.resultJson).resultUrls;
 * }
 */
export async function queryKieTask(
  model: 'IMAGEN4' | 'VEO3' | 'MIDJOURNEY' | 'SORA2',
  taskId: string
): Promise<KieQueryTaskResponse> {
  const client = new KieClient();

  // Determine endpoint based on model
  const endpoint = _getQueryEndpoint(model);

  // Make API call
  const response = await client.get<KieTaskData>(endpoint, { taskId });

  return response as KieQueryTaskResponse;
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Get create task endpoint for a given model
 */
function _getCreateEndpoint(params: ProviderParams): string {
  switch (params.model) {
    case 'IMAGEN4':
      return '/api/v1/jobs/createTask';
    case 'VEO3':
      return '/api/v1/veo/generate';
    case 'MIDJOURNEY':
      return '/api/v1/mj/generate';
    case 'SORA2':
      return '/api/v1/jobs/createTask';
    default:
      const _exhaustive: never = params;
      throw new Error(`Unknown model: ${_exhaustive}`);
  }
}

/**
 * Get query task endpoint for a given model
 */
function _getQueryEndpoint(model: 'IMAGEN4' | 'VEO3' | 'MIDJOURNEY' | 'SORA2'): string {
  switch (model) {
    case 'IMAGEN4':
      return '/api/v1/jobs/recordInfo';
    case 'VEO3':
      return '/api/v1/veo/record-info';
    case 'MIDJOURNEY':
      return '/api/v1/mj/record-info';
    case 'SORA2':
      return '/api/v1/jobs/recordInfo';
    default:
      const _exhaustive: never = model;
      throw new Error(`Unknown model: ${_exhaustive}`);
  }
}

/**
 * Transform TypeScript ProviderParams to Kie.ai API format
 *
 * Each model has different request structure expectations.
 */
function _transformToKieFormat(params: ProviderParams): Record<string, unknown> {
  switch (params.model) {
    case 'IMAGEN4':
      // Imagen4 expects { model, input, callBackUrl }
      return {
        model: params.apiModel,
        input: params.input,
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
      };

    case 'SORA2':
      // Sora2 expects { model, input, callBackUrl }
      return {
        model: params.apiModel,
        input: params.input,
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
      };

    case 'VEO3':
      // Veo3 expects flat structure with all params at root level
      const veo3Body: Record<string, unknown> = {
        prompt: params.prompt,
        modelVariant: params.modelVariant,
      };
      if (params.generationType) veo3Body.generationType = params.generationType;
      if (params.imageUrls) veo3Body.imageUrls = params.imageUrls;
      if (params.aspectRatio) veo3Body.aspectRatio = params.aspectRatio;
      if (params.seeds) veo3Body.seeds = params.seeds;
      if (params.watermark) veo3Body.watermark = params.watermark;
      if (params.callBackUrl) veo3Body.callBackUrl = params.callBackUrl;
      if (params.enableTranslation) veo3Body.enableTranslation = params.enableTranslation;
      return veo3Body;

    case 'MIDJOURNEY':
      // Midjourney expects flat structure
      const mjBody: Record<string, unknown> = {
        taskType: params.taskType,
        prompt: params.prompt,
      };
      if (params.speed) mjBody.speed = params.speed;
      if (params.fileUrls) mjBody.fileUrls = params.fileUrls;
      if (params.aspectRatio) mjBody.aspectRatio = params.aspectRatio;
      if (params.version) mjBody.version = params.version;
      if (params.variety !== undefined) mjBody.variety = params.variety;
      if (params.stylization !== undefined) mjBody.stylization = params.stylization;
      if (params.weirdness !== undefined) mjBody.weirdness = params.weirdness;
      if (params.ow !== undefined) mjBody.ow = params.ow;
      if (params.waterMark) mjBody.waterMark = params.waterMark;
      if (params.enableTranslation) mjBody.enableTranslation = params.enableTranslation;
      if (params.callBackUrl) mjBody.callBackUrl = params.callBackUrl;
      if (params.videoBatchSize) mjBody.videoBatchSize = params.videoBatchSize;
      if (params.motion) mjBody.motion = params.motion;
      return mjBody;

    default:
      const _exhaustive: never = params;
      throw new Error(`Unknown model: ${_exhaustive}`);
  }
}
