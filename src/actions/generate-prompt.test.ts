/**
 * Server Actions Tests: AI Prompt Generation
 *
 * TDD RED Phase: Tests for generatePromptWithAI server action
 */

import { describe, it, expect, vi } from 'vitest';
import { generatePromptWithAI } from './generate-prompt';

describe('generatePromptWithAI', () => {
  it('should generate prompt content from requirements', async () => {
    const result = await generatePromptWithAI({
      requirements: 'A peaceful garden with cherry blossoms',
      type: 'image',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    }
  }, 30000); // 30s timeout for AI generation

  it('should support video type prompts', async () => {
    const result = await generatePromptWithAI({
      requirements: 'A timelapse of clouds moving across the sky',
      type: 'video',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    }
  }, 30000); // 30s timeout for AI generation

  it('should validate empty requirements', async () => {
    const result = await generatePromptWithAI({
      requirements: '',
      type: 'image',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Requirements cannot be empty');
    }
  });

  it('should validate whitespace-only requirements', async () => {
    const result = await generatePromptWithAI({
      requirements: '   ',
      type: 'image',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Requirements cannot be empty');
    }
  });

  it('should handle AI generation errors gracefully', async () => {
    // Test with potentially problematic input
    const result = await generatePromptWithAI({
      requirements: 'Test prompt generation',
      type: 'image',
    });

    // Should always return ActionResult structure
    expect(result).toHaveProperty('success');
    if (result.success) {
      expect(result).toHaveProperty('data');
    } else {
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    }
  }, 30000); // 30s timeout for AI generation

  it('should return user-friendly error messages', async () => {
    const result = await generatePromptWithAI({
      requirements: '',
      type: 'image',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      // Error should be user-friendly
      expect(result.error).not.toContain('undefined');
      expect(result.error).not.toContain('null');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});
