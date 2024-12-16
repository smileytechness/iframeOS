export interface APISettings {
    serverUrl: string;
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
    lan: 'success' | 'error' | 'loading' | 'disabled';
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
    model: "The name of the model to use for generating responses."
}; 