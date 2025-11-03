/**
 * Sora2 Model Tests
 *
 * TDD RED Phase: Tests for Sora2 video generation model
 * covering task creation, status querying, and result transformation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createSora2Task,
  querySora2Task,
  transformSora2Result,
} from './sora2';
import type { KieSora2Params } from '@/types/generation';

// Mock environment variable
beforeEach(() => {
  process.env.KIE_API_KEY = 'test-api-key-123';
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Sora2 Model', () => {
  describe('createSora2Task', () => {
    it('should create Sora2 task with valid params', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: { taskId: 'sora2_task_123abc' },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieSora2Params = {
        service: 'KIE',
        model: 'SORA2',
        apiModel: 'sora-2-text-to-video',
        input: {
          prompt: 'A professor stands at the front of a classroom giving a lecture',
          aspect_ratio: 'landscape',
          n_frames: '10',
          remove_watermark: true,
        },
      };

      const result = await createSora2Task(params);

      expect(result).toEqual({ taskId: 'sora2_task_123abc' });
    });

    it('should handle portrait aspect ratio', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: { taskId: 'sora2_portrait_456' },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieSora2Params = {
        service: 'KIE',
        model: 'SORA2',
        apiModel: 'sora-2-text-to-video',
        input: {
          prompt: 'A vertical video of a person dancing',
          aspect_ratio: 'portrait',
          n_frames: '15',
          remove_watermark: false,
        },
      };

      const result = await createSora2Task(params);

      expect(result.taskId).toBe('sora2_portrait_456');
    });

    it('should work with minimal required params', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: { taskId: 'sora2_minimal_789' },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieSora2Params = {
        service: 'KIE',
        model: 'SORA2',
        apiModel: 'sora-2-text-to-video',
        input: {
          prompt: 'A simple video prompt',
        },
      };

      const result = await createSora2Task(params);

      expect(result.taskId).toBe('sora2_minimal_789');
    });

    it('should include callback URL when provided', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: { taskId: 'sora2_callback_xyz' },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const params: KieSora2Params = {
        service: 'KIE',
        model: 'SORA2',
        apiModel: 'sora-2-text-to-video',
        input: {
          prompt: 'Test prompt',
        },
        callBackUrl: 'https://example.com/callback',
      };

      await createSora2Task(params);

      const call = fetchSpy.mock.calls[0];
      const body = JSON.parse((call[1] as RequestInit).body as string);
      expect(body).toHaveProperty('callBackUrl', 'https://example.com/callback');
    });

    it('should throw error on API failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 422,
            msg: 'Validation error: prompt is required',
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

      const params: KieSora2Params = {
        service: 'KIE',
        model: 'SORA2',
        apiModel: 'sora-2-text-to-video',
        input: {
          prompt: 'Test',
        },
      };

      await expect(createSora2Task(params)).rejects.toThrow();
    });
  });

  describe('querySora2Task', () => {
    it('should query task status in waiting state', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'sora2_task_123abc',
          model: 'sora-2-text-to-video',
          state: 'waiting',
          param: '{"model":"sora-2-text-to-video","input":{"prompt":"test"}}',
          resultJson: null,
          failCode: null,
          failMsg: null,
          createTime: 1757584164490,
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await querySora2Task('sora2_task_123abc');

      expect(result.data.state).toBe('waiting');
      expect(result.data.taskId).toBe('sora2_task_123abc');
    });

    it('should query task with success state and results', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'sora2_success_456',
          model: 'sora-2-text-to-video',
          state: 'success',
          param: '{"model":"sora-2-text-to-video","input":{"prompt":"test"}}',
          resultJson: '{"resultUrls":["https://file.example.com/video1.mp4","https://file.example.com/video2.mp4"]}',
          failCode: null,
          failMsg: null,
          costTime: 45000,
          completeTime: 1757584209490,
          createTime: 1757584164490,
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await querySora2Task('sora2_success_456');

      expect(result.data.state).toBe('success');
      expect(result.data.resultJson).toContain('resultUrls');
    });

    it('should query task with fail state', async () => {
      const mockResponse = {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'sora2_fail_789',
          model: 'sora-2-text-to-video',
          state: 'fail',
          param: '{"model":"sora-2-text-to-video","input":{"prompt":"test"}}',
          resultJson: null,
          failCode: 'INVALID_PROMPT',
          failMsg: 'The prompt contains restricted content',
          costTime: null,
          completeTime: 1757584209490,
          createTime: 1757584164490,
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await querySora2Task('sora2_fail_789');

      expect(result.data.state).toBe('fail');
      expect(result.data.failCode).toBe('INVALID_PROMPT');
      expect(result.data.failMsg).toBe('The prompt contains restricted content');
    });

    it('should throw error on API failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 404,
            msg: 'Task not found',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

      await expect(querySora2Task('invalid_task_id')).rejects.toThrow();
    });
  });

  describe('transformSora2Result', () => {
    it('should extract URLs from result JSON', () => {
      const resultJson = '{"resultUrls":["https://example.com/video1.mp4","https://example.com/video2.mp4","https://example.com/video3.mp4"]}';

      const urls = transformSora2Result(resultJson);

      expect(urls).toEqual([
        'https://example.com/video1.mp4',
        'https://example.com/video2.mp4',
        'https://example.com/video3.mp4',
      ]);
      expect(urls).toHaveLength(3);
    });

    it('should handle single URL in result', () => {
      const resultJson = '{"resultUrls":["https://example.com/single-video.mp4"]}';

      const urls = transformSora2Result(resultJson);

      expect(urls).toEqual(['https://example.com/single-video.mp4']);
      expect(urls).toHaveLength(1);
    });

    it('should return empty array for empty resultUrls', () => {
      const resultJson = '{"resultUrls":[]}';

      const urls = transformSora2Result(resultJson);

      expect(urls).toEqual([]);
      expect(urls).toHaveLength(0);
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = 'not valid json';

      expect(() => transformSora2Result(invalidJson)).toThrow();
    });

    it('should throw error when resultUrls field is missing', () => {
      const resultJson = '{"someOtherField":[]}';

      expect(() => transformSora2Result(resultJson)).toThrow();
    });

    it('should handle URLs with query parameters', () => {
      const resultJson = '{"resultUrls":["https://example.com/video.mp4?token=abc123&expires=12345"]}';

      const urls = transformSora2Result(resultJson);

      expect(urls[0]).toContain('token=abc123');
      expect(urls[0]).toContain('expires=12345');
    });
  });

  describe('API request format', () => {
    it('should send correct endpoint for task creation', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 200,
            msg: 'success',
            data: { taskId: 'test_123' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const params: KieSora2Params = {
        service: 'KIE',
        model: 'SORA2',
        apiModel: 'sora-2-text-to-video',
        input: { prompt: 'Test' },
      };

      await createSora2Task(params);

      const call = fetchSpy.mock.calls[0];
      const url = call[0] as string;
      expect(url).toContain('/api/v1/jobs/createTask');
    });

    it('should send correct request body structure', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 200,
            msg: 'success',
            data: { taskId: 'test_123' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const params: KieSora2Params = {
        service: 'KIE',
        model: 'SORA2',
        apiModel: 'sora-2-text-to-video',
        input: {
          prompt: 'Test prompt',
          aspect_ratio: 'landscape',
          n_frames: '10',
          remove_watermark: true,
        },
      };

      await createSora2Task(params);

      const call = fetchSpy.mock.calls[0];
      const body = JSON.parse((call[1] as RequestInit).body as string);

      expect(body).toEqual({
        model: 'sora-2-text-to-video',
        input: {
          prompt: 'Test prompt',
          aspect_ratio: 'landscape',
          n_frames: '10',
          remove_watermark: true,
        },
      });
    });

    it('should send correct query parameters for task query', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 200,
            msg: 'success',
            data: {
              taskId: 'test_task_123',
              state: 'waiting',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await querySora2Task('test_task_123');

      const call = fetchSpy.mock.calls[0];
      const url = call[0] as string;
      expect(url).toContain('/api/v1/jobs/recordInfo');
      expect(url).toContain('taskId=test_task_123');
    });
  });
});
