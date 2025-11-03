/**
 * Kie.ai HTTP Client Tests
 *
 * TDD RED Phase: Tests for Kie.ai HTTP client with authentication,
 * error handling, and exponential backoff retry logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KieClient, createKieTask, queryKieTask } from './client';

// Mock environment variable
beforeEach(() => {
  process.env.KIE_API_KEY = 'test-api-key-123';
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('KieClient', () => {
  describe('HTTP client initialization', () => {
    it('should create client with correct base URL', () => {
      const client = new KieClient();
      expect(client.baseUrl).toBe('https://api.kie.ai');
    });

    it('should throw error if KIE_API_KEY is not set', () => {
      delete process.env.KIE_API_KEY;
      expect(() => new KieClient()).toThrow('KIE_API_KEY environment variable is not set');
    });

    it('should include Authorization header with Bearer token', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch');

      try {
        await client.post('/api/v1/jobs/createTask', {
          model: 'google/imagen4-fast',
          input: { prompt: 'test' },
        });
      } catch {
        // Expected to fail, we're checking the request
      }

      expect(fetchSpy).toHaveBeenCalled();
      const call = fetchSpy.mock.calls[0];
      const options = call[1] as RequestInit;
      expect(options.headers).toHaveProperty('Authorization');
      expect((options.headers as Record<string, string>).Authorization).toBe('Bearer test-api-key-123');
    });
  });

  describe('POST requests', () => {
    it('should successfully create task with valid request', async () => {
      const client = new KieClient();
      const mockResponse = {
        code: 200,
        data: { taskId: 'task_abc123' },
        msg: 'Task created successfully',
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await client.post('/api/v1/jobs/createTask', {
        model: 'google/imagen4-fast',
        input: { prompt: 'A beautiful sunset' },
      });

      expect(response).toEqual(mockResponse);
    });

    it('should set Content-Type to application/json', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('{}', { status: 200 })
      );

      try {
        await client.post('/api/v1/veo/generate', { prompt: 'test' });
      } catch {
        // Expected to fail on invalid response
      }

      const call = fetchSpy.mock.calls[0];
      const options = call[1] as RequestInit;
      expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });
  });

  describe('GET requests', () => {
    it('should successfully query task status', async () => {
      const client = new KieClient();
      const mockResponse = {
        code: 200,
        data: {
          taskId: 'task_abc123',
          state: 'success',
          resultJson: JSON.stringify({ resultUrls: ['https://example.com/image.jpg'] }),
        },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await client.get('/api/v1/jobs/recordInfo', { taskId: 'task_abc123' });

      expect(response).toEqual(mockResponse);
    });

    it('should properly encode query parameters', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('{}', { status: 200 })
      );

      try {
        await client.get('/api/v1/jobs/recordInfo', { taskId: 'task_123', foo: 'bar' });
      } catch {
        // Expected to fail on invalid response
      }

      const call = fetchSpy.mock.calls[0];
      const url = call[0] as string;
      expect(url).toContain('taskId=task_123');
      expect(url).toContain('foo=bar');
    });
  });

  describe('Error handling', () => {
    it('should throw error for 401 Unauthorized', async () => {
      const client = new KieClient();
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 401, msg: 'Unauthorized' }), {
          status: 401,
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {})).rejects.toThrow(
        'Unauthorized (401): Unauthorized'
      );
    });

    it('should throw error for 402 Payment Required', async () => {
      const client = new KieClient();
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 402, msg: 'Insufficient credits' }), {
          status: 402,
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {})).rejects.toThrow(
        'Payment Required (402): Insufficient credits'
      );
    });

    it('should throw error for 422 Validation Error', async () => {
      const client = new KieClient();
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 422,
            msg: 'Validation failed',
            details: { prompt: 'Prompt is required' },
          }),
          { status: 422 }
        )
      );

      await expect(client.post('/api/v1/jobs/createTask', {})).rejects.toThrow(
        'Validation Error (422): Validation failed'
      );
    });

    it('should throw error for 429 Too Many Requests', async () => {
      const client = new KieClient();
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 429, msg: 'Rate limited' }), {
          status: 429,
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {})).rejects.toThrow(
        'Rate Limited (429): Rate limited'
      );
    });

    it('should throw error for 500 Server Error', async () => {
      const client = new KieClient();
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 500, msg: 'Internal server error' }), {
          status: 500,
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {})).rejects.toThrow(
        'Server Error (500): Internal server error'
      );
    });

    it('should throw error for network failure', async () => {
      const client = new KieClient();
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network timeout'));

      await expect(client.post('/api/v1/jobs/createTask', {})).rejects.toThrow('Network timeout');
    });

    it('should throw error for invalid JSON response', async () => {
      const client = new KieClient();
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('Invalid JSON{', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {})).rejects.toThrow();
    });
  });

  describe('Exponential backoff retry', () => {
    it('should retry on 429 with exponential backoff', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch');
      const delaySpy = vi.spyOn(global, 'setTimeout');

      // Mock: first call fails with 429, second succeeds
      const successResponse = {
        code: 200,
        data: { taskId: 'task_abc123' },
      };

      fetchSpy
        .mockResolvedValueOnce(new Response(JSON.stringify({ code: 429, msg: 'Too many requests' }), { status: 429 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(successResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const response = await client.post('/api/v1/jobs/createTask', {}, { maxRetries: 2 });

      expect(response).toEqual(successResponse);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(delaySpy).toHaveBeenCalled();
    });

    it('should retry on 500 with exponential backoff', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch');

      const successResponse = {
        code: 200,
        data: { taskId: 'task_def456' },
      };

      // First call fails with 500, second succeeds
      fetchSpy
        .mockResolvedValueOnce(new Response(JSON.stringify({ code: 500, msg: 'Server error' }), { status: 500 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(successResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const response = await client.post('/api/v1/jobs/createTask', {}, { maxRetries: 2 });

      expect(response).toEqual(successResponse);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 401 Unauthorized', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 401, msg: 'Unauthorized' }), {
          status: 401,
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {}, { maxRetries: 3 })).rejects.toThrow();

      // Should only be called once (no retry)
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 422 Validation Error', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 422, msg: 'Validation failed' }), {
          status: 422,
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {}, { maxRetries: 3 })).rejects.toThrow();

      // Should only be called once (no retry)
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should honor maxRetries parameter', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ code: 500, msg: 'Server error' }), {
          status: 500,
        })
      );

      await expect(client.post('/api/v1/jobs/createTask', {}, { maxRetries: 2 })).rejects.toThrow();

      // Should be called 3 times total (initial + 2 retries)
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('should calculate exponential backoff delays correctly', async () => {
      const client = new KieClient();
      const delays: number[] = [];

      // Spy on setTimeout to capture delays
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: any, delay: number) => {
        delays.push(delay);
        // Call callback immediately for testing
        callback();
        return 0 as any;
      });

      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify({ code: 500 }), { status: 500 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ code: 500 }), { status: 500 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ code: 200, data: { taskId: 'task_123' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      await client.post('/api/v1/jobs/createTask', {}, { maxRetries: 3 });

      // Should have exponential backoff: 1000ms, 2000ms (or similar pattern)
      expect(delays.length).toBeGreaterThan(0);
      expect(delays[0]).toBeLessThanOrEqual(2000); // First retry delay
      if (delays.length > 1) {
        expect(delays[1]).toBeGreaterThanOrEqual(delays[0]); // Exponential increase
      }
    });
  });

  describe('Request timeout handling', () => {
    it('should include timeout in fetch options', async () => {
      const client = new KieClient();
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 200, data: { taskId: 'task_123' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await client.post('/api/v1/jobs/createTask', {}, { timeout: 10000 });

      const call = fetchSpy.mock.calls[0];
      const options = call[1] as RequestInit;
      expect(options.signal).toBeDefined();
    });
  });
});

describe('createKieTask', () => {
  beforeEach(() => {
    process.env.KIE_API_KEY = 'test-api-key';
  });

  it('should create task and return taskId', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 200,
          data: { taskId: 'task_xyz789' },
          msg: 'Success',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const result = await createKieTask({
      service: 'KIE',
      model: 'IMAGEN4',
      apiModel: 'google/imagen4-fast',
      input: { prompt: 'A cat' },
    });

    expect(result).toEqual({ taskId: 'task_xyz789' });
  });

  it('should handle API error response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 402,
          msg: 'Insufficient credits',
        }),
        { status: 402 }
      )
    );

    await expect(
      createKieTask({
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: { prompt: 'A cat' },
      })
    ).rejects.toThrow('Payment Required');
  });

  it('should support all Kie.ai models', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 200,
          data: { taskId: 'task_123' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    // Test Veo3
    await createKieTask({
      service: 'KIE',
      model: 'VEO3',
      prompt: 'A video',
      modelVariant: 'veo3_fast',
    });

    // Test Midjourney
    await createKieTask({
      service: 'KIE',
      model: 'MIDJOURNEY',
      taskType: 'mj_txt2img',
      prompt: 'An image',
    });

    // Test Sora2
    await createKieTask({
      service: 'KIE',
      model: 'SORA2',
      apiModel: 'sora-2-text-to-video',
      input: { prompt: 'A video' },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});

describe('queryKieTask', () => {
  beforeEach(() => {
    process.env.KIE_API_KEY = 'test-api-key';
  });

  it('should query task status successfully', async () => {
    const mockResponse = {
      code: 200,
      data: {
        taskId: 'task_abc123',
        state: 'success',
        resultJson: JSON.stringify({
          resultUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        }),
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await queryKieTask('IMAGEN4', 'task_abc123');

    expect(result.data.taskId).toBe('task_abc123');
    expect(result.data.state).toBe('success');
  });

  it('should handle task still pending', async () => {
    const mockResponse = {
      code: 200,
      data: {
        taskId: 'task_abc123',
        state: 'waiting',
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await queryKieTask('VEO3', 'task_abc123');

    expect(result.data.state).toBe('waiting');
  });

  it('should handle task failure', async () => {
    const mockResponse = {
      code: 200,
      data: {
        taskId: 'task_abc123',
        state: 'fail',
        failCode: 'INVALID_PROMPT',
        failMsg: 'Prompt contains invalid content',
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await queryKieTask('MIDJOURNEY', 'task_abc123');

    expect(result.data.state).toBe('fail');
    expect(result.data.failCode).toBe('INVALID_PROMPT');
  });

  it('should construct correct endpoint URL for different models', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 200, data: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Imagen4 and Sora2 use /api/v1/jobs/recordInfo
    await queryKieTask('IMAGEN4', 'task_123');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/jobs/recordInfo'),
      expect.anything()
    );

    // Veo3 uses /api/v1/veo/record-info
    await queryKieTask('VEO3', 'task_123');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/veo/record-info'),
      expect.anything()
    );

    // Midjourney uses /api/v1/mj/record-info
    await queryKieTask('MIDJOURNEY', 'task_123');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/mj/record-info'),
      expect.anything()
    );
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

    await expect(queryKieTask('IMAGEN4', 'task_abc123')).rejects.toThrow('Unauthorized');
  });

  it('should support different model endpoints', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 200, data: { taskId: 'task_123' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const models: Array<'IMAGEN4' | 'VEO3' | 'MIDJOURNEY' | 'SORA2'> = [
      'IMAGEN4',
      'VEO3',
      'MIDJOURNEY',
      'SORA2',
    ];

    for (const model of models) {
      await queryKieTask(model, 'task_123');
    }

    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });
});
