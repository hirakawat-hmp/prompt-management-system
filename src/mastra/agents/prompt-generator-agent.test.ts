/**
 * Mastra Agent Tests: Prompt Generator Agent
 *
 * TDD RED Phase: Tests for AI-powered prompt generation
 */

import { describe, it, expect } from 'vitest';
import { promptGeneratorAgent, generatePrompt } from './prompt-generator-agent';

describe('promptGeneratorAgent', () => {
  it('should be defined with correct configuration', () => {
    expect(promptGeneratorAgent).toBeDefined();
    expect(promptGeneratorAgent.name).toBe('Prompt Generator Agent');
  });
});

describe('generatePrompt', () => {
  it('should generate an image prompt from requirements', async () => {
    const requirements = 'A futuristic city at sunset with flying cars';
    const result = await generatePrompt(requirements, 'image');

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Prompt should be concise (2-3 sentences)
    expect(result.split('.').length).toBeLessThanOrEqual(5);
  }, 30000); // 30s timeout for AI generation

  it('should generate a video prompt from requirements', async () => {
    const requirements = 'An animated sequence showing the growth of a plant from seed to flower';
    const result = await generatePrompt(requirements, 'video');

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Video prompts may be slightly longer but still concise
    expect(result.split('.').length).toBeLessThanOrEqual(6);
  }, 30000); // 30s timeout for AI generation

  it('should handle empty requirements gracefully', async () => {
    await expect(
      generatePrompt('', 'image')
    ).rejects.toThrow('Requirements cannot be empty');
  });

  it('should handle whitespace-only requirements', async () => {
    await expect(
      generatePrompt('   ', 'image')
    ).rejects.toThrow('Requirements cannot be empty');
  });

  it('should generate different prompts for image vs video types', async () => {
    const requirements = 'A beautiful landscape with mountains';

    const imagePrompt = await generatePrompt(requirements, 'image');
    const videoPrompt = await generatePrompt(requirements, 'video');

    expect(imagePrompt).toBeDefined();
    expect(videoPrompt).toBeDefined();
    // While content may be similar, format should differ
    expect(typeof imagePrompt).toBe('string');
    expect(typeof videoPrompt).toBe('string');
  }, 60000); // 60s timeout for two AI generations
});
