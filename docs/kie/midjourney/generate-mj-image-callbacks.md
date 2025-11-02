# Midjourney Image Generation Callbacks

> When image generation is completed, the system will send a POST request to this URL

When you submit an image generation task to the Midjourney API, you can use the `callBackUrl` parameter to set a callback URL. The system will automatically push the results to your specified address when the task is completed.

## Callback Mechanism Overview

<Info>
  The callback mechanism eliminates the need to poll the API for task status. The system will proactively push task completion results to your server.
</Info>

### Callback Timing

The system will send callback notifications in the following situations:

* Midjourney image generation task completed successfully
* Midjourney image generation task failed
* Errors occurred during task processing

### Callback Method

* **HTTP Method**: POST
* **Content Type**: application/json
* **Timeout Setting**: 15 seconds

## Callback Request Format

When the task is completed, the system will send a POST request to your `callBackUrl` in the following format:

<CodeGroup>
  ```json Success Callback theme={null}
  {
    "code": 200,
    "msg": "success",
    "data": {
      "taskId": "mj_task_12345",
      "promptJson": "{\"prompt\":\"a beautiful landscape\",\"model\":\"midjourney\"}",
      "resultUrls": [
        "https://example.com/mj_result1.png",
        "https://example.com/mj_result2.png",
        "https://example.com/mj_result3.png",
        "https://example.com/mj_result4.png"
      ]
    }
  }
  ```

  ```json Failure Callback theme={null}
  {
    "code": 500,
    "msg": "Image generation failed",
    "data": {
      "taskId": "mj_task_12345",
      "promptJson": "{\"prompt\":\"a beautiful landscape\",\"model\":\"midjourney\"}",
      "resultUrls": []
    }
  }
  ```
</CodeGroup>

## Status Code Description

<ParamField path="code" type="integer" required>
  Callback status code indicating task processing result:

  | Status Code | Description                                                    |
  | ----------- | -------------------------------------------------------------- |
  | 200         | Success - Image generation completed                           |
  | 500         | Server Error - Image generation failed or other internal error |
</ParamField>

<ParamField path="msg" type="string" required>
  Status message providing detailed status description
</ParamField>

<ParamField path="data.taskId" type="string" required>
  Task ID, consistent with the taskId returned when you submitted the task
</ParamField>

<ParamField path="data.promptJson" type="string" required>
  JSON string containing the original request parameters, useful for tracking generation request details
</ParamField>

<ParamField path="data.resultUrls" type="array" required>
  Array of result URLs for generated images/videos, contains accessible download links on success
</ParamField>

## Callback Reception Examples

Here are example codes for receiving callbacks in popular programming languages:

<Tabs>
  <Tab title="Node.js">
    ```javascript  theme={null}
    const express = require('express');
    const app = express();

    app.use(express.json());

    app.post('/mj-image-callback', (req, res) => {
      const { code, msg, data } = req.body;
      
      console.log('Received Midjourney image generation callback:', {
        taskId: data.taskId,
        status: code,
        message: msg
      });
      
      if (code === 200) {
        // Task completed successfully
        console.log('Midjourney image generation completed');
        
        // Parse original request parameters
        try {
          const promptData = JSON.parse(data.promptJson);
          console.log('Original prompt:', promptData.prompt);
        } catch (e) {
          console.log('Failed to parse promptJson:', e);
        }
        
        // Process generated images
        const resultUrls = data.resultUrls || [];
        console.log(`Generated ${resultUrls.length} images:`);
        
        resultUrls.forEach((url, index) => {
          console.log(`Image ${index + 1}: ${url}`);
        });
        
        // Download and save images
        // Add image download logic here
        
      } else {
        // Task failed
        console.log('Midjourney image generation failed:', msg);
        
        // Handle failure cases...
      }
      
      // Return 200 status code to confirm callback received
      res.status(200).json({ status: 'received' });
    });

    app.listen(3000, () => {
      console.log('Callback server running on port 3000');
    });
    ```
  </Tab>

  <Tab title="Python">
    ```python  theme={null}
    from flask import Flask, request, jsonify
    import requests
    import json

    app = Flask(__name__)

    @app.route('/mj-image-callback', methods=['POST'])
    def handle_callback():
        data = request.json
        
        code = data.get('code')
        msg = data.get('msg')
        callback_data = data.get('data', {})
        task_id = callback_data.get('taskId')
        prompt_json = callback_data.get('promptJson', '{}')
        result_urls = callback_data.get('resultUrls', [])
        
        print(f"Received Midjourney image generation callback: {task_id}, status: {code}, message: {msg}")
        
        if code == 200:
            # Task completed successfully
            print("Midjourney image generation completed")
            
            # Parse original request parameters
            try:
                prompt_data = json.loads(prompt_json)
                print(f"Original prompt: {prompt_data.get('prompt', '')}")
            except json.JSONDecodeError as e:
                print(f"Failed to parse promptJson: {e}")
            
            # Process generated images
            print(f"Generated {len(result_urls)} images:")
            
            for i, url in enumerate(result_urls):
                print(f"Image {i + 1}: {url}")
                
                # Download image example
                try:
                    response = requests.get(url)
                    if response.status_code == 200:
                        filename = f"mj_image_{task_id}_{i + 1}.png"
                        with open(filename, "wb") as f:
                            f.write(response.content)
                        print(f"Image saved as {filename}")
                except Exception as e:
                    print(f"Image download failed: {e}")
                    
        else:
            # Task failed
            print(f"Midjourney image generation failed: {msg}")
            
            # Handle failure cases...
        
        # Return 200 status code to confirm callback received
        return jsonify({'status': 'received'}), 200

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=3000)
    ```
  </Tab>

  <Tab title="PHP">
    ```php  theme={null}
    <?php
    header('Content-Type: application/json');

    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $code = $data['code'] ?? null;
    $msg = $data['msg'] ?? '';
    $callbackData = $data['data'] ?? [];
    $taskId = $callbackData['taskId'] ?? '';
    $promptJson = $callbackData['promptJson'] ?? '{}';
    $resultUrls = $callbackData['resultUrls'] ?? [];

    error_log("Received Midjourney image generation callback: $taskId, status: $code, message: $msg");

    if ($code === 200) {
        // Task completed successfully
        error_log("Midjourney image generation completed");
        
        // Parse original request parameters
        $promptData = json_decode($promptJson, true);
        if ($promptData) {
            error_log("Original prompt: " . ($promptData['prompt'] ?? ''));
        } else {
            error_log("Failed to parse promptJson");
        }
        
        // Process generated images
        error_log("Generated " . count($resultUrls) . " images:");
        
        foreach ($resultUrls as $index => $url) {
            error_log("Image " . ($index + 1) . ": $url");
            
            // Download image example
            try {
                $imageContent = file_get_contents($url);
                if ($imageContent !== false) {
                    $filename = "mj_image_{$taskId}_" . ($index + 1) . ".png";
                    file_put_contents($filename, $imageContent);
                    error_log("Image saved as $filename");
                }
            } catch (Exception $e) {
                error_log("Image download failed: " . $e->getMessage());
            }
        }
        
    } else {
        // Task failed
        error_log("Midjourney image generation failed: $msg");
        
        // Handle failure cases...
    }

    // Return 200 status code to confirm callback received
    http_response_code(200);
    echo json_encode(['status' => 'received']);
    ?>
    ```
  </Tab>
</Tabs>

## Best Practices

<Tip>
  ### Callback URL Configuration Recommendations

  1. **Use HTTPS**: Ensure your callback URL uses HTTPS protocol for secure data transmission
  2. **Verify Source**: Verify the legitimacy of the request source in callback processing
  3. **Idempotent Processing**: The same taskId may receive multiple callbacks, ensure processing logic is idempotent
  4. **Quick Response**: Callback processing should return a 200 status code as quickly as possible to avoid timeout
  5. **Asynchronous Processing**: Complex business logic should be processed asynchronously to avoid blocking callback response
  6. **Batch Processing**: Midjourney typically generates multiple images, recommend batch downloading and processing
</Tip>

<Warning>
  ### Important Reminders

  * Callback URL must be a publicly accessible address
  * Server must respond within 15 seconds, otherwise it will be considered a timeout
  * If 3 consecutive retries fail, the system will stop sending callbacks
  * Please ensure the stability of callback processing logic to avoid callback failures due to exceptions
  * Midjourney generated image URLs may have time limits, recommend downloading and saving promptly
  * Pay attention to processing the promptJson field, which contains useful original request information
</Warning>

## Troubleshooting

If you do not receive callback notifications, please check the following:

<AccordionGroup>
  <Accordion title="Network Connection Issues">
    * Confirm that the callback URL is accessible from the public network
    * Check firewall settings to ensure inbound requests are not blocked
    * Verify that domain name resolution is correct
  </Accordion>

  <Accordion title="Server Response Issues">
    * Ensure the server returns HTTP 200 status code within 15 seconds
    * Check server logs for error messages
    * Verify that the interface path and HTTP method are correct
  </Accordion>

  <Accordion title="Content Format Issues">
    * Confirm that the received POST request body is in JSON format
    * Check that Content-Type is application/json
    * Verify that JSON parsing is correct
  </Accordion>

  <Accordion title="Image Processing Issues">
    * Confirm that image URLs are accessible
    * Check image download permissions and network connections
    * Verify image save paths and permissions
    * Note that Midjourney may generate multiple images requiring batch processing
  </Accordion>
</AccordionGroup>

## Alternative Solution

If you cannot use the callback mechanism, you can also use polling:

<Card title="Poll Query Results" icon="radar" href="/mj-api/get-mj-task-details">
  Use the get Midjourney task details endpoint to regularly query task status. We recommend querying every 30 seconds.
</Card>
