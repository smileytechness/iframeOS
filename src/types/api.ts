export interface APISettings {
    id?: string;
    name?: string;
    serverUrl: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

export interface URLParts {
    protocol: 'http' | 'https';
    host: string;
    port: string;
    path: {
        v1: string;
        chat: string;
        completions: string;
    }
}

export interface ServerStatus {
    http: 'success' | 'error' | 'loading' | 'unchecked';
    cors: 'success' | 'error' | 'loading' | 'unchecked';
    lan: 'success' | 'error' | 'loading' | 'disabled' | 'unchecked';
    lastChecked?: Date;
    errors?: {
        type: 'http' | 'cors' | 'network';
        message: string;
        details?: string;
    }[];
}

export interface SavedConfig extends APISettings {
    id: string;
    name: string;
    lastUsed: Date;
    urlParts: URLParts;
}

export const parameterDescriptions = {
    temperature: "Controls randomness in responses. Higher values (0.8) make output more random, lower values (0.2) make it more focused.",
    maxTokens: "Maximum length of response in tokens (roughly 4 characters per token).",
    topP: "Controls diversity via nucleus sampling. Lower values (0.1) make output more focused.",
    frequencyPenalty: "Reduces repetition by lowering probability of words that have already appeared.",
    presencePenalty: "Encourages new topics by increasing probability of less-used words.",
    model: "The name of the model to use for generating responses.",
    apiKey: "Enter your API key for cloud provider (OpenAI, Anthropic, Google, Groq etc."
} as const;

export const serverStatusDescriptions = {
    http: `**BROWSER ERROR**

MIXED CONTENT error. When loading a secure webpage (HTTPS) that tries to access a non-secure server (HTTP), browsers block this as a security risk. This is called a Mixed Content error.

**What you'll see:**
- 🟢 Green: Server URL is secure or website is running locally
- 🔴 Red: Mixed Content error detected

**How to fix:**
1. Add your server URL to Chrome's security exceptions:
   \`chrome://flags/#unsafely-treat-insecure-origin-as-secure\`
2. Restart Chrome after making this change

Note: This check happens instantly as it's a browser-level security check.`,
    
    lan: `**NETWORK ISSUE**

No response from server. This checks if your computer can reach the Ollama server on your network. Common when trying to access Ollama running on another machine.

**What you'll see:**
- 🟢 Green: Server is accessible
- 🔴 Red: Cannot connect to server
- ⚫ Grey: Check skipped due to HTTP error

**Common Error:**
"Failed to load resource: net::ERR_CONNECTION_REFUSED"

**How to fix:**
1. For Ollama servers, set \`OLLAMA_HOST="0.0.0.0"\`
2. On macOS, run: \`launchctl setenv OLLAMA_HOST "0.0.0.0"\`
3. Restart Ollama from the app (not command line)`,
    
    cors: `**SERVER ISSUE**

CORS (Cross-Origin Resource Sharing) is a server security feature that controls which websites can access it. The server needs to explicitly allow this website.

**What you'll see:**
- 🟢 Green: Server allows access
- 🔴 Red: Server blocks access
- ⚫ Grey: Check skipped due to previous errors

**Common Error:**
\`Access to fetch at 'http://serverURL:11434/v1/chat/completions' has been blocked by CORS policy\`

**How to fix:**
Configure your Ollama server to allow this website:
- Set \`OLLAMA_ORIGINS\` to include this website's URL (https://iframeos.com)`
} as const;
