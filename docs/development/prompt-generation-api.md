# Prompt Generation API

AI-powered prompt generation for image and video creation models.

## Overview

The Prompt Generation API uses specialized Mastra agents to create optimized prompts for:
- **Image models**: Imagen4, Midjourney
- **Video models**: Veo3, Sora2

## API Endpoint

```
POST /api/prompts/generate
```

### Request Body

```typescript
{
  mode: 'generate' | 'improve',
  model: 'imagen4' | 'midjourney' | 'veo3' | 'sora2',
  userMessage: string,
  existingPrompt?: string  // Required for 'improve' mode
}
```

### Response

**Success (200)**:
```typescript
{
  prompt: string,           // Optimized prompt text
  parameters?: string,      // Model-specific parameters (e.g., "--ar 16:9")
  explanation?: string      // Brief explanation of applied tips
}
```

**Error (400/500)**:
```typescript
{
  error: string,
  code?: string
}
```

## Client-Side Usage

### Generate Mode

Create a new prompt from scratch:

```typescript
import { generatePrompt } from '@/lib/api/prompt-generation';

const result = await generatePrompt('midjourney', '夕暮れの富士山');

if (result.success) {
  console.log(result.data.prompt);
  // "A majestic Mount Fuji silhouetted against vibrant sunset hues..."

  console.log(result.data.parameters);
  // "--ar 16:9 --s 300 --style raw"

  console.log(result.data.explanation);
  // "Applied specific visual details, camera settings, and Midjourney parameters..."
} else {
  console.error(result.error);
}
```

### Improve Mode

Enhance an existing prompt:

```typescript
import { improvePrompt } from '@/lib/api/prompt-generation';

const result = await improvePrompt(
  'midjourney',
  'a beautiful sunset over Mt. Fuji',
  'もっと具体的に、カメラ設定も含めて'
);

if (result.success) {
  console.log(result.data.prompt);
  // "A majestic Mount Fuji silhouetted against vibrant sunset hues of orange..."
}
```

### Model Type Detection

```typescript
import { isImageModel, isVideoModel, getContentType } from '@/lib/api/prompt-generation';

isImageModel('midjourney');  // true
isVideoModel('veo3');        // true
getContentType('sora2');     // 'video'
```

## How It Works

1. **Tips Loading**: Model-specific tips are loaded from `docs/prompt_tips/{model}.md`
2. **Context Building**: Tips are passed to the agent along with mode, model, and user request
3. **Agent Selection**: Image models use `imagePromptAgent`, video models use `videoPromptAgent`
4. **Prompt Generation**: Agent generates optimized prompt following model-specific best practices
5. **Response Parsing**: Output is parsed into prompt, parameters, and explanation

## Example: Complete Flow

```typescript
// In a React component
import { generatePrompt } from '@/lib/api/prompt-generation';
import { useState } from 'react';

function PromptGenerator() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    const response = await generatePrompt(
      'imagen4',
      'A futuristic city at night with neon lights'
    );

    if (response.success) {
      setResult(response.data.prompt);
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        Generate Prompt
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}
```

## Model-Specific Tips

Each model has comprehensive prompting guidelines in `docs/prompt_tips/`:

- **imagen4.md**: Natural language descriptions, no negative prompts
- **midjourney.md**: `::` weighting, `--no` parameters, `--ar` aspect ratio
- **veo3.md**: `SFX:`, `Ambient noise:`, camera work, audio descriptions
- **sora2.md**: Cinematographer-style direction, color palettes, motion beats

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_BODY` | Request body is missing |
| `INVALID_MODE` | Mode must be "generate" or "improve" |
| `INVALID_MODEL` | Model not supported |
| `MISSING_USER_MESSAGE` | User message is required |
| `USER_MESSAGE_TOO_LONG` | Message exceeds 2000 characters |
| `MISSING_EXISTING_PROMPT` | Existing prompt required for improve mode |
| `TIPS_LOAD_ERROR` | Failed to load model tips |
| `AGENT_NOT_FOUND` | Agent not found in Mastra |
| `EMPTY_RESPONSE` | Agent returned empty response |
| `INTERNAL_ERROR` | Unexpected server error |
| `NETWORK_ERROR` | Client-side network error |

## Testing

```bash
# Using curl
curl -X POST http://localhost:3000/api/prompts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "generate",
    "model": "midjourney",
    "userMessage": "夕暮れの富士山"
  }'
```

## Next Steps

- Create UI components for prompt generation
- Integrate with existing prompt creation flow
- Add streaming support for real-time generation
- Implement prompt history and favorites
