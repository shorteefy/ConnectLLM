# Backend Design Guide for Chatbot Frontend Integration

This document outlines the requirements and expected behavior for a backend service designed to integrate with the provided Chatbot frontend application, based on an analysis of the frontend codebase.

## 1. API Endpoint & Method

*   **Endpoint:** The frontend expects the backend to listen at `/chat`.
*   **Base URL:** The frontend is configured to connect to `https://75ed-2401-4900-3602-9291-e2ee-224c-4130-4009.ngrok-free.app`.
*   **Method:** The frontend sends requests using the HTTP **POST** method.
*   **Streaming:** The frontend explicitly requests streaming responses by appending `?stream=true` to the URL (`https://75ed-2401-4900-3602-9291-e2ee-224c-4130-4009.ngrok-free.app/chat?stream=true`). The backend **MUST** support and provide Server-Sent Events (SSE) or a similar streaming mechanism for the response body.

## 2. Expected Request Format

*   **Content-Type:** The frontend sends data as `multipart/form-data`.
*   **Payload:** The request body will be `FormData` containing various fields detailed below.

## 3. Key Request Parameters (FormData Fields)

The backend should expect the following fields within the `FormData`:

*   **`query`** (String): The user's text input. Can be an empty string if only images are sent.
*   **`model`** (String): Identifier for the target AI model. Expected values based on frontend:
    *   `"gpt-4o"`
    *   `"gpt-4o-mini"`
    *   `"o1"`
    *   `"o3-mini"`
*   **`session_id`** (String): A UUID representing the current chat session. The backend should use this to maintain conversation history/context if needed.
*   **`memory_pairs`** (String): Indicates how many past user/assistant message pairs to consider for context. Expected values:
    *   `"0"` (Frontend sends "0" when user selects "All" or "None". Backend needs to decide how to interpret "0" - likely means include all available history for the session, or none if explicitly "None").
    *   `"5"`
    *   `"10"`
    *   `"15"`
*   **`temperature`** (String): Represents a float value (0.0 - 1.0). Controls model creativity. *Note: Sent for all models.*
*   **`max_completion_tokens`** (String): Represents an integer (min 1). Maximum number of tokens for the response. *Note: Sent for all models.*
*   **`use_v3_reasoning`** (String): `"true"` or `"false"`. Corresponds to the "DeepSeek Reasoner" toggle in the frontend. *Note: Sent for all models.*
*   **`reasoning_effort`** (String): `"low"`, `"medium"`, or `"high"`. Controls reasoning level. *Note: Sent for all models.*
*   **`images`** (File): Optional. Can contain 0 to 4 image files (JPEG/PNG, max 4MB each). This field will be present multiple times if multiple images are uploaded. The backend needs to handle file uploads and potentially pass them to vision-capable models.

**Important Consideration:** The frontend sends the *globally configured* values for `temperature`, `max_completion_tokens`, `use_v3_reasoning`, and `reasoning_effort` for *every* request, regardless of the specific `model` selected or any model-specific overrides set in the UI's split-view mode. The backend **must** use the `model` field to determine which parameters are relevant and how to apply them to the chosen underlying AI model.

## 4. API Key Handling

*   API keys are **NOT** sent in the `FormData`.
*   They are sent via **HTTP Headers**:
    *   **`api-key`**: Contains the OpenAI API key if provided by the user. Required by the backend logic when `model` is `gpt-4o`, `gpt-4o-mini`, or `o1`.
    *   **`deepseek-api-key`**: Contains the DeepSeek API key if provided *and* `use_v3_reasoning` is `"true"`. Required by the backend logic when `use_v3_reasoning` is `"true"`.
*   The backend should validate the presence of required keys based on the requested `model` and `use_v3_reasoning` flag and return an appropriate error if missing.

## 5. Model Handling

*   The backend must map the received `model` string (e.g., `"gpt-4o"`) to the corresponding AI model API or logic.
*   It needs to interpret the received parameters (`temperature`, `max_tokens`, etc.) correctly based on the capabilities and requirements of the target model. For example, `reasoning_effort` might only be applicable to `o1`/`o3-mini`, while `temperature` might apply mainly to GPT models.

## 6. Image Handling

*   The backend must be prepared to receive and process uploaded image files sent via the `images` field(s) in the `FormData`.
*   Image handling is only expected when the `model` is `gpt-4o`, `gpt-4o-mini`, or `o1`, and `use_v3_reasoning` is `"false"`.
*   The backend needs to integrate with models capable of processing image input (multi-modal models).

## 7. Response Format (Streaming)

*   The backend **must** stream the response back to the frontend.
*   The frontend expects a plain text stream (likely decoded chunk by chunk using `TextDecoder`). The exact streaming format (e.g., SSE `data:` fields) should be confirmed, but a simple text stream is the most likely expectation based on the frontend code.
*   The stream should contain the generated text content from the AI model.
*   Error handling: If an error occurs during generation, the backend should ideally still use the streaming mechanism to send an error message or signal an error condition. The frontend currently handles `response.ok` checks and stream reading errors.

## 8. Session Management

*   The backend should use the `session_id` provided in each request to manage conversation context.
*   The `memory_pairs` parameter indicates how much history the frontend *requests* be used. The backend needs to implement the logic to retrieve and utilize the appropriate amount of history based on this parameter and the `session_id`.
*   The frontend also uses a `resetSession` utility (calling `utils/api.ts`, which isn't fully shown but likely sends a request to the backend). The backend should provide an endpoint or mechanism to clear the history associated with a given `session_id`.

## 9. Summary & Key Considerations

*   Implement a POST endpoint at `/chat` accepting `multipart/form-data`.
*   Support streaming responses (e.g., SSE).
*   Handle API keys passed via headers (`api-key`, `deepseek-api-key`).
*   Parse all expected `FormData` fields.
*   Use the `model` field to route requests and interpret parameters correctly. Remember that core parameters (`temperature`, `max_tokens`, etc.) are sent with global values, not model-specific overrides from the UI.
*   Implement image upload handling for compatible models.
*   Manage conversation history using `session_id` and `memory_pairs`.
*   Provide a mechanism to reset session history.
