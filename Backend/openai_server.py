from fastapi import FastAPI, UploadFile, File, Form, Header, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI, OpenAIError
import base64
from enum import Enum
from typing import Optional, List, Dict
import redis
import json

# Initialize FastAPI app
app = FastAPI(
    title="OpenAI Chat API",
    description="A user-friendly API for interacting with OpenAI models, supporting text and image inputs."
)

# Add CORS middleware
# In production, replace "*" with specific origins (e.g., ["https://yourfrontend.com"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis client
# Adjust host/port based on your Redis setup; enable authentication/SSL in production
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

# Constants
MAX_IMAGES = 4
MAX_IMAGE_SIZE = 4 * 1024 * 1024  # 4MB
MAX_REQUEST_SIZE = 25 * 1024 * 1024  # 25MB
SESSION_TTL = 86400  # 24 hours in seconds (optional expiration for Redis keys)

# Define enums
class Model(str, Enum):
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    O1 = "o1"
    O3_MINI = "o3-mini"

class ReasoningEffort(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

REASONING_MODELS = [Model.O1, Model.O3_MINI]

# Helper function for numeric inputs
def parse_numeric_input(value: str | None, type_: type) -> Optional[float | int]:
    if value is None or value == "":
        return None
    try:
        return type_(value)
    except ValueError:
        raise ValueError(f"Invalid {type_.__name__} value: {value}")


# Streaming generator for DeepSeek reasoning
# Streaming generator for DeepSeek reasoning
async def stream_deepseek_reasoning(deepseek_client, query, reasoning_collector, history_messages):
    deepseek_messages = history_messages + [{"role": "user", "content": query}]
    response = await deepseek_client.chat.completions.create(
        model="deepseek-reasoner",
        messages=deepseek_messages,
        stream=True
    )
    async for chunk in response:
        if chunk.choices[0].delta.reasoning_content:
            reasoning_chunk = chunk.choices[0].delta.reasoning_content
            reasoning_collector.append(reasoning_chunk)  # Collect reasoning internally
            yield reasoning_chunk  # Stream reasoning to client immediately
        elif hasattr(chunk.choices[0].delta, "content") and chunk.choices[0].delta.content is not None:
            yield "\n-----REASONING_END-----\n"  # Signal end of reasoning to client
            break  # Stop processing after reasoning ends

# Streaming generator for OpenAI response
async def stream_openai_response(client, params):
    try:
        response = await client.chat.completions.create(**params)
        async for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except OpenAIError as e:
        yield f"\nOpenAI API error: {str(e)}"
    except Exception as e:
        yield f"\nUnexpected error in OpenAI response: {str(e)}"

# Chat endpoint with Redis conversation memory and system prompt
@app.post("/chat")
async def chat(
    query: str = Form(default="", description="Optional text input from the user."),
    images: List[UploadFile] = File(default=[], description="Optional list of image files (up to 4 images, each up to 4MB)."),
    api_key: str = Header(..., description="OpenAI API key."),
    deepseek_api_key: str | None = Header(default=None, description="DeepSeek API key (required if use_v3_reasoning is True)."),
    model: Model = Form(..., description="The OpenAI model to use. Select from dropdown: gpt-4o, gpt-4o-mini, o1, o3-mini."),
    temperature: str | None = Form(default=None, description="Optional sampling temperature (0-2). Only for gpt-4o and gpt-4o-mini."),
    max_completion_tokens: str | None = Form(default=None, description="Optional limit on response tokens for gpt-4o and gpt-4o-mini."),
    reasoning_effort: ReasoningEffort | None = Form(default=None, description="Optional reasoning level for o1 and o3-mini. Defaults to medium."),
    use_v3_reasoning: bool = Form(default=False, description="Optional. Use DeepSeek-V3 reasoning before final answer (text-only, for gpt-4o and gpt-4o-mini)."),
    stream: bool = Query(default=False, description="If true, response streams incrementally as text."),
    session_id: str = Form(..., description="Unique identifier for the conversation session, provided by the client."),
    memory_pairs: str = Form(default="0", description="Number of recent user-assistant pairs to include in context: 'all', '0', or a positive integer (e.g., '5')."),
    system_prompt: str = Form(default=None, description="Optional system prompt to set the context for the AI (used for both OpenAI and DeepSeek).")
):
    ### Validate API keys
    if not api_key:
        raise HTTPException(status_code=400, detail="OpenAI API key is required")
    if use_v3_reasoning and not deepseek_api_key:
        raise HTTPException(status_code=400, detail="DeepSeek API key is required when use_v3_reasoning is True")

    ### Parse numeric inputs
    try:
        parsed_temperature = parse_numeric_input(temperature, float)
        if parsed_temperature is not None and (parsed_temperature < 0 or parsed_temperature > 2):
            raise HTTPException(status_code=400, detail="Temperature must be between 0 and 2")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        parsed_max_tokens = parse_numeric_input(max_completion_tokens, int)
        if parsed_max_tokens is not None and parsed_max_tokens <= 0:
            raise HTTPException(status_code=400, detail="max_completion_tokens must be a positive integer")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    ### Initialize OpenAI client
    client = AsyncOpenAI(api_key=api_key)

    ### Check if images are uploaded and validate
    images_uploaded = bool(images and images[0].filename)
    if images_uploaded:
        if model in [Model.O3_MINI]:
            raise HTTPException(status_code=400, detail="The O3 model does not support image inputs")
        if use_v3_reasoning:
            raise HTTPException(status_code=400, detail="DeepSeek reasoning is not supported with image inputs")

    ### Process images if present
    message_content = []
    image_processing_error = None
    
    if query:
        message_content.append({"type": "text", "text": query})

    if images_uploaded:
        try:
            total_size = 0
            for img in images:
                if not img.file:
                    image_processing_error = "Invalid file upload"
                    break
                
                data = await img.read()
                if not data:
                    image_processing_error = f"Empty file uploaded for '{img.filename}'"
                    break
                
                image_size = len(data)
                if image_size > MAX_IMAGE_SIZE:
                    image_processing_error = f"Image '{img.filename}' too large: {image_size/(1024*1024):.2f}MB. Max is {MAX_IMAGE_SIZE/(1024*1024)}MB"
                    break
                
                total_size += image_size
                if total_size > MAX_REQUEST_SIZE:
                    image_processing_error = f"Total request size exceeds {MAX_REQUEST_SIZE/(1024*1024)}MB"
                    break
                
                content_type = img.content_type or "image/png"
                try:
                    base64_image = base64.b64encode(data).decode('utf-8')
                    message_content.append({
                        "type": "image_url",
                        "image_url": {"url": f"data:{content_type};base64,{base64_image}"}
                    })
                except Exception as e:
                    image_processing_error = f"Error encoding image '{img.filename}': {str(e)}"
                    break
                
        except Exception as e:
            image_processing_error = f"Error processing images: {str(e)}"

    if image_processing_error:
        async def error_stream():
            yield f"Error: {image_processing_error}\n"
        return StreamingResponse(error_stream(), media_type="text/plain")

    if not message_content:
        async def error_stream():
            yield "Error: At least one of query or images must be provided\n"
        return StreamingResponse(error_stream(), media_type="text/plain")

    ### Retrieve conversation history from Redis
    try:
        history_json = redis_client.lrange(session_id, 0, -1)
        recent_history = [json.loads(item) for item in history_json if item]
    except (redis.RedisError, json.JSONDecodeError) as e:
        print(f"Error retrieving history from Redis: {str(e)}")
        recent_history = []

    # Apply memory_pairs logic
    if memory_pairs.lower() == "all":
        pass
    elif memory_pairs.isdigit():
        n = int(memory_pairs)
        recent_history = recent_history[-n:] if n > 0 else []
    else:
        recent_history = []

    # Build history messages
    history_messages = []
    for pair in recent_history:
        history_messages.append({"role": "user", "content": pair["user"]})
        history_messages.append({"role": "assistant", "content": pair["assistant"]})

    # Set system prompt (used for OpenAI)
    current_system_prompt = system_prompt or '''You are a helpful assistant that responds in well-formatted markdown.


For comparisons, use Table
1. Always include a header row

2. You also use
- LaTeX for mathematical equations. chemical equations or any formula related to physics or anything:
  * Use single $ for inline equations (e.g., $E = mc^2$)
  * Use double $$ for block equations (e.g., $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$)

  
Critical Rule for Inline LaTeX Expressions
The spacing rule for inline LaTeX is very strict:

✅ Correct: $E = mc^2$ (no spaces after opening $ or before closing $)
❌ Incorrect: $ E = mc^2 $ (spaces after opening $ or before closing $)
- Bullet points and numbered lists for unstructured information
- Code blocks with proper language syntax highlighting
'''
    base_messages = [{"role": "system", "content": current_system_prompt}] + history_messages if current_system_prompt else history_messages

    # Set current_message
    current_message = message_content

    ### Handle DeepSeek reasoning if enabled
    if use_v3_reasoning and model in [Model.GPT_4O, Model.GPT_4O_MINI]:
        deepseek_client = AsyncOpenAI(api_key=deepseek_api_key, base_url="https://api.deepseek.com")
        async def combined_stream():
            reasoning_collector = []
            async for chunk in stream_deepseek_reasoning(deepseek_client, query, reasoning_collector, history_messages):
                yield chunk
            full_reasoning = "".join(reasoning_collector)
            current_message_with_reasoning = current_message + [{"type": "text", "text": f"\n\nReasoning from Deep Seek LLM to help you. Frame the answer using\n: {full_reasoning}"}]
            messages = base_messages + [{"role": "user", "content": current_message_with_reasoning}]
            params = {
                "model": model.value,
                "messages": messages,
                "stream": True
            }
            if parsed_temperature is not None:
                params["temperature"] = parsed_temperature
            if parsed_max_tokens is not None:
                params["max_tokens"] = parsed_max_tokens
            full_response = []
            try:
                async for chunk in stream_openai_response(client, params):
                    if chunk:
                        full_response.append(chunk)
                        yield chunk
            finally:
                if query:
                    new_pair = {"user": query, "assistant": "".join(full_response)}
                    try:
                        redis_client.rpush(session_id, json.dumps(new_pair))
                        redis_client.expire(session_id, SESSION_TTL)
                    except redis.RedisError as e:
                        print(f"Failed to store history in Redis: {e}")
        return StreamingResponse(combined_stream(), media_type="text/plain")

    ### Prepare messages with base_messages (includes system prompt for OpenAI)
    messages = base_messages + [{"role": "user", "content": current_message}]

    ### Prepare OpenAI API parameters
    params = {
        "model": model.value,
        "messages": messages,
        "stream": True
    }

    if model in REASONING_MODELS:
        params["reasoning_effort"] = reasoning_effort.value if reasoning_effort else "medium"
    else:
        if parsed_temperature is not None:
            params["temperature"] = parsed_temperature
        if parsed_max_tokens is not None:
            params["max_tokens"] = parsed_max_tokens

    ### Handle streaming response
    async def streaming_response():
        full_response = []
        try:
            async for chunk in stream_openai_response(client, params):
                if chunk:
                    full_response.append(chunk)
                    yield chunk
        finally:
            if query:  # Only store if there's a text query
                new_pair = {"user": query, "assistant": "".join(full_response)}
                try:
                    redis_client.rpush(session_id, json.dumps(new_pair))
                    redis_client.expire(session_id, SESSION_TTL)
                except redis.RedisError as e:
                    print(f"Failed to store history in Redis: {e}")
    return StreamingResponse(streaming_response(), media_type="text/plain")

# Function to get DeepSeek-V3 reasoning (non-streaming)
async def get_v3_reasoning(query: str, deepseek_api_key: str, history_messages) -> Optional[str]:
    try:
        deepseek_client = AsyncOpenAI(api_key=deepseek_api_key, base_url="https://api.deepseek.com")
        deepseek_messages = history_messages + [{"role": "user", "content": query}]
        response = await deepseek_client.chat.completions.create(
            model="deepseek-reasoner",
            messages=deepseek_messages,
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting V3 reasoning: {str(e)}")
        return None

@app.post("/reset")
def reset_conversation(session_id: str = Form(..., description="Unique identifier for the conversation session to reset.")):
    try:
        redis_client.delete(session_id)
        return {"detail": f"Conversation history for session '{session_id}' has been reset successfully."}
    except redis.RedisError as e:
        raise HTTPException(status_code=500, detail="Failed to reset conversation history")

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
