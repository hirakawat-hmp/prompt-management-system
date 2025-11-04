/**
 * Asset Serving API Route
 *
 * Serves locally stored assets (images/videos) via HTTP.
 * Files are stored in STORAGE_DIR and served with appropriate cache headers.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/assets/[type]/[filename]
 *
 * Serves a stored asset file
 *
 * @param request - Next.js request object
 * @param params - Route parameters (Promise in Next.js 15+)
 * @returns File response with appropriate headers or error
 *
 * @example
 * ```
 * GET /api/assets/images/task123_0.jpg
 * → Serves storage/images/task123_0.jpg with Content-Type: image/jpeg
 *
 * GET /api/assets/videos/task456_0.mp4
 * → Serves storage/videos/task456_0.mp4 with Content-Type: video/mp4
 * ```
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; filename: string }> }
) {
  try {
    // Next.js 15+: params is a Promise and must be awaited
    const { type, filename } = await params;

    // Validate type parameter
    if (type !== 'images' && type !== 'videos') {
      return NextResponse.json(
        { error: 'Invalid asset type' },
        { status: 400 }
      );
    }

    // Build file path
    const storageDir = process.env.STORAGE_DIR || './storage';
    const filePath = join(storageDir, type, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine content type from filename
    const contentType = getMimeTypeFromFilename(filename);

    // Return file with cache headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // Cache for 1 year (files are immutable with taskId in filename)
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Determines MIME type from filename extension
 *
 * @param filename - File name with extension
 * @returns MIME type string
 *
 * @example
 * ```typescript
 * getMimeTypeFromFilename('test.jpg') // "image/jpeg"
 * getMimeTypeFromFilename('test.mp4') // "video/mp4"
 * ```
 */
function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',

    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}
