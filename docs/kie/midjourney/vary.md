# Vary

> Create a vary task to enhance image clarity and simulate styles based on previously generated Midjourney images.

## OpenAPI

````yaml mj-api/mj-api.json post /api/v1/mj/generateVary
paths:
  path: /api/v1/mj/generateVary
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
              taskId:
                allOf:
                  - type: string
                    description: Task ID returned from MJ generation task
                    example: 96a5****67tr
              imageIndex:
                allOf:
                  - type: integer
                    description: Image index, range (0, 1, 2, 3) for the 4 generated images
                    minimum: 0
                    maximum: 3
                    example: 0
              waterMark:
                allOf:
                  - type: string
                    description: Watermark identifier (optional)
                    example: my_watermark
              callBackUrl:
                allOf:
                  - type: string
                    format: uri
                    description: >-
                      Callback URL to receive task completion updates
                      (optional) 

                       📖 **Detailed Callback Mechanism**: See [Midjourney Image Generation Callbacks](/mj-api/generate-mj-image-callbacks) for callback format, status codes, best practices, and troubleshooting.
                    example: https://example.com/callback
            required: true
            requiredProperties:
              - taskId
              - imageIndex
            example:
              taskId: 96a5****67tr
              imageIndex: 1
              waterMark: my_watermark
              callBackUrl: https://example.com/callback
        examples:
          example:
            value:
              taskId: 96a5****67tr
              imageIndex: 1
              waterMark: my_watermark
              callBackUrl: https://example.com/callback
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
                        example: 2182668588ae82da0bc553c07c48ca38
        examples:
          example:
            value:
              code: 200
              msg: success
              data:
                taskId: 2182668588ae82da0bc553c07c48ca38
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