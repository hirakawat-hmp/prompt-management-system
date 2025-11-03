# Extend Veo 3.1 AI Video

> Extend an existing Veo3.1 video by generating new content based on the original video and a text prompt.

## OpenAPI

````yaml veo3-api/veo3-api.json post /api/v1/veo/extend
paths:
  path: /api/v1/veo/extend
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
              taskId:
                allOf:
                  - type: string
                    description: >-
                      Task ID of the original video generation. Must be a valid
                      taskId returned from the video generation interface. Note:
                      Videos generated after 1080P generation cannot be
                      extended.
                    example: veo_task_abcdef123456
              prompt:
                allOf:
                  - type: string
                    description: >-
                      Text prompt describing the extended video content. Should
                      detail how you want the video to be extended, including
                      actions, scene changes, style, etc.
                    example: >-
                      The dog continues running through the park, jumping over
                      obstacles and playing with other dogs
              seeds:
                allOf:
                  - type: integer
                    description: >-
                      Random seed parameter for controlling the randomness of
                      generated content. Range: 10000-99999. Same seeds will
                      generate similar video content, different seeds will
                      generate different video content. If not specified, the
                      system will automatically assign random seeds.
                    minimum: 10000
                    maximum: 99999
                    example: 12345
              watermark:
                allOf:
                  - type: string
                    description: >-
                      Watermark text (optional). If provided, a watermark will
                      be added to the generated video.
                    example: MyBrand
              callBackUrl:
                allOf:
                  - type: string
                    description: >-
                      Callback URL when the task is completed (optional).
                      Strongly recommended for production environments.


                      - The system will send a POST request to this URL when
                      video extension is completed, containing task status and
                      results

                      - The callback contains generated video URLs, task
                      information, etc.

                      - Your callback endpoint should accept POST requests with
                      JSON payloads containing video results

                      - For detailed callback format and implementation guide,
                      see [Video Generation
                      Callbacks](./generate-veo-3-video-callbacks)

                      - Alternatively, you can use [the get video details
                      interface](./get-veo-3-video-details) to poll task status
                    example: https://your-callback-url.com/veo-extend-callback
            required: true
            requiredProperties:
              - taskId
              - prompt
            example:
              taskId: veo_task_abcdef123456
              prompt: >-
                The dog continues running through the park, jumping over
                obstacles and playing with other dogs
              seeds: 12345
              watermark: MyBrand
              callBackUrl: https://your-callback-url.com/veo-extend-callback
        examples:
          example:
            value:
              taskId: veo_task_abcdef123456
              prompt: >-
                The dog continues running through the park, jumping over
                obstacles and playing with other dogs
              seeds: 12345
              watermark: MyBrand
              callBackUrl: https://your-callback-url.com/veo-extend-callback
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


                      - **200**: Success - Extension task created

                      - **400**: Client error - Prompt violates content policy
                      or other input errors

                      - **401**: Unauthorized - Authentication credentials
                      missing or invalid

                      - **402**: Insufficient credits - Account does not have
                      enough credits to perform the operation

                      - **404**: Not found - Original video or task does not
                      exist

                      - **422**: Validation error - Request parameter validation
                      failed

                      - **429**: Rate limit - Exceeded the request limit for
                      this resource

                      - **455**: Service unavailable - System is under
                      maintenance

                      - **500**: Server error - Unexpected error occurred while
                      processing the request

                      - **501**: Extension failed - Video extension task failed

                      - **505**: Feature disabled - The requested feature is
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
                          Task ID that can be used to query task status via the
                          get video details interface
                        example: veo_extend_task_xyz789
            example:
              code: 200
              msg: success
              data:
                taskId: veo_extend_task_xyz789
        examples:
          example:
            value:
              code: 200
              msg: success
              data:
                taskId: veo_extend_task_xyz789
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