
# ConnectLLM

ConnectLLM is a powerful AI chat application that lets you interact with state-of-the-art language models using your own API keys, giving you full control over your data.

## 🌟 Features

- **Your Keys, Your Data**: Use your own OpenAI and DeepSeek API keys with full control of your data. No data is stored on any server.
- **Enhanced Reasoning**: Leverage DeepSeek's reasoning capabilities to enhance responses from OpenAI models.
- **Model Comparison**: Compare responses from different models side-by-side to see how they perform.
- **Smart Memory Control**: Control how much conversation history to include to optimize costs and maintain context.
- **Study Reasoning Process**: Download and analyze the reasoning process to understand how the AI reaches conclusions.

## 🧠 DeepSeek Reasoning

ConnectLLM integrates DeepSeek's powerful reasoning capabilities to enhance the responses from OpenAI models:

### How DeepSeek Reasoning Works

1. **Dual-AI Processing**: When enabled, your query is first sent to DeepSeek's specialized reasoning model.
2. **Structured Thinking**: DeepSeek applies step-by-step reasoning to analyze the problem from multiple angles.
3. **Enhanced Response**: The reasoning output is then provided to OpenAI's model as context, resulting in more thorough and accurate responses.
4. **Transparent Process**: The entire reasoning process is visible and downloadable, allowing you to understand how the AI reached its conclusions.

### Benefits of DeepSeek Reasoning

- **Improved Accuracy**: Complex queries receive more accurate and nuanced responses.
- **Educational Value**: Study the AI's reasoning process to understand problem-solving approaches.
- **Reduced Hallucinations**: The structured reasoning helps reduce incorrect assumptions by grounding the model's thinking.
- **Research Tool**: Great for researchers analyzing AI reasoning patterns and limitations.

## 🔄 Model Comparison Platform

ConnectLLM offers a unique model comparison platform that allows you to:

- **Side-by-Side Comparison**: See how different models respond to the same query simultaneously.
- **Mix and Match**: Compare OpenAI models with or without DeepSeek reasoning enhancement.
- **Parameter Experimentation**: Test how different temperature and token settings affect responses.
- **Visual Differentiation**: Clear visual separation between models makes comparing responses easy.
- **Reasoning Depth Control**: Configure reasoning effort levels (low, medium, high) to balance speed vs. thoroughness.
- **Adjustable Split View**: Customize the view layout with a resizable divider.

This comparison platform is invaluable for:
- Researchers studying model differences
- Developers selecting the right model for their application
- Educators demonstrating AI capabilities
- Anyone curious about the strengths of different language models

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- OpenAI API key (required)
- DeepSeek API key (optional, for enhanced reasoning)

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_REPOSITORY_URL>
   cd connect-llm
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys (optional):
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

   Note: You can also enter your API keys directly in the application's configuration page.

4. Start the development server:
   ```sh
   npm run dev
   ```

## 🔧 Configuration

ConnectLLM allows you to configure:

- **API Keys**: Set your OpenAI and DeepSeek API keys
- **Models**: Choose between different OpenAI models
- **Model Parameters**: Adjust temperature, max tokens, and other settings
- **Memory Control**: Determine how much conversation history to include
- **Enhanced Reasoning**: Toggle DeepSeek reasoning capabilities

## 💻 Technologies

This project is built with:

- **Vite**: Fast build tool and development server
- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Lucide React**: Beautiful icons

## 📝 API Usage

The application supports 4 models now:
- gpt-4o-mini
- gpt-4o
- o3-mini
- o1-mini

The application interacts with:

- **OpenAI API**: For generating AI responses
- **DeepSeek API**: For enhanced reasoning capabilities (optional)

Your API keys are stored locally in your browser's localStorage and are never sent to any server except the respective AI providers.

## 🛣️ Backend Setup

The ConnectLLM backend is a FastAPI application that handles communication with AI providers. To run the backend:

### Backend Prerequisites

- Python 3.8+ installed
- Redis server running locally (for conversation history storage)
- pip (Python package manager)

### Setting Up the Backend

1. Navigate to the Backend folder:
   ```sh
   cd Backend
   ```

2. Set up a Python virtual environment (recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required dependencies:
   ```sh
   pip install fastapi uvicorn openai redis python-multipart
   ```

4. Start Redis server (if not already running):
   ```sh
   # On Ubuntu/Debian
   sudo service redis-server start
   
   # On macOS with Homebrew
   brew services start redis
   
   # On Windows, start the Redis service or run it directly
   ```

5. Start the FastAPI server:
   ```sh
   uvicorn openai_server:app --host 0.0.0.0 --port 8000 --reload
   ```

6. (Optional) For production deployment, you can use Gunicorn with Uvicorn workers:
   ```sh
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker openai_server:app
   ```

### Configuring the Frontend to Use Your Backend

After starting the backend server, you need to update the frontend to use your local backend URL:

1. Open `src/utils/api.ts`
2. Find the line defining the API base URL and update it to point to your local server:
   ```typescript
   const API_BASE_URL = 'http://localhost:8000';
   ```
   or
   ```typescript
   const API_BASE_URL = 'http://127.0.0.1:8000';
   ```
3. If deploying to production, adjust the URL accordingly.

## 🧩 Project Structure

- `/src/components`: UI components
- `/src/hooks`: Custom React hooks
- `/src/pages`: Page components
- `/src/utils`: Utility functions
- `/src/types`: TypeScript type definitions
- `/Backend`: FastAPI backend server

## 🛠️ Development

### Building for Production

```sh
npm run build
```

### Running Tests

```sh
npm test
```

## 📱 Responsive Design

ConnectLLM is fully responsive and works on:

- Desktop browsers
- Tablets
- Mobile devices

## 🔒 Security

- No data is stored on any server
- API keys are stored in your browser's localStorage
- Conversations happen directly between your browser and the AI providers
- The Redis database in the backend only stores conversation IDs and message history, not API keys

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
