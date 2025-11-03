/**
 * Midjourney Model Tests
 *
 * TDD RED Phase: Tests for Kie.ai Midjourney image/video generation.
 * Tests cover task creation, task querying, and result transformation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { KieMidjourneyParams, KieQueryTaskResponse } from '@/types/generation';
import { createMidjourneyTask, queryMidjourneyTask, transformMidjourneyResult } from './midjourney';
import * as clientModule from '../client';

// ============================================================================
// Setup and Fixtures
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

const mockMidjourneyParams: KieMidjourneyParams = {
  service: 'KIE',
  model: 'MIDJOURNEY',
  taskType: 'mj_txt2img',
  prompt: 'A beautiful sunset over mountains',
};

const mockQueryResponse: KieQueryTaskResponse = {
  code: 200,
  msg: 'success',
  data: {
    taskId: 'mj_task_abc123',
    successFlag: 1,
    response: {
      resultUrls: [
        'https://tempfile.redpandaai.co/xxx/mj_task_abc123_1.jpg',
        'https://tempfile.redpandaai.co/xxx/mj_task_abc123_2.jpg',
      ],
    },
    createTime: Date.now(),
  },
};

// ============================================================================
// createMidjourneyTask Tests
// ============================================================================

describe('createMidjourneyTask', () => {
  it('should create text-to-image task successfully', async () => {
    const params: KieMidjourneyParams = {
      ...mockMidjourneyParams,
      speed: 'fast',
      version: '7',
    };

    const mockResponse = { taskId: 'mj_task_abc123' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createMidjourneyTask(params);

    expect(result).toEqual({ taskId: 'mj_task_abc123' });
    expect(clientModule.createKieTask).toHaveBeenCalledWith(params);
  });

  it('should create image-to-image task with file URLs', async () => {
    const params: KieMidjourneyParams = {
      service: 'KIE',
      model: 'MIDJOURNEY',
      taskType: 'mj_img2img',
      prompt: 'Transform this into anime style',
      fileUrls: ['https://example.com/image.jpg'],
      aspectRatio: '16:9',
      speed: 'relaxed',
    };

    const mockResponse = { taskId: 'mj_task_xyz789' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createMidjourneyTask(params);

    expect(result.taskId).toBe('mj_task_xyz789');
    expect(clientModule.createKieTask).toHaveBeenCalledWith(params);
  });

  it('should create style reference task', async () => {
    const params: KieMidjourneyParams = {
      service: 'KIE',
      model: 'MIDJOURNEY',
      taskType: 'mj_style_reference',
      prompt: 'Cyberpunk neon city',
      fileUrls: ['https://example.com/style.jpg'],
      speed: 'turbo',
      stylization: 750,
    };

    const mockResponse = { taskId: 'mj_task_style_ref' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createMidjourneyTask(params);

    expect(result.taskId).toBe('mj_task_style_ref');
  });

  it('should create omni reference task with ow parameter', async () => {
    const params: KieMidjourneyParams = {
      service: 'KIE',
      model: 'MIDJOURNEY',
      taskType: 'mj_omni_reference',
      prompt: 'Character in new scene',
      fileUrls: ['https://example.com/character.jpg'],
      ow: 500,
      variety: 50,
    };

    const mockResponse = { taskId: 'mj_task_omni' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createMidjourneyTask(params);

    expect(result.taskId).toBe('mj_task_omni');
  });

  it('should create video generation task with motion parameter', async () => {
    const params: KieMidjourneyParams = {
      service: 'KIE',
      model: 'MIDJOURNEY',
      taskType: 'mj_video',
      prompt: 'Animated transition effect',
      fileUrls: ['https://example.com/image.jpg'],
      motion: 'high',
      videoBatchSize: 2,
    };

    const mockResponse = { taskId: 'mj_task_video' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createMidjourneyTask(params);

    expect(result.taskId).toBe('mj_task_video');
  });

  it('should create HD video generation task', async () => {
    const params: KieMidjourneyParams = {
      service: 'KIE',
      model: 'MIDJOURNEY',
      taskType: 'mj_video_hd',
      prompt: 'High quality video',
      fileUrls: ['https://example.com/image.jpg'],
      motion: 'low',
      videoBatchSize: 1,
    };

    const mockResponse = { taskId: 'mj_task_video_hd' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createMidjourneyTask(params);

    expect(result.taskId).toBe('mj_task_video_hd');
  });

  it('should include advanced parameters in request', async () => {
    const params: KieMidjourneyParams = {
      ...mockMidjourneyParams,
      version: '6.1',
      variety: 75,
      stylization: 500,
      weirdness: 1000,
    };

    const mockResponse = { taskId: 'mj_task_advanced' };
    vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

    const result = await createMidjourneyTask(params);

    expect(result.taskId).toBe('mj_task_advanced');
    expect(clientModule.createKieTask).toHaveBeenCalledWith(params);
  });

  it('should propagate API errors from client', async () => {
    const error = new Error('Validation Error: Invalid prompt length');
    vi.spyOn(clientModule, 'createKieTask').mockRejectedValueOnce(error);

    await expect(createMidjourneyTask(mockMidjourneyParams)).rejects.toThrow(
      'Validation Error: Invalid prompt length'
    );
  });

  it('should handle all 6 task types', async () => {
    const taskTypes: KieMidjourneyParams['taskType'][] = [
      'mj_txt2img',
      'mj_img2img',
      'mj_style_reference',
      'mj_omni_reference',
      'mj_video',
      'mj_video_hd',
    ];

    for (const taskType of taskTypes) {
      const params: KieMidjourneyParams = {
        ...mockMidjourneyParams,
        taskType,
        fileUrls: taskType !== 'mj_txt2img' ? ['https://example.com/image.jpg'] : undefined,
        motion: taskType.includes('video') ? 'high' : undefined,
      };

      const mockResponse = { taskId: `mj_task_${taskType}` };
      vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

      const result = await createMidjourneyTask(params);

      expect(result.taskId).toBe(`mj_task_${taskType}`);
    }
  });

  it('should support all speed options', async () => {
    const speeds: KieMidjourneyParams['speed'][] = ['relaxed', 'fast', 'turbo'];

    for (const speed of speeds) {
      const params: KieMidjourneyParams = {
        ...mockMidjourneyParams,
        speed,
      };

      const mockResponse = { taskId: `mj_task_${speed}` };
      vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

      const result = await createMidjourneyTask(params);

      expect(result.taskId).toBe(`mj_task_${speed}`);
    }
  });

  it('should support all model versions', async () => {
    const versions: KieMidjourneyParams['version'][] = ['7', '6.1', '6', '5.2', '5.1', 'niji6'];

    for (const version of versions) {
      const params: KieMidjourneyParams = {
        ...mockMidjourneyParams,
        version,
      };

      const mockResponse = { taskId: `mj_task_v${version}` };
      vi.spyOn(clientModule, 'createKieTask').mockResolvedValueOnce(mockResponse);

      const result = await createMidjourneyTask(params);

      expect(result.taskId).toBe(`mj_task_v${version}`);
    }
  });
});

// ============================================================================
// queryMidjourneyTask Tests
// ============================================================================

describe('queryMidjourneyTask', () => {
  it('should query task status successfully', async () => {
    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(mockQueryResponse);

    const result = await queryMidjourneyTask('mj_task_abc123');

    expect(result).toEqual(mockQueryResponse);
    expect(clientModule.queryKieTask).toHaveBeenCalledWith('MIDJOURNEY', 'mj_task_abc123');
  });

  it('should return pending status (successFlag: 0)', async () => {
    const pendingResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'mj_task_pending',
        successFlag: 0,
        response: {},
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(pendingResponse);

    const result = await queryMidjourneyTask('mj_task_pending');

    expect(result.data.successFlag).toBe(0);
  });

  it('should return failed status (successFlag: 2)', async () => {
    const failedResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'mj_task_failed',
        successFlag: 2,
        failCode: 'QUOTA_EXCEEDED',
        failMsg: 'Generation quota exceeded',
        response: {},
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(failedResponse);

    const result = await queryMidjourneyTask('mj_task_failed');

    expect(result.data.successFlag).toBe(2);
    expect(result.data.failCode).toBe('QUOTA_EXCEEDED');
  });

  it('should return error status (successFlag: 3)', async () => {
    const errorResponse: KieQueryTaskResponse = {
      code: 200,
      msg: 'success',
      data: {
        taskId: 'mj_task_error',
        successFlag: 3,
        errorCode: 'INVALID_PARAM',
        errorMessage: 'Invalid parameters provided',
        response: {},
        createTime: Date.now(),
      },
    };

    vi.spyOn(clientModule, 'queryKieTask').mockResolvedValueOnce(errorResponse);

    const result = await queryMidjourneyTask('mj_task_error');

    expect(result.data.successFlag).toBe(3);
    expect(result.data.errorCode).toBe('INVALID_PARAM');
  });

  it('should handle API errors during query', async () => {
    const error = new Error('Task not found');
    vi.spyOn(clientModule, 'queryKieTask').mockRejectedValueOnce(error);

    await expect(queryMidjourneyTask('mj_task_notfound')).rejects.toThrow('Task not found');
  });

  it('should handle rate limiting', async () => {
    const rateLimitError = new Error('Rate Limited (429): Too many requests');
    vi.spyOn(clientModule, 'queryKieTask').mockRejectedValueOnce(rateLimitError);

    await expect(queryMidjourneyTask('mj_task_xyz')).rejects.toThrow('Rate Limited');
  });
});

// ============================================================================
// transformMidjourneyResult Tests
// ============================================================================

describe('transformMidjourneyResult', () => {
  it('should extract result URLs from response', () => {
    const responseData = {
      taskId: 'mj_task_abc123',
      successFlag: 1,
      response: {
        resultUrls: [
          'https://tempfile.redpandaai.co/xxx/mj_1.jpg',
          'https://tempfile.redpandaai.co/xxx/mj_2.jpg',
          'https://tempfile.redpandaai.co/xxx/mj_3.jpg',
          'https://tempfile.redpandaai.co/xxx/mj_4.jpg',
        ],
      },
      createTime: 1704110400000,
    };

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([
      'https://tempfile.redpandaai.co/xxx/mj_1.jpg',
      'https://tempfile.redpandaai.co/xxx/mj_2.jpg',
      'https://tempfile.redpandaai.co/xxx/mj_3.jpg',
      'https://tempfile.redpandaai.co/xxx/mj_4.jpg',
    ]);
  });

  it('should handle single result URL', () => {
    const responseData = {
      taskId: 'mj_task_single',
      successFlag: 1,
      response: {
        resultUrls: ['https://tempfile.redpandaai.co/xxx/single.jpg'],
      },
      createTime: 1704110400000,
    };

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual(['https://tempfile.redpandaai.co/xxx/single.jpg']);
  });

  it('should return empty array when no result URLs', () => {
    const responseData = {
      taskId: 'mj_task_empty',
      successFlag: 0,
      response: {},
      createTime: 1704110400000,
    };

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([]);
  });

  it('should handle response.resultUrls as undefined', () => {
    const responseData = {
      taskId: 'mj_task_undefined',
      successFlag: 0,
      response: {
        resultUrls: undefined,
      },
      createTime: 1704110400000,
    };

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([]);
  });

  it('should return empty array when response is missing', () => {
    const responseData = {
      taskId: 'mj_task_no_response',
      successFlag: 2,
      failCode: 'ERROR',
      failMsg: 'Generation failed',
      createTime: 1704110400000,
    } as any;

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([]);
  });

  it('should filter out null/undefined values from URLs', () => {
    const responseData = {
      taskId: 'mj_task_mixed',
      successFlag: 1,
      response: {
        resultUrls: [
          'https://tempfile.redpandaai.co/xxx/valid.jpg',
          null as any,
          'https://tempfile.redpandaai.co/xxx/another.jpg',
          undefined as any,
        ],
      },
      createTime: 1704110400000,
    };

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([
      'https://tempfile.redpandaai.co/xxx/valid.jpg',
      'https://tempfile.redpandaai.co/xxx/another.jpg',
    ]);
  });

  it('should handle empty resultUrls array', () => {
    const responseData = {
      taskId: 'mj_task_empty_array',
      successFlag: 1,
      response: {
        resultUrls: [],
      },
      createTime: 1704110400000,
    };

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([]);
  });

  it('should handle malformed response gracefully', () => {
    const responseData = {
      taskId: 'mj_task_malformed',
      successFlag: 0,
    } as any;

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([]);
  });

  it('should extract URLs from successful completion', () => {
    const responseData = mockQueryResponse.data;

    const result = transformMidjourneyResult(responseData);

    expect(result).toEqual([
      'https://tempfile.redpandaai.co/xxx/mj_task_abc123_1.jpg',
      'https://tempfile.redpandaai.co/xxx/mj_task_abc123_2.jpg',
    ]);
  });
});
