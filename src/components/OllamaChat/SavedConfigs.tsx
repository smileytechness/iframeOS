import React, { useState, useEffect } from 'react';
import { SavedConfig, APISettings } from '../../types/api';
import { loadSavedConfigs, deleteConfig } from '../../utils/configStorage';
import { FiTrash2, FiClock } from 'react-icons/fi';

interface SavedConfigsProps {
    currentSettings: APISettings;
    onLoadConfig: (config: SavedConfig) => void;
}

const SavedConfigs: React.FC<SavedConfigsProps> = ({ onLoadConfig }) => {
    const [configs, setConfigs] = useState<SavedConfig[]>([]);

    useEffect(() => {
        setConfigs(loadSavedConfigs());
    }, []);

    const handleDelete = (id: string) => {
        deleteConfig(id);
        setConfigs(loadSavedConfigs());
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Saved Configurations</h3>
            <div className="space-y-2">
                {configs.map(config => (
                    <div
                        key={config.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                                 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => onLoadConfig(config)}
                                className="flex-1 text-left"
                            >
                                <div className="font-medium">{config.name}</div>
                                <div className="text-sm text-gray-500">
                                    {config.urlParts.protocol}://{config.urlParts.host}:{config.urlParts.port}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                    <FiClock className="w-3 h-3" />
                                    {formatDate(config.lastUsed)}
                                </div>
                            </button>
                            <button
                                onClick={() => handleDelete(config.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {configs.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                        No saved configurations
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedConfigs; 
