/**
 * Kie.ai Imagen4 Model Tests
 *
 * TDD RED Phase: Comprehensive tests for Imagen4 image generation
 * covering task creation, query, result transformation, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createImagen4Task,
  queryImagen4Task,
  transformImagen4Result,
} from './imagen4';
import type { KieImagen4Params } from '@/types/generation';
import type { KieQueryTaskResponse } from '../client';

// Mock environment variable
beforeEach(() => {
  process.env.KIE_API_KEY = 'test-api-key-123';
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Imagen4 Model', () => {
  describe('createImagen4Task', () => {
    it('should create task with basic prompt', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'task_imagen4_001',
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: {
          prompt: 'A beautiful sunset over mountains',
        },
      };

      const result = await createImagen4Task(params);

      expect(result).toEqual({ taskId: 'task_imagen4_001' });
    });

    it('should create task with all optional parameters', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'task_imagen4_002',
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: {
          prompt: 'A serene lake at dawn',
          negative_prompt: 'people, cars, buildings',
          aspect_ratio: '16:9',
          num_images: '4',
          seed: 12345,
        },
        callBackUrl: 'https://example.com/callback',
      };

      const result = await createImagen4Task(params);

      expect(result).toEqual({ taskId: 'task_imagen4_002' });
    });

    it('should handle callback URL correctly', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'task_imagen4_003',
        },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'Test prompt' },
        callBackUrl: 'https://example.com/webhook',
      };

      await createImagen4Task(params);

      const call = fetchSpy.mock.calls[0];
      const requestBody = JSON.parse((call[1] as RequestInit).body as string);

      expect(requestBody).toHaveProperty('callBackUrl', 'https://example.com/webhook');
    });

    it('should send correct API endpoint for Imagen4', async () => {
      const mockResponse = {
        code: 200,
        data: { taskId: 'task_123' },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'Test' },
      };

      await createImagen4Task(params);

      const call = fetchSpy.mock.calls[0];
      const url = call[0] as string;

      expect(url).toContain('/api/v1/jobs/createTask');
    });

    it('should include authorization header', async () => {
      const mockResponse = {
        code: 200,
        data: { taskId: 'task_123' },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'Test' },
      };

      await createImagen4Task(params);

      const call = fetchSpy.mock.calls[0];
      const options = call[1] as RequestInit;
      const headers = options.headers as Record<string, string>;

      expect(headers).toHaveProperty('Authorization');
      expect(headers.Authorization).toBe('Bearer test-api-key-123');
    });

    it('should handle API error (402 Insufficient credits)', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 402,
            msg: 'Insufficient account balance',
          }),
          { status: 402 }
        )
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'Test' },
      };

      await expect(createImagen4Task(params)).rejects.toThrow('Payment Required');
    });

    it('should handle validation error (422)', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 422,
            msg: 'Prompt is too long',
          }),
          { status: 422 }
        )
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'x'.repeat(10000) },
      };

      await expect(createImagen4Task(params)).rejects.toThrow('Validation Error');
    });

    it('should handle authentication error (401)', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 401,
            msg: 'Invalid API key',
          }),
          { status: 401 }
        )
      );

      const params: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'Test' },
      };

      await expect(createImagen4Task(params)).rejects.toThrow('Unauthorized');
    });

    it(
      'should handle network error with retries',
      { timeout: 30000 },
      async () => {
        // Mock all retries to fail with network error
        const fetchSpy = vi.spyOn(global, 'fetch');
        fetchSpy.mockRejectedValue(new Error('Network timeout'));

        const params: KieImagen4Params = {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        };

        await expect(createImagen4Task(params)).rejects.toThrow();
        // Verify retries were attempted
        expect(fetchSpy).toHaveBeenCalled();
      }
    );
  });

  describe('queryImagen4Task', () => {
    it('should query task when status is success', async () => {
      const mockResponse: KieQueryTaskResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'task_imagen4_001',
          state: 'success',
          resultJson: JSON.stringify({
            resultUrls: [
              'https://file.aiquickdraw.com/image1.jpg',
              'https://file.aiquickdraw.com/image2.jpg',
            ],
          }),
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await queryImagen4Task('task_imagen4_001');

      expect(result.data.taskId).toBe('task_imagen4_001');
      expect(result.data.state).toBe('success');
      expect(result.data.resultJson).toBeDefined();
    });

    it('should query task when status is waiting', async () => {
      const mockResponse: KieQueryTaskResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'task_imagen4_002',
          state: 'waiting',
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await queryImagen4Task('task_imagen4_002');

      expect(result.data.taskId).toBe('task_imagen4_002');
      expect(result.data.state).toBe('waiting');
    });

    it('should query task when status is fail', async () => {
      const mockResponse: KieQueryTaskResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'task_imagen4_003',
          state: 'fail',
          failCode: 'INVALID_PROMPT',
          failMsg: 'Prompt contains inappropriate content',
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await queryImagen4Task('task_imagen4_003');

      expect(result.data.taskId).toBe('task_imagen4_003');
      expect(result.data.state).toBe('fail');
      expect(result.data.failCode).toBe('INVALID_PROMPT');
    });

    it('should use correct endpoint for Imagen4', async () => {
      const mockResponse: KieQueryTaskResponse = {
        code: 200,
        data: {
          taskId: 'task_123',
          state: 'waiting',
        },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await queryImagen4Task('task_123');

      const call = fetchSpy.mock.calls[0];
      const url = call[0] as string;

      expect(url).toContain('/api/v1/jobs/recordInfo');
      expect(url).toContain('taskId=task_123');
    });

    it('should handle API error when querying', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 401,
            msg: 'Unauthorized',
          }),
          { status: 401 }
        )
      );

      await expect(queryImagen4Task('task_123')).rejects.toThrow('Unauthorized');
    });

    it('should handle task not found error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 404,
            msg: 'Task not found',
          }),
          { status: 404 }
        )
      );

      await expect(queryImagen4Task('invalid_task_id')).rejects.toThrow();
    });

    it('should include authorization header in query', async () => {
      const mockResponse: KieQueryTaskResponse = {
        code: 200,
        data: {
          taskId: 'task_123',
          state: 'waiting',
        },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await queryImagen4Task('task_123');

      const call = fetchSpy.mock.calls[0];
      const options = call[1] as RequestInit;
      const headers = options.headers as Record<string, string>;

      expect(headers).toHaveProperty('Authorization');
      expect(headers.Authorization).toBe('Bearer test-api-key-123');
    });
  });

  describe('transformImagen4Result', () => {
    it('should extract URLs from result JSON', () => {
      const resultJson = JSON.stringify({
        resultUrls: [
          'https://file.aiquickdraw.com/image1.jpg',
          'https://file.aiquickdraw.com/image2.jpg',
          'https://file.aiquickdraw.com/image3.jpg',
        ],
      });

      const urls = transformImagen4Result(resultJson);

      expect(urls).toEqual([
        'https://file.aiquickdraw.com/image1.jpg',
        'https://file.aiquickdraw.com/image2.jpg',
        'https://file.aiquickdraw.com/image3.jpg',
      ]);
    });

    it('should handle single image result', () => {
      const resultJson = JSON.stringify({
        resultUrls: ['https://file.aiquickdraw.com/single.jpg'],
      });

      const urls = transformImagen4Result(resultJson);

      expect(urls).toEqual(['https://file.aiquickdraw.com/single.jpg']);
    });

    it('should handle empty result URLs', () => {
      const resultJson = JSON.stringify({
        resultUrls: [],
      });

      const urls = transformImagen4Result(resultJson);

      expect(urls).toEqual([]);
    });

    it('should preserve URL order', () => {
      const resultJson = JSON.stringify({
        resultUrls: [
          'https://file.aiquickdraw.com/z.jpg',
          'https://file.aiquickdraw.com/a.jpg',
          'https://file.aiquickdraw.com/m.jpg',
        ],
      });

      const urls = transformImagen4Result(resultJson);

      expect(urls).toEqual([
        'https://file.aiquickdraw.com/z.jpg',
        'https://file.aiquickdraw.com/a.jpg',
        'https://file.aiquickdraw.com/m.jpg',
      ]);
    });

    it('should throw on invalid JSON', () => {
      const invalidJson = 'not valid json {';

      expect(() => transformImagen4Result(invalidJson)).toThrow();
    });

    it('should throw on missing resultUrls field', () => {
      const resultJson = JSON.stringify({
        someOtherField: ['url1'],
      });

      expect(() => transformImagen4Result(resultJson)).toThrow();
    });

    it('should throw on null resultUrls', () => {
      const resultJson = JSON.stringify({
        resultUrls: null,
      });

      expect(() => transformImagen4Result(resultJson)).toThrow();
    });

    it('should handle whitespace in JSON', () => {
      const resultJson = `
        {
          "resultUrls": [
            "https://file.aiquickdraw.com/image1.jpg",
            "https://file.aiquickdraw.com/image2.jpg"
          ]
        }
      `;

      const urls = transformImagen4Result(resultJson);

      expect(urls).toEqual([
        'https://file.aiquickdraw.com/image1.jpg',
        'https://file.aiquickdraw.com/image2.jpg',
      ]);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete workflow: create -> poll -> transform', async () => {
      // Step 1: Create task
      const createResponse = {
        code: 200,
        data: { taskId: 'task_imagen4_workflow' },
      };

      // Step 2: Query task (success)
      const queryResponse: KieQueryTaskResponse = {
        code: 200,
        data: {
          taskId: 'task_imagen4_workflow',
          state: 'success',
          resultJson: JSON.stringify({
            resultUrls: ['https://file.aiquickdraw.com/result.jpg'],
          }),
        },
      };

      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify(createResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(queryResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      // Create task
      const createResult = await createImagen4Task({
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'A workflow test' },
      });

      // Query task
      const queryResult = await queryImagen4Task(createResult.taskId);

      // Transform result
      const urls = transformImagen4Result(queryResult.data.resultJson!);

      expect(urls).toEqual(['https://file.aiquickdraw.com/result.jpg']);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
