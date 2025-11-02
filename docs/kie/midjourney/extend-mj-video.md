# Extend Midjourney Video

> Extend existing Midjourney-generated videos to create longer sequences.

## OpenAPI

````yaml mj-api/mj-api.json post /api/v1/mj/generateVideoExtend
paths:
  path: /api/v1/mj/generateVideoExtend
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
              prompt:
                allOf:
                  - type: string
                    description: >-
                      Continuation prompt describing what should happen next in
                      the video. Required for manual extension. Max length: 2000
                      characters
                    example: >-
                      Continue the scene with the spacecraft accelerating into a
                      colorful nebula with dynamic light trails
              taskType:
                allOf:
                  - type: string
                    description: >-
                      Extension type for video generation mode.


                      - mj_video_extend_manual: Manual extension with custom
                      prompt

                      - mj_video_extend_auto: Automatic extension using
                      AI-generated continuation
                    enum:
                      - mj_video_extend_manual
                      - mj_video_extend_auto
                    example: mj_video_extend_manual
              taskId:
                allOf:
                  - type: string
                    description: Task ID of the original MJ video record to extend
                    example: ee603959-debb-48d1-98c4-a6d1c717eba6
              index:
                allOf:
                  - type: integer
                    description: Video index from the original record to extend
                    example: 0
              waterMark:
                allOf:
                  - type: string
                    description: Video watermark, optional
                    example: my_watermark
              callBackUrl:
                allOf:
                  - type: string
                    format: uri
                    description: >-
                      Callback URL to receive extension completion updates.
                      Optional but recommended in production.


                      - System will POST task status and results to this URL
                      upon completion

                      - Alternatively, use the Get Midjourney Task Details
                      endpoint to poll status


                      📖 Detailed callback format: See [Midjourney Video
                      Extension Callbacks](/mj-api/generate-mj-image-callbacks)
                    example: https://api.example.com/callback
            required: true
            requiredProperties:
              - taskId
              - taskType
              - index
        examples:
          example:
            value:
              prompt: >-
                Continue the scene with the spacecraft accelerating into a
                colorful nebula with dynamic light trails
              taskType: mj_video_extend_manual
              taskId: ee603959-debb-48d1-98c4-a6d1c717eba6
              index: 0
              waterMark: my_watermark
              callBackUrl: https://api.example.com/callback
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

                      - **501**: Generation Failed - Video extension task failed

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
                          Task ID, can be used with Get Midjourney Task Details
                          endpoint to query task status
                        example: 40d90dd1c6fddsa0a7dssa2a08366149
        examples:
          example:
            value:
              code: 200
              msg: success
              data:
                taskId: 40d90dd1c6fddsa0a7dssa2a08366149
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