# Get 1080P Video

> Get the high-definition 1080P version of a Veo3.1 video generation task.

**Note**: Videos generated through fallback mode cannot be accessed via this endpoint, as they are already generated in 1080p resolution by default.

## OpenAPI

````yaml veo3-api/veo3-api.json get /api/v1/veo/get-1080p-video
paths:
  path: /api/v1/veo/get-1080p-video
  method: get
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
      query:
        taskId:
          schema:
            - type: string
              required: true
              description: Task ID
        index:
          schema:
            - type: integer
              required: false
              description: video index
      header: {}
      cookie: {}
    body: {}
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
                      - 401
                      - 404
                      - 422
                      - 429
                      - 451
                      - 455
                      - 500
                    description: >-
                      Response status code


                      - **200**: Success - Request has been processed
                      successfully

                      - **401**: Unauthorized - Authentication credentials are
                      missing or invalid

                      - **404**: Not Found - The requested resource or endpoint
                      does not exist

                      - **422**: Validation Error - The request parameters
                      failed validation checks.

                      record is null.

                      Temporarily supports records within 14 days.

                      record result data is blank.

                      record status is not success.

                      record result data not exist.

                      record result data is empty.

                      - **429**: Rate Limited - Request limit has been exceeded
                      for this resource

                      - **451**: Failed to fetch the image. Kindly verify any
                      access limits set by you or your service provider.

                      - **455**: Service Unavailable - System is currently
                      undergoing maintenance

                      - **500**: Server Error - An unexpected error occurred
                      while processing the request
              msg:
                allOf:
                  - type: string
                    description: Error message when code != 200
                    example: success
              data:
                allOf:
                  - type: object
                    properties:
                      resultUrl:
                        type: string
                        description: 1080P high-definition video download URL
                        example: >-
                          https://tempfile.aiquickdraw.com/p/42f4f8facbb040c0ade87c27cb2d5e58_1749711595.mp4
        examples:
          example:
            value:
              code: 200
              msg: success
              data:
                resultUrl: >-
                  https://tempfile.aiquickdraw.com/p/42f4f8facbb040c0ade87c27cb2d5e58_1749711595.mp4
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