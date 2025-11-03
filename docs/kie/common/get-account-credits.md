# Get Remaining Credits

## OpenAPI

````yaml common-api/common-api.json get /api/v1/chat/credit
paths:
  path: /api/v1/chat/credit
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
      query: {}
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
                      - 402
                      - 404
                      - 422
                      - 429
                      - 455
                      - 500
                      - 505
                    description: >-
                      Response Status Code


                      | Code | Description |

                      |------|-------------|

                      | 200 | Success - Request has been processed successfully
                      |

                      | 401 | Unauthorized - Authentication credentials are
                      missing or invalid |

                      | 402 | Insufficient Credits - Account does not have
                      enough credits to perform the operation |

                      | 404 | Not Found - The requested resource or endpoint
                      does not exist |

                      | 422 | Validation Error - The request parameters failed
                      validation checks |

                      | 429 | Rate Limited - Request limit has been exceeded for
                      this resource |

                      | 455 | Service Unavailable - System is currently
                      undergoing maintenance |

                      | 500 | Server Error - An unexpected error occurred while
                      processing the request |

                      | 505 | Feature Disabled - The requested feature is
                      currently disabled |
              msg:
                allOf:
                  - type: string
                    description: Error message when code != 200
                    example: success
              data:
                allOf:
                  - type: integer
                    description: Remaining credit quantity
                    example: 100
            requiredProperties:
              - code
              - msg
              - data
        examples:
          example:
            value:
              code: 200
              msg: success
              data: 100
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