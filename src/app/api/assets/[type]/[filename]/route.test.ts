/**
 * Asset Serving API Route Tests
 *
 * TDD: RED Phase - Write failing tests first
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Test storage directory
const TEST_STORAGE_DIR = join(process.cwd(), 'storage-test');

describe('GET /api/assets/[type]/[filename]', () => {
  beforeEach(async () => {
    // Set test storage directory
    process.env.STORAGE_DIR = TEST_STORAGE_DIR;

    // Create test directories
    await mkdir(join(TEST_STORAGE_DIR, 'images'), { recursive: true });
    await mkdir(join(TEST_STORAGE_DIR, 'videos'), { recursive: true });

    // Create test files
    await writeFile(
      join(TEST_STORAGE_DIR, 'images', 'test_0.jpg'),
      Buffer.from('fake-image-data')
    );
    await writeFile(
      join(TEST_STORAGE_DIR, 'images', 'test_1.png'),
      Buffer.from('fake-png-data')
    );
    await writeFile(
      join(TEST_STORAGE_DIR, 'videos', 'test_0.mp4'),
      Buffer.from('fake-video-data')
    );
  });

  afterEach(async () => {
    // Clean up test storage
    if (existsSync(TEST_STORAGE_DIR)) {
      await rm(TEST_STORAGE_DIR, { recursive: true, force: true });
    }
  });

  it('should serve image file with correct content type', async () => {
    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'images', filename: 'test_0.jpg' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/jpeg');

    const buffer = await response.arrayBuffer();
    const text = Buffer.from(buffer).toString();
    expect(text).toBe('fake-image-data');
  });

  it('should serve PNG image', async () => {
    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'images', filename: 'test_1.png' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
  });

  it('should serve video file', async () => {
    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'videos', filename: 'test_0.mp4' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('video/mp4');

    const buffer = await response.arrayBuffer();
    const text = Buffer.from(buffer).toString();
    expect(text).toBe('fake-video-data');
  });

  it('should return 404 for non-existent file', async () => {
    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'images', filename: 'nonexistent.jpg' },
    });

    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBe('File not found');
  });

  it('should return 400 for invalid asset type', async () => {
    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'invalid', filename: 'test.jpg' },
    });

    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('Invalid asset type');
  });

  it('should set cache headers', async () => {
    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'images', filename: 'test_0.jpg' },
    });

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('max-age');
    expect(cacheControl).toContain('immutable');
  });

  it('should handle WebP images', async () => {
    await writeFile(
      join(TEST_STORAGE_DIR, 'images', 'test_2.webp'),
      Buffer.from('fake-webp-data')
    );

    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'images', filename: 'test_2.webp' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/webp');
  });

  it('should handle WebM videos', async () => {
    await writeFile(
      join(TEST_STORAGE_DIR, 'videos', 'test_1.webm'),
      Buffer.from('fake-webm-data')
    );

    const mockRequest = {} as Request;
    const response = await GET(mockRequest, {
      params: { type: 'videos', filename: 'test_1.webm' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('video/webm');
  });
});
