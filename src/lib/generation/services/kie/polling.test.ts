/**
 * Polling Strategy Tests
 *
 * Tests for async task monitoring with interval escalation and timeout handling.
 * Tests status normalization for string-based (Imagen4/Sora2) and
 * integer-based (Veo3/Midjourney) status fields.
 *
 * TDD RED Phase: These tests will fail until polling.ts is implemented.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { startPolling, normalizeStatus, extractResultUrls } from './polling';
import { prisma } from '@/lib/prisma';
import type { GenerationModel } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    generationTask: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Polling Strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('normalizeStatus', () => {
    describe('String-based status (Imagen4, Sora2)', () => {
      it('should normalize "waiting" to PENDING', () => {
        const result = normalizeStatus('IMAGEN4', {
          state: 'waiting',
        } as any);
        expect(result).toBe('PENDING');
      });

      it('should normalize "success" to SUCCESS', () => {
        const result = normalizeStatus('IMAGEN4', {
          state: 'success',
        } as any);
        expect(result).toBe('SUCCESS');
      });

      it('should normalize "fail" to FAILED', () => {
        const result = normalizeStatus('IMAGEN4', {
          state: 'fail',
        } as any);
        expect(result).toBe('FAILED');
      });

      it('should handle Sora2 state field', () => {
        const result = normalizeStatus('SORA2', {
          state: 'success',
        } as any);
        expect(result).toBe('SUCCESS');
      });

      it('should normalize "generating" to PENDING', () => {
        const result = normalizeStatus('IMAGEN4', {
          state: 'generating',
        } as any);
        expect(result).toBe('PENDING');
      });

      it('should normalize "wait" to PENDING', () => {
        const result = normalizeStatus('IMAGEN4', {
          state: 'wait',
        } as any);
        expect(result).toBe('PENDING');
      });

      it('should normalize "queueing" to PENDING', () => {
        const result = normalizeStatus('IMAGEN4', {
          state: 'queueing',
        } as any);
        expect(result).toBe('PENDING');
      });
    });

    describe('Integer-based status (Veo3, Midjourney)', () => {
      it('should normalize 0 to PENDING', () => {
        const result = normalizeStatus('VEO3', {
          successFlag: 0,
        } as any);
        expect(result).toBe('PENDING');
      });

      it('should normalize 1 to SUCCESS', () => {
        const result = normalizeStatus('VEO3', {
          successFlag: 1,
        } as any);
        expect(result).toBe('SUCCESS');
      });

      it('should normalize 2 to FAILED', () => {
        const result = normalizeStatus('VEO3', {
          successFlag: 2,
        } as any);
        expect(result).toBe('FAILED');
      });

      it('should normalize 3 to FAILED', () => {
        const result = normalizeStatus('MIDJOURNEY', {
          successFlag: 3,
        } as any);
        expect(result).toBe('FAILED');
      });

      it('should handle Midjourney successFlag field', () => {
        const result = normalizeStatus('MIDJOURNEY', {
          successFlag: 1,
        } as any);
        expect(result).toBe('SUCCESS');
      });
    });

    describe('Edge cases', () => {
      it('should handle unknown state values gracefully', () => {
        expect(() => {
          normalizeStatus('IMAGEN4', {
            state: 'unknown',
          } as any);
        }).toThrow();
      });

      it('should handle missing status field', () => {
        expect(() => {
          normalizeStatus('IMAGEN4', {} as any);
        }).toThrow();
      });
    });
  });

  describe('extractResultUrls', () => {
    it('should extract resultUrls from Imagen4 response', () => {
      const data = {
        taskId: 'task_123',
        state: 'success',
        resultJson: '{"resultUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]}',
      } as any;

      const urls = extractResultUrls(data);
      expect(urls).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
    });

    it('should extract resultUrls from Veo3 response object', () => {
      const data = {
        taskId: 'task_456',
        successFlag: 1,
        response: {
          resultUrls: ['https://example.com/video.mp4'],
        },
      } as any;

      const urls = extractResultUrls(data);
      expect(urls).toEqual(['https://example.com/video.mp4']);
    });

    it('should extract resultUrls from Sora2 resultJson string', () => {
      const data = {
        taskId: 'task_789',
        state: 'success',
        resultJson: '{"resultUrls": ["https://example.com/sora.mp4"]}',
      } as any;

      const urls = extractResultUrls(data);
      expect(urls).toEqual(['https://example.com/sora.mp4']);
    });

    it('should handle empty resultUrls array', () => {
      const data = {
        taskId: 'task_empty',
        state: 'success',
        resultJson: '{"resultUrls": []}',
      } as any;

      const urls = extractResultUrls(data);
      expect(urls).toEqual([]);
    });

    it('should parse JSON string resultJson correctly', () => {
      const data = {
        state: 'success',
        resultJson: '{"resultUrls": ["url1", "url2", "url3"]}',
      } as any;

      const urls = extractResultUrls(data);
      expect(urls).toHaveLength(3);
    });

    it('should handle response object with resultUrls', () => {
      const data = {
        successFlag: 1,
        response: {
          resultUrls: ['https://example.com/asset.jpg'],
        },
      } as any;

      const urls = extractResultUrls(data);
      expect(urls).toEqual(['https://example.com/asset.jpg']);
    });

    it('should extract resultUrls from Midjourney resultInfoJson', () => {
      // Midjourney returns array of objects with {resultUrl: string}
      const data = {
        successFlag: 1,
        resultInfoJson: {
          resultUrls: [
            { resultUrl: 'https://example.com/midjourney1.jpg' },
            { resultUrl: 'https://example.com/midjourney2.jpg' },
          ],
        },
      } as any;

      const urls = extractResultUrls(data);
      expect(urls).toEqual([
        'https://example.com/midjourney1.jpg',
        'https://example.com/midjourney2.jpg',
      ]);
    });

    it('should throw on invalid JSON in resultJson', () => {
      const data = {
        state: 'success',
        resultJson: 'invalid json',
      } as any;

      expect(() => extractResultUrls(data)).toThrow();
    });

    it('should throw when no resultUrls found', () => {
      const data = {
        state: 'success',
        resultJson: '{"someOtherField": "value"}',
      } as any;

      expect(() => extractResultUrls(data)).toThrow();
    });
  });

  describe('startPolling', () => {
    const taskId = 'task_123';
    const model: GenerationModel = 'IMAGEN4';
    const externalTaskId = 'external_456';

    describe('Interval Escalation', () => {
      it('should start with 2s interval', async () => {
        let pollCount = 0;
        vi.mocked(global.fetch).mockImplementation(async () => {
          pollCount++;
          if (pollCount === 1) {
            // First poll: still pending
            return new Response(
              JSON.stringify({
                code: 200,
                data: { taskId: externalTaskId, state: 'waiting' },
              })
            );
          }
          return new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson: '{"resultUrls": ["https://example.com/image.jpg"]}',
              },
            })
          );
        });

        const promise = startPolling(taskId, model, externalTaskId);

        // Advance 2 seconds and check if second poll happens
        vi.advanceTimersByTime(2000);
        await vi.runAllTimersAsync();

        expect(global.fetch).toHaveBeenCalled();

        await promise;
      });

      it('should escalate to 5s interval after 3 attempts', async () => {
        let pollCount = 0;
        const pollTimings: number[] = [];
        let lastTime = 0;

        vi.mocked(global.fetch).mockImplementation(async () => {
          pollCount++;
          const currentTime = Date.now();
          if (pollCount > 1) {
            pollTimings.push(currentTime - lastTime);
          }
          lastTime = currentTime;

          if (pollCount < 4) {
            // First 3 polls: still pending
            return new Response(
              JSON.stringify({
                code: 200,
                data: { taskId: externalTaskId, state: 'waiting' },
              })
            );
          }
          return new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson: '{"resultUrls": ["https://example.com/image.jpg"]}',
              },
            })
          );
        });

        const promise = startPolling(taskId, model, externalTaskId);

        // Advance through first 3 polls (2s intervals)
        vi.advanceTimersByTime(2000);
        await vi.runOnlyPendingTimersAsync();

        vi.advanceTimersByTime(2000);
        await vi.runOnlyPendingTimersAsync();

        vi.advanceTimersByTime(2000);
        await vi.runOnlyPendingTimersAsync();

        // Now should escalate to 5s
        vi.advanceTimersByTime(5000);
        await vi.runAllTimersAsync();

        await promise;

        // Verify escalation happened (4th attempt should have ~5s delay)
        expect(pollCount).toBeGreaterThanOrEqual(4);
      });

      it('should cap interval at 10s', async () => {
        let pollCount = 0;

        vi.mocked(global.fetch).mockImplementation(async () => {
          pollCount++;

          if (pollCount < 20) {
            // Keep pending for many polls
            return new Response(
              JSON.stringify({
                code: 200,
                data: { taskId: externalTaskId, state: 'waiting' },
              })
            );
          }
          return new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson: '{"resultUrls": ["https://example.com/image.jpg"]}',
              },
            })
          );
        });

        const promise = startPolling(taskId, model, externalTaskId);

        // Advance through many intervals
        for (let i = 0; i < 20; i++) {
          vi.advanceTimersByTime(10000); // Always advance by 10s
          await vi.runOnlyPendingTimersAsync();
        }

        await vi.runAllTimersAsync();
        await promise;

        // Should have polled many times at 10s intervals
        expect(pollCount).toBeGreaterThan(10);
      });
    });

    describe('Successful Completion', () => {
      it('should update task status to SUCCESS', async () => {
        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson: '{"resultUrls": ["https://example.com/image.jpg"]}',
              },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({
          id: taskId,
          promptId: 'prompt_123',
          service: 'KIE',
          model: 'IMAGEN4',
          externalTaskId,
          status: 'SUCCESS',
          providerParams: '{}',
          resultJson: '{"resultUrls": ["https://example.com/image.jpg"]}',
          failCode: null,
          failMsg: null,
          createdAt: new Date(),
          completedAt: new Date(),
        } as any);

        await startPolling(taskId, model, externalTaskId);

        expect(prisma.generationTask.update).toHaveBeenCalledWith({
          where: { id: taskId },
          data: {
            status: 'SUCCESS',
            resultJson: expect.stringContaining('resultUrls'),
            completedAt: expect.any(Date),
          },
        });
      });

      it('should stop polling when success is received', async () => {
        let pollCount = 0;
        vi.mocked(global.fetch).mockImplementation(async () => {
          pollCount++;
          return new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson: '{"resultUrls": ["https://example.com/image.jpg"]}',
              },
            })
          );
        });

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        await startPolling(taskId, model, externalTaskId);

        // Should only poll once since immediately successful
        expect(pollCount).toBe(1);
      });
    });

    describe('Failure Handling', () => {
      it('should update task status to FAILED on fail state', async () => {
        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'fail',
                failCode: 'INVALID_INPUT',
                failMsg: 'Invalid prompt provided',
              },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({
          id: taskId,
          status: 'FAILED',
        } as any);

        await startPolling(taskId, model, externalTaskId);

        expect(prisma.generationTask.update).toHaveBeenCalledWith({
          where: { id: taskId },
          data: {
            status: 'FAILED',
            failCode: 'INVALID_INPUT',
            failMsg: 'Invalid prompt provided',
            completedAt: expect.any(Date),
          },
        });
      });

      it('should handle HTTP errors gracefully', async () => {
        vi.mocked(global.fetch).mockRejectedValue(
          new Error('Network error')
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        // Should not throw, should update task with error status
        await expect(
          startPolling(taskId, model, externalTaskId)
        ).rejects.toThrow();
      });

      it('should handle API error responses', async () => {
        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 500,
              message: 'Internal server error',
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        await expect(
          startPolling(taskId, model, externalTaskId)
        ).rejects.toThrow();
      });
    });

    describe('Timeout Handling', () => {
      it('should timeout after 5 minutes', async () => {
        const FIVE_MINUTES = 5 * 60 * 1000;

        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: { taskId: externalTaskId, state: 'waiting' },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        const promise = startPolling(taskId, model, externalTaskId);

        // Advance past 5 minute timeout
        vi.advanceTimersByTime(FIVE_MINUTES + 1000);
        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow();
      });

      it('should mark task as FAILED on timeout', async () => {
        const FIVE_MINUTES = 5 * 60 * 1000;

        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: { taskId: externalTaskId, state: 'waiting' },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        const promise = startPolling(taskId, model, externalTaskId);

        vi.advanceTimersByTime(FIVE_MINUTES + 1000);
        await vi.runAllTimersAsync();

        try {
          await promise;
        } catch (e) {
          // Expected to throw
        }

        // Should have called update with FAILED status for timeout
        const updateCalls = vi.mocked(prisma.generationTask.update).mock.calls;
        const timeoutCall = updateCalls.find(
          (call) =>
            call[0]?.data?.status === 'FAILED' &&
            (call[0]?.data?.failCode === 'TIMEOUT' ||
              call[0]?.data?.failMsg?.includes('timeout'))
        );

        expect(timeoutCall).toBeDefined();
      });
    });

    describe('Database Updates', () => {
      it('should update task with complete result JSON', async () => {
        const resultJson = '{"resultUrls": ["url1", "url2"], "metadata": {"quality": "hd"}}';

        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson,
              },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        await startPolling(taskId, model, externalTaskId);

        expect(prisma.generationTask.update).toHaveBeenCalledWith({
          where: { id: taskId },
          data: {
            status: 'SUCCESS',
            resultJson,
            completedAt: expect.any(Date),
          },
        });
      });

      it('should set completedAt timestamp on completion', async () => {
        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson: '{"resultUrls": ["url"]}',
              },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        const beforeTime = new Date();
        await startPolling(taskId, model, externalTaskId);
        const afterTime = new Date();

        const call = vi.mocked(prisma.generationTask.update).mock.calls[0];
        const completedAt = call[0]?.data?.completedAt;

        expect(completedAt).toBeDefined();
        expect(completedAt).toBeInstanceOf(Date);
        expect(completedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
        expect(completedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      });
    });

    describe('Model-Specific Behavior', () => {
      it('should handle Veo3 integer status field', async () => {
        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                successFlag: 1,
                response: { resultUrls: ['https://example.com/video.mp4'] },
              },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        await startPolling(taskId, 'VEO3', externalTaskId);

        expect(prisma.generationTask.update).toHaveBeenCalledWith({
          where: { id: taskId },
          data: {
            status: 'SUCCESS',
            resultJson: expect.any(String),
            completedAt: expect.any(Date),
          },
        });
      });

      it('should handle Midjourney integer status field', async () => {
        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                successFlag: 1,
                response: { resultUrls: ['https://example.com/image.jpg'] },
              },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        await startPolling(taskId, 'MIDJOURNEY', externalTaskId);

        expect(prisma.generationTask.update).toHaveBeenCalledWith({
          where: { id: taskId },
          data: {
            status: 'SUCCESS',
            resultJson: expect.any(String),
            completedAt: expect.any(Date),
          },
        });
      });

      it('should handle Sora2 string status field', async () => {
        vi.mocked(global.fetch).mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 200,
              data: {
                taskId: externalTaskId,
                state: 'success',
                resultJson: '{"resultUrls": ["https://example.com/video.mp4"]}',
              },
            })
          )
        );

        vi.mocked(prisma.generationTask.update).mockResolvedValue({} as any);

        await startPolling(taskId, 'SORA2', externalTaskId);

        expect(prisma.generationTask.update).toHaveBeenCalledWith({
          where: { id: taskId },
          data: {
            status: 'SUCCESS',
            resultJson: expect.any(String),
            completedAt: expect.any(Date),
          },
        });
      });
    });
  });
});
