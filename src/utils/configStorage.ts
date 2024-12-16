import { SavedConfig, APISettings, URLParts } from '../types/api';

const STORAGE_KEY = 'ollama_saved_configs';

export const loadSavedConfigs = (): SavedConfig[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveConfig = (settings: APISettings, urlParts: URLParts) => {
    const configs = loadSavedConfigs();
    const newConfig: SavedConfig = {
        id: Date.now().toString(),
        name: urlParts.host,
        lastUsed: new Date(),
        urlParts,
        ...settings
    };
    
    configs.push(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    return newConfig;
};

export const deleteConfig = (id: string) => {
    const configs = loadSavedConfigs();
    const filtered = configs.filter(config => config.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const updateConfig = (id: string, updates: Partial<SavedConfig>) => {
    const configs = loadSavedConfigs();
    const index = configs.findIndex(config => config.id === id);
    if (index !== -1) {
        configs[index] = { ...configs[index], ...updates, lastUsed: new Date() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
        return configs[index];
    }
    return null;
}; 