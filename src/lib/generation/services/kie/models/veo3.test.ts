/**
 * Veo3 Model Tests
 *
 * TDD RED Phase: Tests for Veo3 video generation with Kie.ai API.
 * Tests cover task creation, task querying, and result transformation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { KieVeo3Params, KieQueryTaskResponse } from '@/types/generation';
import { createVeo3Task, queryVeo3Task, transformVeo3Result } from './veo3';
import * as clientModule from '../client';

// ============================================================================
// Setup and Fixtures
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

const mockVeo3Params: KieVeo3Params = {
  service: 'KIE',
  model: 'VEO3',
  prompt: 'A dog playing in a park',
  modelVariant: 'veo3_fast',
};

const mockQueryResponse: KieQueryTaskResponse = {
  code: 200,
  msg: 'success',
  data: {
    taskId: 'veo_task_abc123',
    successFlag: 1,
    response: {
      resultUrls: [
        'https://tempfile.redpandaai.co/xxx/videos/output_1.mp4',
        'https://tempfile.redpandaai.co/xxx/videos/output_2.mp4',
      ],
    },
    createTime: Date.now(),
  },
};

// ============================================================================
// createVeo3Task Tests
// ============================================================================

describe('createVeo3Task', () => {
  it('should create a Veo3 video generation task with minimal parameters', async () => {
    const mockResponse = { taskId: 'veo_task_abc123' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createVeo3Task(mockVeo3Params);

    expect(result).toEqual({ taskId: 'veo_task_abc123' });
    expect(clientModule.createKieTask).toHaveBeenCalledWith(mockVeo3Params);
  });

  it('should create task with all optional parameters', async () => {
    const completeParams: KieVeo3Params = {
      ...mockVeo3Params,
      generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
      imageUrls: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
      aspectRatio: '16:9',
      seeds: 12345,
      watermark: 'MyBrand',
      callBackUrl: 'https://example.com/callback',
      enableTranslation: true,
    };

    const mockResponse = { taskId: 'veo_task_def456' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createVeo3Task(completeParams);

    expect(result).toEqual({ taskId: 'veo_task_def456' });
    expect(clientModule.createKieTask).toHaveBeenCalledWith(completeParams);
  });

  it('should handle veo3 model variant', async () => {
    const veo3Params: KieVeo3Params = {
      ...mockVeo3Params,
      modelVariant: 'veo3',
    };

    const mockResponse = { taskId: 'veo_task_quality' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createVeo3Task(veo3Params);

    expect(result).toEqual({ taskId: 'veo_task_quality' });
    expect(clientModule.createKieTask).toHaveBeenCalledWith(veo3Params);
  });

  it('should handle TEXT_2_VIDEO generation mode', async () => {
    const textToVideoParams: KieVeo3Params = {
      ...mockVeo3Params,
      generationType: 'TEXT_2_VIDEO',
    };

    const mockResponse = { taskId: 'veo_task_text' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createVeo3Task(textToVideoParams);

    expect(result).toEqual({ taskId: 'veo_task_text' });
  });

  it('should handle REFERENCE_2_VIDEO generation mode with 1-3 images', async () => {
    const referenceParams: KieVeo3Params = {
      ...mockVeo3Params,
      generationType: 'REFERENCE_2_VIDEO',
      imageUrls: [
        'https://example.com/ref1.jpg',
        'https://example.com/ref2.jpg',
        'https://example.com/ref3.jpg',
      ],
    };

    const mockResponse = { taskId: 'veo_task_reference' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createVeo3Task(referenceParams);

    expect(result).toEqual({ taskId: 'veo_task_reference' });
  });

  it('should propagate API errors from client', async () => {
    const error = new Error('API Error: Insufficient credits');
    vi.spyOn(clientModule, 'createKieTask').mockRejectedValueOnce(error);

    await expect(createVeo3Task(mockVeo3Params)).rejects.toThrow('API Error: Insufficient credits');
  });

  it('should support 9:16 aspect ratio for mobile videos', async () => {
    const mobileParams: KieVeo3Params = {
      ...mockVeo3Params,
      aspectRatio: '9:16',
    };

    const mockResponse = { taskId: 'veo_task_mobile' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createVeo3Task(mobileParams);

    expect(result).toEqual({ taskId: 'veo_task_mobile' });
  });

  it('should support Auto aspect ratio', async () => {
    const autoParams: KieVeo3Params = {
      ...mockVeo3Params,
      aspectRatio: 'Auto',
    };

    const mockResponse = { taskId: 'veo_task_auto' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createVeo3Task(autoParams);

    expect(result).toEqual({ taskId: 'veo_task_auto' });
  });
});

// ============================================================================
// queryVeo3Task Tests
// ============================================================================

describe('queryVeo3Task', () => {
  it('should query task status successfully', async () => {
    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(mockQueryResponse);

    const result = await queryVeo3Task('veo_task_abc123');

    expect(result).toEqual(mockQueryResponse);
    expect(clientModule.queryKieTask).toHaveBeenCalledWith('VEO3', 'veo_task_abc123');
  });

  it('should handle pending status (successFlag: 0)', async () => {
    const pendingResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'veo_task_pending',
        successFlag: 0,
        response: {},
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(pendingResponse);

    const result = await queryVeo3Task('veo_task_pending');

    expect(result.data.successFlag).toBe(0);
  });

  it('should handle success status (successFlag: 1)', async () => {
    const successResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'veo_task_success',
        successFlag: 1,
        response: {
          resultUrls: ['https://tempfile.redpandaai.co/xxx/videos/result.mp4'],
        },
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(successResponse);

    const result = await queryVeo3Task('veo_task_success');

    expect(result.data.successFlag).toBe(1);
    expect(result.data.response?.resultUrls).toContain('https://tempfile.redpandaai.co/xxx/videos/result.mp4');
  });

  it('should handle failed status (successFlag: 2)', async () => {
    const failedResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'veo_task_failed',
        successFlag: 2,
        failCode: 'VALIDATION_ERROR',
        failMsg: 'Your prompt was flagged by Website as violating content policies',
        response: {},
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(failedResponse);

    const result = await queryVeo3Task('veo_task_failed');

    expect(result.data.successFlag).toBe(2);
    expect(result.data.failMsg).toBeDefined();
  });

  it('should handle failed status (successFlag: 3)', async () => {
    const failedResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'veo_task_failed_3',
        successFlag: 3,
        failCode: 'UPLOAD_ERROR',
        failMsg: 'Video generation failed due to upload error',
        response: {},
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(failedResponse);

    const result = await queryVeo3Task('veo_task_failed_3');

    expect(result.data.successFlag).toBe(3);
  });

  it('should propagate API errors from client', async () => {
    const error = new Error('API Error: Unauthorized');
    vi.spyOn(clientModule, 'queryKieTask').mockRejectedValueOnce(error);

    await expect(queryVeo3Task('veo_task_invalid')).rejects.toThrow('API Error: Unauthorized');
  });

  it('should handle multiple result URLs', async () => {
    const multiUrlResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'veo_task_multi',
        successFlag: 1,
        response: {
          resultUrls: [
            'https://tempfile.redpandaai.co/xxx/videos/result_720p.mp4',
            'https://tempfile.redpandaai.co/xxx/videos/result_1080p.mp4',
          ],
        },
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(multiUrlResponse);

    const result = await queryVeo3Task('veo_task_multi');

    expect(result.data.response?.resultUrls).toHaveLength(2);
  });
});

// ============================================================================
// transformVeo3Result Tests
// ============================================================================

describe('transformVeo3Result', () => {
  it('should transform response data with result URLs', () => {
    const responseData = {
      taskId: 'veo_task_abc123',
      successFlag: 1,
      response: {
        resultUrls: [
          'https://tempfile.redpandaai.co/xxx/videos/output_1.mp4',
          'https://tempfile.redpandaai.co/xxx/videos/output_2.mp4',
        ],
      },
      createTime: Date.now(),
    };

    const result = transformVeo3Result(responseData);

    expect(result).toEqual([
      'https://tempfile.redpandaai.co/xxx/videos/output_1.mp4',
      'https://tempfile.redpandaai.co/xxx/videos/output_2.mp4',
    ]);
  });

  it('should return empty array when no result URLs are present', () => {
    const responseData = {
      taskId: 'veo_task_pending',
      successFlag: 0,
      response: {},
      createTime: Date.now(),
    };

    const result = transformVeo3Result(responseData);

    expect(result).toEqual([]);
  });

  it('should return empty array when response is undefined', () => {
    const responseData = {
      taskId: 'veo_task_failed',
      successFlag: 2,
      createTime: Date.now(),
    };

    const result = transformVeo3Result(responseData);

    expect(result).toEqual([]);
  });

  it('should handle single result URL', () => {
    const responseData = {
      taskId: 'veo_task_single',
      successFlag: 1,
      response: {
        resultUrls: ['https://tempfile.redpandaai.co/xxx/videos/single_video.mp4'],
      },
      createTime: Date.now(),
    };

    const result = transformVeo3Result(responseData);

    expect(result).toEqual(['https://tempfile.redpandaai.co/xxx/videos/single_video.mp4']);
  });

  it('should preserve URL order from API response', () => {
    const urls = [
      'https://tempfile.redpandaai.co/xxx/videos/output_720p.mp4',
      'https://tempfile.redpandaai.co/xxx/videos/output_1080p.mp4',
      'https://tempfile.redpandaai.co/xxx/videos/output_2k.mp4',
    ];

    const responseData = {
      taskId: 'veo_task_multi',
      successFlag: 1,
      response: {
        resultUrls: urls,
      },
      createTime: Date.now(),
    };

    const result = transformVeo3Result(responseData);

    expect(result).toEqual(urls);
    expect(result[0]).toBe(urls[0]);
    expect(result[1]).toBe(urls[1]);
    expect(result[2]).toBe(urls[2]);
  });

  it('should handle mixed response structures', () => {
    const responseData = {
      taskId: 'veo_task_mixed',
      successFlag: 1,
      response: {
        resultUrls: [
          'https://tempfile.redpandaai.co/xxx/videos/result.mp4',
        ],
        // Additional fields that may be in response
        metadata: {
          duration: 10,
          width: 1920,
          height: 1080,
        },
      },
      createTime: Date.now(),
    };

    const result = transformVeo3Result(responseData);

    expect(result).toEqual(['https://tempfile.redpandaai.co/xxx/videos/result.mp4']);
  });
});
