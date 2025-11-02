# Get Midjourney Task Details

> Retrieve the status and details of an Midjourney generation task.

## OpenAPI

````yaml mj-api/mj-api.json get /api/v1/mj/record-info
paths:
  path: /api/v1/mj/record-info
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


                Note:

                - Keep your API Key secure and do not share it with others

                - If you suspect your API Key has been compromised, reset it
                immediately in the management page
          cookie: {}
    parameters:
      path: {}
      query:
        taskId:
          schema:
            - type: string
              required: true
              description: Task ID returned from the generation request
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
                      failed validation checks

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
                        description: Task ID
                        example: 4edb3cXXXXX5e3f0aa5cc
                      taskType:
                        type: string
                        description: Task type
                        example: mj_txt2img
                      paramJson:
                        type: string
                        description: Request parameters in JSON format
                        example: >-
                          {"prompt":"Help me generate a sci-fi themed fighter
                          jet in a beautiful sky, to be used as a computer
                          wallpaper","fileUrl":"","taskType":"mj_txt2img","aspectRatio":"16:9","callBackUrl":"https://api.example.com/callback","waterMark":"","stylization":1,"weirdness":1,"version":"7","speed":"relaxed"}
                      completeTime:
                        type: string
                        description: Task completion time
                        example: '2024-03-20T10:30:00Z'
                      resultInfoJson:
                        type: object
                        description: Result information
                        properties:
                          resultUrls:
                            type: array
                            items:
                              type: object
                              properties:
                                resultUrl:
                                  type: string
                                  description: Result URL
                      successFlag:
                        type: integer
                        description: |-
                          Generation status flag

                          - **0**: Generating
                          - **1**: Success
                          - **2**: Failed
                          - **3**: Generation Failed
                        enum:
                          - 0
                          - 1
                          - 2
                          - 3
                        example: 1
                      createTime:
                        type: string
                        description: Task creation time
                        example: '2024-03-20T10:30:00Z'
                      errorCode:
                        type: integer
                        description: Error code when task fails
                        nullable: true
                        example: null
                      errorMessage:
                        type: string
                        description: Error message when task fails
                        nullable: true
                        example: null
        examples:
          example:
            value:
              code: 200
              msg: success
              data:
                taskId: 4edb3c5XXXXX75e3f0aa5cc
                taskType: mj_txt2img
                paramJson: >-
                  {"aspectRatio":"16:9","callBackUrl":"https://api.example.com/callback","fileUrl":"","prompt":"Help
                  me generate a sci-fi themed fighter jet in a beautiful sky, to
                  be used as a computer
                  wallpaper","speed":"Relax","stylization":1,"taskType":"mj_txt2img","version":"7","waterMark":"","weirdness":1}
                completeTime: '2024-03-20T10:30:00Z'
                resultInfoJson:
                  resultUrls:
                    - resultUrl: >-
                        https://tempfile.aiquickdraw.com/v/42ea4a4250571eb18361bd2e309c8e8a_0_0.jpeg
                    - resultUrl: >-
                        https://tempfile.aiquickdraw.com/v/42ea4a4250571eb18361bd2e309c8e8a_0_1.jpeg
                    - resultUrl: >-
                        https://tempfile.aiquickdraw.com/v/42ea4a4250571eb18361bd2e309c8e8a_0_2.jpeg
                    - resultUrl: >-
                        https://tempfile.aiquickdraw.com/v/42ea4a4250571eb18361bd2e309c8e8a_0_3.jpeg
                successFlag: 1
                createTime: '2024-03-20T10:30:00Z'
                errorCode: null
                errorMessage: null
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