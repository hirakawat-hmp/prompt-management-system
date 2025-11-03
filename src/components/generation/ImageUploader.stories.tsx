/**
 * ImageUploader Component Stories
 *
 * Visual examples and documentation for the image upload component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ImageUploader } from './ImageUploader';

const meta: Meta<typeof ImageUploader> = {
  title: 'Generation/ImageUploader',
  component: ImageUploader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'File upload component with drag & drop support, validation, and preview capabilities. Displays 3-day expiry warning for uploaded files.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onUploadComplete: {
      description: 'Callback fired when upload completes successfully',
      action: 'uploadComplete',
    },
    maxSizeMB: {
      description: 'Maximum file size in megabytes',
      control: { type: 'number', min: 1, max: 100 },
    },
    accept: {
      description: 'Accepted file types (MIME type pattern)',
      control: 'text',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImageUploader>;

/**
 * Default uploader state (empty)
 */
export const Default: Story = {
  args: {
    onUploadComplete: fn(),
    maxSizeMB: 100,
    accept: 'image/*',
  },
};

/**
 * Uploader with 10MB size limit
 */
export const SmallSizeLimit: Story = {
  args: {
    onUploadComplete: fn(),
    maxSizeMB: 10,
    accept: 'image/*',
  },
};

/**
 * Uploader accepting only JPEG files
 */
export const JPEGOnly: Story = {
  args: {
    onUploadComplete: fn(),
    maxSizeMB: 100,
    accept: 'image/jpeg',
  },
};

/**
 * Uploader accepting PNG and JPEG
 */
export const PNGAndJPEG: Story = {
  args: {
    onUploadComplete: fn(),
    maxSizeMB: 100,
    accept: 'image/png,image/jpeg',
  },
};

/**
 * Interactive demo with upload simulation
 */
export const Interactive: Story = {
  args: {
    onUploadComplete: (result) => {
      console.log('Upload complete:', result);
      alert(`File uploaded successfully: ${result.fileName}`);
    },
    maxSizeMB: 100,
    accept: 'image/*',
  },
};

/**
 * Usage example with description
 */
export const WithDescription: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Upload Reference Image</h3>
        <p className="text-sm text-muted-foreground">
          Upload an image to use as a reference for your generation task. Supported formats:
          JPG, PNG, WebP.
        </p>
      </div>
      <ImageUploader {...args} />
      <div className="rounded-md bg-yellow-500/10 p-3 text-xs text-yellow-700 dark:text-yellow-500">
        <strong>Note:</strong> Uploaded files are stored temporarily and will be automatically
        deleted after 3 days. Make sure to complete your generation task within this timeframe.
      </div>
    </div>
  ),
  args: {
    onUploadComplete: fn(),
    maxSizeMB: 100,
    accept: 'image/*',
  },
};

/**
 * Multiple uploaders for different use cases
 */
export const MultipleUploaders: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-2 text-sm font-medium">Style Reference (Image)</h4>
        <ImageUploader
          onUploadComplete={fn()}
          maxSizeMB={10}
          accept="image/*"
        />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">First Frame (Image)</h4>
        <ImageUploader
          onUploadComplete={fn()}
          maxSizeMB={10}
          accept="image/*"
        />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Last Frame (Image)</h4>
        <ImageUploader
          onUploadComplete={fn()}
          maxSizeMB={10}
          accept="image/*"
        />
      </div>
    </div>
  ),
};

/**
 * Drag and drop instructions
 */
export const DragAndDropInstructions: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h4 className="mb-2 font-medium">How to Use:</h4>
        <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          <li>Drag an image file from your computer</li>
          <li>Drop it onto the upload area below</li>
          <li>Review the preview and click &quot;Upload&quot;</li>
          <li>Wait for the upload to complete</li>
        </ol>
      </div>
      <ImageUploader {...args} />
    </div>
  ),
  args: {
    onUploadComplete: fn(),
    maxSizeMB: 100,
    accept: 'image/*',
  },
};
