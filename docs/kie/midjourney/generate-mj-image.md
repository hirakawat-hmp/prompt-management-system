# Generate Midjourney Image

> Create a new image generation task using the Midjourney AI model.

## OpenAPI

````yaml mj-api/mj-api.json post /api/v1/mj/generate
paths:
  path: /api/v1/mj/generate
  method: post
  servers:
    - url: https://api.kie.ai
      description: API Server
  request:
    security:
      - title: BearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                All APIs require authentication via Bearer Token.


                Get API Key:

                1. Visit [API Key Management Page](https://kie.ai/api-key) to
                get your API Key


                Usage:

                Add to request header:

                Authorization: Bearer YOUR_API_KEY


                Note:

                - Keep your API Key secure and do not share it with others

                - If you suspect your API Key has been compromised, reset it
                immediately in the management page
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              taskType:
                allOf:
                  - type: string
                    description: >-
                      Task type for generation mode.


                      **Image Generation Types:**

                      - mj_txt2img: Text-to-image generation

                      - mj_img2img: Image-to-image generation

                      - mj_style_reference: Style reference

                      - mj_omni_reference: Omni reference


                      **Video Generation Types:**

                      - mj_video: Image-to-standard-definition-video generation
                      (supports videoBatchSize parameters)

                      - mj_video_hd: Image-to-high-definition-video generation
                      (supports videoBatchSize parameters)
                    enum:
                      - mj_txt2img
                      - mj_img2img
                      - mj_style_reference
                      - mj_omni_reference
                      - mj_video
                      - mj_video_hd
                    default: mj_txt2img
                    example: mj_txt2img
              speed:
                allOf:
                  - type: string
                    description: >-
                      The speed of the API. It can be 'fast', 'relaxed' or
                      'turbo', which corresponds to different speed of
                      Midjourney.


                      - This parameter is not required when taskType is
                      mj_video, mj_video_hd or mj_omni_reference
                    enum:
                      - relaxed
                      - fast
                      - turbo
                    example: relaxed
              prompt:
                allOf:
                  - type: string
                    description: >-
                      Text prompt describing the desired image content. Required
                      for all generation modes.


                      - Should be detailed and specific in describing image
                      content

                      - Can include style, composition, lighting and other
                      visual elements

                      - Max length: 2000 characters
                    example: >-
                      Help me generate a sci-fi themed fighter jet in a
                      beautiful sky, to be used as a computer wallpaper
              fileUrl:
                allOf:
                  - type: string
                    description: >-
                      Input image URL (required for image-to-image and
                      image-to-video generation).


                      - Use either fileUrl or fileUrls field

                      - Must be a valid image URL

                      - Image must be accessible to the API server

                      - Leave empty for text-to-image generation
                    example: https://example.com/image.jpg
              fileUrls:
                allOf:
                  - type: array
                    items:
                      type: string
                    description: >-
                      Input image URL array (required for image-to-image and
                      image-to-video generation).


                      - Use either fileUrl or fileUrls field

                      - For backward compatibility, fileUrl field is currently
                      retained

                      - When generating videos, fileUrls can only have one image
                      link

                      - Recommended to use fileUrls field going forward

                      - Must be valid image URLs

                      - Images must be accessible to the API server

                      - Leave empty for text-to-image generation
                    example:
                      - https://example.com/image.jpg
              aspectRatio:
                allOf:
                  - type: string
                    description: >-
                      Output image/video aspect ratio.


                      **Supported Aspect Ratios:**


                      | Ratio | Format Type | Common Use Cases |

                      |-------|-------------|------------------|

                      | `2:1` | Ultra-wide | Cinematic displays, panoramic views
                      |

                      | `16:9` | Widescreen | HD video, desktop wallpapers |

                      | `4:3` | Standard | Traditional displays, presentations |

                      | `3:2` | Classic | Traditional photography, prints |

                      | `1:1` | Square | Social media posts, profile pictures |

                      | `3:4` | Portrait | Magazine layouts, portrait photos |

                      | `5:6` | Portrait | Mobile photography, stories |

                      | `9:16` | Mobile Portrait | Smartphone wallpapers,
                      stories |

                      | `2:3` | Portrait | Mobile app splash screens |

                      | `6:5` | Landscape | Tablet wallpapers, digital art |

                      | `1:2` | Ultra-tall | Mobile app splash screens, banners
                      |
                    enum:
                      - '1:2'
                      - '9:16'
                      - '2:3'
                      - '3:4'
                      - '5:6'
                      - '6:5'
                      - '4:3'
                      - '3:2'
                      - '1:1'
                      - '16:9'
                      - '2:1'
                    example: '16:9'
              version:
                allOf:
                  - type: string
                    description: >-
                      Midjourney model version to use.


                      Midjourney routinely releases new model versions to
                      improve efficiency, coherency, and quality. The latest
                      model is the default, but each model excels at producing
                      different types of images.
                    enum:
                      - '7'
                      - '6.1'
                      - '6'
                      - '5.2'
                      - '5.1'
                      - niji6
                    example: '7'
              variety:
                allOf:
                  - type: integer
                    description: |-
                      Controls the diversity of generated images.

                      - Increment by 5 each time, such as (0, 5, 10, 15...)
                      - Higher values create more diverse results
                      - Lower values create more consistent results
                    minimum: 0
                    maximum: 100
                    example: 10
              stylization:
                allOf:
                  - type: integer
                    description: |-
                      Stylization level (0-1000).

                      - Controls the artistic style intensity
                      - Higher values create more stylized results
                      - Lower values create more realistic results
                      - Suggested to be a multiple of 50
                    minimum: 0
                    maximum: 1000
                    example: 1
              weirdness:
                allOf:
                  - type: integer
                    description: |-
                      Weirdness level (0-3000).

                      - Controls the creativity and uniqueness
                      - Higher values create more unusual results
                      - Lower values create more conventional results
                      - Suggested to be a multiple of 100
                    minimum: 0
                    maximum: 3000
                    example: 1
              ow:
                allOf:
                  - type: integer
                    description: >-
                      Omni intensity parameter. Controls the strength of the
                      omni reference effect. Range: 1-1000, increments of 1
                      (e.g. 1, 2, 3).


                      - Only used when taskType is 'mj_omni_reference'

                      - Using an Omni Reference allows you to put characters,
                      objects, vehicles, or non-human creatures from a reference
                      image into your Midjourney creations

                      - Higher values result in stronger reference influence

                      - Lower values allow for more creative interpretation
                    minimum: 1
                    maximum: 1000
                    example: 500
              waterMark:
                allOf:
                  - type: string
                    description: >-
                      Watermark identifier.


                      - Optional parameter

                      - If provided, a watermark will be added to the generated
                      content
                    example: my_watermark
              enableTranslation:
                allOf:
                  - type: boolean
                    description: >-
                      Whether to enable automatic translation.


                      - Since prompt only supports English, when this parameter
                      is true, the system will automatically translate
                      non-English prompts to English

                      - If your prompt is already in English, you can set this
                      to false

                      - Default: false
                    default: false
                    example: false
              callBackUrl:
                allOf:
                  - type: string
                    format: uri
                    description: >-
                      Callback URL to receive task completion updates.


                      - Optional but recommended for production use

                      - System will POST task completion status to this URL

                      - Alternatively, use the Get Midjourney Task Details
                      endpoint to check status


                      📖 **Detailed Callback Mechanism**: See [Midjourney Image
                      Generation Callbacks](/mj-api/generate-mj-image-callbacks)
                      for callback format, status codes, best practices, and
                      troubleshooting.
                    example: https://api.example.com/callback
              videoBatchSize:
                allOf:
                  - type: integer
                    description: >-
                      Number of videos to generate. Only effective when taskType
                      is 'mj_video' or 'mj_video_hd'.


                      - 1: Generate 1 video (default)

                      - 2: Generate 2 videos

                      - 4: Generate 4 videos
                    enum:
                      - 1
                      - 2
                      - 4
                    default: 1
                    example: 1
              motion:
                allOf:
                  - type: string
                    description: >-
                      Motion parameter for video generation. Controls the level
                      of motion in generated videos.


                      - high: High motion level (default)

                      - low: Low motion level

                      - **Required when taskType is 'mj_video' or
                      'mj_video_hd'**

                      - Only effective when taskType is 'mj_video' or
                      'mj_video_hd'
                    enum:
                      - high
                      - low
                    default: high
                    example: high
            required: true
            requiredProperties:
              - prompt
              - taskType
            example:
              taskType: mj_txt2img
              speed: relaxed
              prompt: >-
                Help me generate a sci-fi themed fighter jet in a beautiful sky,
                to be used as a computer wallpaper
              fileUrls:
                - https://example.com/image.jpg
              aspectRatio: '16:9'
              version: '7'
              variety: 10
              stylization: 1
              weirdness: 1
              waterMark: ''
              enableTranslation: false
              callBackUrl: https://api.example.com/callback
              ow: 500
              videoBatchSize: 1
              motion: high
        examples:
          example:
            value:
              taskType: mj_txt2img
              speed: relaxed
              prompt: >-
                Help me generate a sci-fi themed fighter jet in a beautiful sky,
                to be used as a computer wallpaper
              fileUrls:
                - https://example.com/image.jpg
              aspectRatio: '16:9'
              version: '7'
              variety: 10
              stylization: 1
              weirdness: 1
              waterMark: ''
              enableTranslation: false
              callBackUrl: https://api.example.com/callback
              ow: 500
              videoBatchSize: 1
              motion: high
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - type: integer
                    enum:
                      - 200
                      - 400
                      - 401
                      - 402
                      - 404
                      - 422
                      - 429
                      - 455
                      - 500
                      - 501
                      - 505
                    description: >-
                      Response status code


                      - **200**: Success - Request has been processed
                      successfully

                      - **400**: Bad Request - Invalid request parameters

                      - **401**: Unauthorized - Authentication credentials are
                      missing or invalid

                      - **402**: Insufficient Credits - Account does not have
                      enough credits to perform the operation

                      - **404**: Not Found - The requested resource or endpoint
                      does not exist

                      - **422**: Validation Error - The request parameters
                      failed validation checks.The request parameters are
                      incorrect, please check the parameters.

                      - **429**: Rate Limited - Request limit has been exceeded
                      for this resource

                      - **455**: Service Unavailable - System is currently
                      undergoing maintenance

                      - **500**: Server Error - An unexpected error occurred
                      while processing the request

                      - **501**: Generation Failed - Image generation task
                      failed

                      - **505**: Feature Disabled - The requested feature is
                      currently disabled
              msg:
                allOf:
                  - type: string
                    description: Response message
                    example: success
              data:
                allOf:
                  - type: object
                    properties:
                      taskId:
                        type: string
                        description: >-
                          Task ID, can be used with Get Image Details endpoint
                          to query task status
                        example: mj_task_abcdef123456
        examples:
          example:
            value:
              code: 200
              msg: success
              data:
                taskId: mj_task_abcdef123456
        description: Request successful
    '500':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: Server Error
        examples: {}
        description: Server Error
  deprecated: false
  type: path
components:
  schemas: {}

````