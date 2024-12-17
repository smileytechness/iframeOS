import React, { useState } from 'react';
import { APISettings, ServerStatus, parameterDescriptions, serverStatusDescriptions } from '../../types/api';
import { Tooltip } from '../ui/Tooltip';
import { FiInfo, FiX } from 'react-icons/fi';
import { SavedConfigs } from './SavedConfigs';
import { saveConfig } from '../../utils/configStorage';

interface APISettingsPanelProps {
    settings: APISettings;
    onSettingsChange: (settings: APISettings) => void;
    isExpanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    onStatusUpdate: (status: 'success' | 'error' | 'loading' | 'unchecked') => void;
}

// Add new type for detailed error tracking
type ErrorType = 'mixed_content' | 'network' | 'cors' | 'unknown';

interface DetailedError {
    type: ErrorType;
    message: string;
    details?: string;
}

// Update LocalServerStatus to include more specific error tracking
type LocalServerStatus = {
    http: 'success' | 'error' | 'loading' | 'unchecked';
    lan: 'success' | 'error' | 'loading' | 'unchecked' | 'skipped';
    cors: 'success' | 'error' | 'loading' | 'unchecked' | 'skipped';
    lastChecked?: Date;
    errors: DetailedError[];
};

// First, let's create a constant for the status descriptions
const STATUS_INFO = {
    http: {
        label: 'HTTP/S',
        description: serverStatusDescriptions.http
    },
    lan: {
        label: 'LAN',
        description: serverStatusDescriptions.lan
    },
    cors: {
        label: 'CORS',
        description: serverStatusDescriptions.cors
    }
};

// Add this helper component for consistent info icon styling
const InfoIcon: React.FC<{ content: string }> = ({ content }) => (
    <Tooltip content={content}>
        <div className="inline-block ml-1">
            <FiInfo className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
        </div>
    </Tooltip>
);

const APISettingsPanel: React.FC<APISettingsPanelProps> = ({
    settings,
    onSettingsChange,
    isExpanded,
    onExpandedChange,
    onStatusUpdate
}) => {
    const [isChecking, setIsChecking] = useState(false);
    const [status, setStatus] = useState<LocalServerStatus>({
        http: 'unchecked',
        cors: 'unchecked',
        lan: 'unchecked',
        errors: []
    });

    // Add new save handler
    const handleSaveConfig = () => {
        const savedConfig = saveConfig(settings);
        // Could add a toast/notification here to confirm save
    };

    const checkServerStatus = async () => {
        setIsChecking(true);
        setStatus({
            http: 'loading',
            lan: 'loading',
            cors: 'loading',
            errors: []
        });
        onStatusUpdate('loading');

        // Helper to update status with new error
        const addError = (error: DetailedError) => {
            setStatus(prev => ({
                ...prev,
                errors: [...prev.errors, error]
            }));
        };

        // 1. HTTP Check (Mixed Content)
        try {
            const serverUrl = new URL(settings.serverUrl);
            const pageProtocol = window.location.protocol;
            
            if (pageProtocol === 'https:' && serverUrl.protocol === 'http:') {
                setStatus(prev => ({
                    ...prev,
                    http: 'error',
                    lan: 'skipped',
                    cors: 'skipped',
                    errors: [{
                        type: 'mixed_content',
                        message: 'Mixed Content Error: Cannot access HTTP server from HTTPS page',
                        details: 'Add the server URL to Chrome flags: chrome://flags/#unsafely-treat-insecure-origin-as-secure'
                    }]
                }));
                setIsChecking(false);
                onStatusUpdate('error');
                return;
            }

            setStatus(prev => ({ ...prev, http: 'success' }));
            onStatusUpdate('success');

            // 2. LAN Check
            // Use the original server URL path for the check
            try {
                const response = await fetch(settings.serverUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: settings.model,
                        messages: [{ role: "user", content: "test" }],
                        stream: false
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                setStatus(prev => ({ ...prev, lan: 'success' }));
                onStatusUpdate('success');

                // 3. CORS Check
                // If we got here, CORS is working
                setStatus(prev => ({ ...prev, cors: 'success' }));
                onStatusUpdate('success');

            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes('ERR_CONNECTION_REFUSED')) {
                        setStatus(prev => ({
                            ...prev,
                            lan: 'error',
                            cors: 'skipped',
                            errors: [...prev.errors, {
                                type: 'network',
                                message: 'Server not accessible',
                                details: 'Ensure OLLAMA_HOST is set to "0.0.0.0" for LAN access'
                            }]
                        }));
                        onStatusUpdate('error');
                    } else if (error.message.includes('CORS')) {
                        setStatus(prev => ({
                            ...prev,
                            lan: 'success',
                            cors: 'error',
                            errors: [...prev.errors, {
                                type: 'cors',
                                message: 'CORS not enabled on server',
                                details: 'Set OLLAMA_ORIGINS to allow this website'
                            }]
                        }));
                        onStatusUpdate('error');
                    } else {
                        addError({
                            type: 'unknown',
                            message: error.message,
                            details: 'Unknown error occurred during server check'
                        });
                        onStatusUpdate('error');
                    }
                }
            }
        } catch (error) {
            addError({
                type: 'unknown',
                message: 'Invalid server URL',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
            onStatusUpdate('error');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className={`absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white dark:bg-gray-800 
                        shadow-xl transition-transform duration-300 ease-in-out transform
                        ${isExpanded ? 'translate-x-0' : 'translate-x-full'}
                        flex flex-col border-l border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">API Settings</h2>
                <button 
                    onClick={() => onExpandedChange(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            {/* Server Status Section */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Server Status</span>
                    <button
                        onClick={checkServerStatus}
                        disabled={isChecking}
                        className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark 
                                 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isChecking ? 'Checking...' : 'Check'}
                    </button>
                </div>
                <div className="space-y-2">
                    <StatusRow label="http" status={status.http} />
                    <StatusRow label="lan" status={status.lan} />
                    <StatusRow label="cors" status={status.cors} />
                </div>
                {status.errors.length > 0 && (
                    <div className="mt-2 text-sm">
                        {status.errors.map((error, index) => (
                            <div key={index} className="text-red-500 mt-1">
                                <div className="font-medium">{error.message}</div>
                                {error.details && (
                                    <div className="text-xs text-red-400">{error.details}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rest of the settings form */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {/* Server URL */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Server URL</label>
                        <input
                            type="text"
                            value={settings.serverUrl}
                            onChange={(e) => {
                                const newUrl = e.target.value;
                                // Basic URL validation before updating
                                try {
                                    if (newUrl && !newUrl.startsWith('http')) {
                                        // Automatically add http:// if missing
                                        onSettingsChange({
                                            ...settings,
                                            serverUrl: `http://${newUrl}`
                                        });
                                    } else {
                                        onSettingsChange({
                                            ...settings,
                                            serverUrl: newUrl
                                        });
                                    }
                                } catch (e) {
                                    // If there's an error, just update the raw text
                                    onSettingsChange({
                                        ...settings,
                                        serverUrl: newUrl
                                    });
                                }
                            }}
                            placeholder="http://localhost:11434/v1/chat/completions"
                            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Example: http://localhost:11434/v1/chat/completions
                        </p>
                    </div>

                    {/* Model */}
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center">
                            <span>Model</span>
                            <InfoIcon content={parameterDescriptions.model} />
                        </label>
                        <input
                            type="text"
                            value={settings.model}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                model: e.target.value
                            })}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                        />
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center">
                            <span>Temperature</span>
                            <InfoIcon content={parameterDescriptions.temperature} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                temperature: parseFloat(e.target.value)
                            })}
                            className="w-full"
                        />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Value: {settings.temperature}
                        </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center">
                            <span>Max Tokens</span>
                            <InfoIcon content={parameterDescriptions.maxTokens} />
                        </label>
                        <input
                            type="number"
                            value={settings.maxTokens}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                maxTokens: parseInt(e.target.value)
                            })}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                        />
                    </div>

                    {/* Top P */}
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center">
                            <span>Top P</span>
                            <InfoIcon content={parameterDescriptions.topP} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.topP}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                topP: parseFloat(e.target.value)
                            })}
                            className="w-full"
                        />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Value: {settings.topP}
                        </div>
                    </div>

                    {/* Frequency Penalty */}
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center">
                            <span>Frequency Penalty</span>
                            <InfoIcon content={parameterDescriptions.frequencyPenalty} />
                        </label>
                        <input
                            type="range"
                            min="-2"
                            max="2"
                            step="0.1"
                            value={settings.frequencyPenalty}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                frequencyPenalty: parseFloat(e.target.value)
                            })}
                            className="w-full"
                        />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Value: {settings.frequencyPenalty}
                        </div>
                    </div>

                    {/* Presence Penalty */}
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center">
                            <span>Presence Penalty</span>
                            <InfoIcon content={parameterDescriptions.presencePenalty} />
                        </label>
                        <input
                            type="range"
                            min="-2"
                            max="2"
                            step="0.1"
                            value={settings.presencePenalty}
                            onChange={(e) => onSettingsChange({
                                ...settings,
                                presencePenalty: parseFloat(e.target.value)
                            })}
                            className="w-full"
                        />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Value: {settings.presencePenalty}
                        </div>
                    </div>

                    {/* Add save configuration button */}
                    <div className="mt-4 border-t pt-4">
                        <button 
                            onClick={handleSaveConfig}
                            className="w-full px-4 py-2 bg-primary text-white rounded 
                                     hover:bg-primary-dark transition-colors duration-200"
                        >
                            Save Current Configuration
                        </button>
                    </div>

                    {/* Add SavedConfigs component */}
                    <SavedConfigs onLoadConfig={onSettingsChange} />
                </div>
            </div>
        </div>
    );
};

// Update the StatusRow component to use the InfoIcon component
const StatusRow: React.FC<{ label: keyof typeof STATUS_INFO; status: string }> = ({ label, status }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center">
            <span className="text-sm">{STATUS_INFO[label].label}</span>
            <InfoIcon content={STATUS_INFO[label].description} />
        </div>
        <StatusIndicator status={status} />
    </div>
);

// Update StatusIndicator to handle new states
const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'loading':
                return 'bg-yellow-500';
            case 'skipped':
                return 'bg-gray-300';
            default:
                return 'bg-gray-300';
        }
    };

    return (
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
    );
};

export default APISettingsPanel; 
