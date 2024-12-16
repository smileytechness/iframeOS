import React, { useState, useEffect } from 'react';
import { IoInformationCircleOutline, IoClose } from 'react-icons/io5';
import { APISettings, URLParts, parameterDescriptions } from '../../types/api';
import { Tooltip } from '../ui/Tooltip';
import SavedConfigs from './SavedConfigs';

interface APISettingsPanelProps {
    settings: APISettings;
    onSettingsChange: (settings: APISettings) => void;
    isExpanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
}

interface LocalServerStatus {
    http: string;
    cors: string;
    lan: string;
    lastChecked?: Date;
    errors?: { type: string; message: string; details?: string }[];
}

const APISettingsPanel: React.FC<APISettingsPanelProps> = ({
    settings,
    onSettingsChange,
    isExpanded,
    onExpandedChange
}) => {
    useEffect(() => {
        const handleResize = () => {
            onExpandedChange(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [onExpandedChange]);

    const [urlParts, setUrlParts] = useState<URLParts>({
        protocol: 'http',
        host: '10.0.0.236',
        port: '11434',
        path: {
            v1: 'v1',
            chat: 'chat',
            completions: 'completions'
        }
    });

    const [status, setStatus] = useState<LocalServerStatus>({
        http: 'unchecked',
        cors: 'unchecked',
        lan: 'unchecked'
    });

    const [showErrors, setShowErrors] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const constructUrl = () => {
        const { protocol, host, port, path } = urlParts;
        return `${protocol}://${host}:${port}/${path.v1}/${path.chat}/${path.completions}`;
    };

    // const validateIPAddress = (ip: string) => {
    //     const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    //     if (!ipRegex.test(ip)) return false;
    //     return ip.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
    // };

    const checkServerStatus = async () => {
        setIsChecking(true);
        setStatus(prev => ({ ...prev, http: 'loading', cors: 'loading', lan: 'loading' }));

        try {
            const response = await fetch(constructUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: settings.model,
                    messages: [{ role: "system", content: "test" }],
                    stream: false
                })
            });

            // Update status based on response
            const newStatus: LocalServerStatus = {
                http: 'success',
                cors: 'success',
                lan: 'success',
                lastChecked: new Date(),
                errors: []
            };

            if (!response.ok) {
                if (response.status === 0) {
                    newStatus.cors = 'error';
                    newStatus.errors?.push({
                        type: 'cors',
                        message: 'CORS not enabled on server'
                    });
                }
                // Add other error checks...
            }

            setStatus(newStatus);
        } catch (error) {
            // Handle errors and set appropriate status
            console.error('Status check error:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const renderStatusIndicator = (type: keyof Omit<LocalServerStatus, 'lastChecked' | 'errors'>) => {
        const statusLabels = {
            http: 'HTTP',
            cors: 'CORS',
            lan: 'LAN'
        };

        const statusDescriptions = {
            http: 'HTTP access to server is allowed in browser settings. If red, check chrome://flags/#unsafely-treat-insecure-origin-as-secure',
            cors: 'Server is configured to accept requests from this origin. If red, run: export OLLAMA_ORIGINS=https://iframeos.com',
            lan: 'Server is responding on the network. Grey means waiting for HTTP status to be green.'
        };

        const getStatusColor = (type: keyof LocalServerStatus, status: string) => {
            // HTTP status
            if (type === 'http') {
                switch (status) {
                    case 'success': return 'bg-green-500';
                    case 'error': return 'bg-red-500';
                    case 'loading': return 'bg-yellow-500';
                    default: return 'bg-gray-400';
                }
            }
            // CORS status
            if (type === 'cors') {
                switch (status) {
                    case 'success': return 'bg-green-500';
                    case 'error': return 'bg-red-500';
                    case 'loading': return 'bg-yellow-500';
                    default: return 'bg-gray-400';
                }
            }
            // LAN status
            if (type === 'lan') {
                if (status === 'loading') return 'bg-yellow-500';
                // Only show green/red if HTTP is success
                if (status !== 'success') return 'bg-gray-400';
                return status === 'success' ? 'bg-green-500' : 'bg-red-500';
            }
            return 'bg-gray-400';
        };

        return (
            <Tooltip content={statusDescriptions[type]}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 
                              dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(type, status[type])} 
                                   ring-2 ring-white dark:ring-gray-800`} />
                    <span className="text-sm font-medium">{statusLabels[type]}</span>
                </div>
            </Tooltip>
        );
    };

    const renderParameter = (
        key: keyof typeof parameterDescriptions,
        value: number,
        min: number,
        max: number,
        step: number
    ) => {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                        <span className="text-sm font-medium">{key}</span>
                        <Tooltip content={parameterDescriptions[key]}>
                            <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
                        </Tooltip>
                    </label>
                    <span className="text-sm text-gray-500">{value}</span>
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onSettingsChange({
                        ...settings,
                        [key]: parseFloat(e.target.value)
                    })}
                    className="w-full accent-primary"
                />
            </div>
        );
    };

    return (
        <>
            {/* Settings Panel Container */}
            <div className={`
                fixed md:relative
                md:w-80 md:h-full
                ${isExpanded
                    ? 'inset-0 md:inset-auto'
                    : 'translate-y-full md:translate-y-0 md:w-0'
                }
                z-40 md:z-0
                transition-all duration-300 ease-in-out
            `}>
                {/* Mobile Overlay */}
                <div
                    className={`
                        md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm
                        ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        transition-opacity duration-300
                    `}
                    onClick={() => onExpandedChange(false)}
                />

                {/* Main Settings Content */}
                <div className={`
                    absolute md:relative
                    bottom-0 md:bottom-auto
                    w-full md:w-auto
                    h-[85vh] md:h-full
                    bg-white dark:bg-neutral-800
                    rounded-t-2xl md:rounded-none
                    shadow-xl md:shadow-none
                    border-t md:border-l border-gray-200 dark:border-gray-700
                    overflow-y-auto
                `}>
                    {/* Header - Now shown in both mobile and desktop */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold">API Settings</h2>
                        {/* Only show close button on mobile */}
                        {window.innerWidth < 768 && (
                            <button
                                onClick={() => onExpandedChange(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Settings Content */}
                    <div className="p-6 space-y-8">
                        {/* URL Builder Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Target Server</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={urlParts.protocol}
                                        onChange={(e) => setUrlParts(prev => ({ ...prev, protocol: e.target.value as 'http' | 'https' }))}
                                        className="px-2 py-1.5 rounded border dark:bg-neutral-700 text-sm w-24"
                                    >
                                        <option value="http">http://</option>
                                        <option value="https">https://</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={urlParts.host}
                                        onChange={(e) => setUrlParts(prev => ({ ...prev, host: e.target.value }))}
                                        placeholder="IP or hostname"
                                        className="flex-1 px-2 py-1.5 rounded border dark:bg-neutral-700 text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Port:</span>
                                    <input
                                        type="text"
                                        value={urlParts.port}
                                        onChange={(e) => setUrlParts(prev => ({ ...prev, port: e.target.value }))}
                                        className="w-20 px-2 py-1.5 rounded border dark:bg-neutral-700 text-sm"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 break-all">
                                    {constructUrl()}
                                </div>
                            </div>
                        </section>

                        {/* Status Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Status</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {renderStatusIndicator('http')}
                                    {renderStatusIndicator('cors')}
                                    {renderStatusIndicator('lan')}
                                </div>
                                <button
                                    onClick={checkServerStatus}
                                    disabled={isChecking}
                                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark 
                                             transition-colors disabled:opacity-50"
                                >
                                    {isChecking ? 'Checking...' : 'Check Status'}
                                </button>
                            </div>
                            {status.lastChecked && (
                                <div className="text-sm text-gray-500">
                                    Last checked: {status.lastChecked.toLocaleTimeString()}
                                </div>
                            )}
                            {status.errors && status.errors.length > 0 && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowErrors(!showErrors)}
                                        className="text-sm text-red-500 hover:text-red-600"
                                    >
                                        {showErrors ? 'Hide Errors' : 'Show Errors'}
                                    </button>
                                    {showErrors && (
                                        <div className="space-y-1 text-sm">
                                            {status.errors.map((error, index) => (
                                                <div key={index} className="text-red-500">
                                                    [{error.type}] {error.message}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Model Settings Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Model Settings</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Model Name</span>
                                        <Tooltip content={parameterDescriptions.model}>
                                            <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
                                        </Tooltip>
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.model}
                                        onChange={(e) => onSettingsChange({ ...settings, model: e.target.value })}
                                        placeholder="Enter model name"
                                        className="w-full px-3 py-1.5 rounded border dark:bg-neutral-700 text-sm"
                                    />
                                </div>
                                {renderParameter('temperature', settings.temperature, 0, 1, 0.1)}
                                {renderParameter('maxTokens', settings.maxTokens, 50, 2000, 50)}
                                {renderParameter('topP', settings.topP, 0, 1, 0.1)}
                                {renderParameter('frequencyPenalty', settings.frequencyPenalty, -2, 2, 0.1)}
                                {renderParameter('presencePenalty', settings.presencePenalty, -2, 2, 0.1)}
                            </div>
                        </section>
                        {/* Saved Configurations */}
                        <SavedConfigs
                            currentSettings={settings}
                            onLoadConfig={(config) => {
                                onSettingsChange(config);
                                setUrlParts(config.urlParts);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default APISettingsPanel; 
