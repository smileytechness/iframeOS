import React, { useState } from 'react';
import { APISettings } from '../../types/api';
import { loadSavedConfigs, deleteConfig, updateConfigName } from '../../utils/configStorage';
import { FiTrash2, FiEdit } from 'react-icons/fi';

interface SavedConfigsProps {
    onLoadConfig: (config: APISettings) => void;
}

export const SavedConfigs: React.FC<SavedConfigsProps> = ({ onLoadConfig }) => {
    const [configs, setConfigs] = useState<APISettings[]>(loadSavedConfigs());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const handleDelete = (id: string) => {
        deleteConfig(id);
        setConfigs(loadSavedConfigs());
    };

    const handleRename = (id: string) => {
        if (editingName.trim()) {
            updateConfigName(id, editingName);
            setConfigs(loadSavedConfigs());
            setEditingId(null);
            setEditingName('');
        }
    };

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Saved Configurations</h3>
            <div className="space-y-2">
                {configs.map(config => (
                    <div key={config.id} className="flex items-center justify-between p-2 bg-gray-100 
                                                  dark:bg-gray-800 rounded">
                        <div className="flex-1">
                            {editingId === config.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => handleRename(config.id!)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleRename(config.id!)}
                                    className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700"
                                    autoFocus
                                />
                            ) : (
                                <span 
                                    onClick={() => {
                                        setEditingId(config.id ?? null);
                                        setEditingName(config.name || '');
                                    }}
                                    className="cursor-pointer hover:text-primary"
                                >
                                    {config.name || new URL(config.serverUrl).hostname}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onLoadConfig(config)}
                                className="px-3 py-1 text-sm bg-primary text-white rounded 
                                         hover:bg-primary-dark"
                            >
                                Load
                            </button>
                            <button 
                                onClick={() => handleDelete(config.id!)}
                                className="p-1 text-red-500 hover:text-red-600"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setEditingId(config.id ?? null);
                                    setEditingName(config.name || '');
                                }}
                                className="p-1 text-gray-500 hover:text-gray-600"
                            >
                                <FiEdit className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {configs.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        No saved configurations
                    </div>
                )}
            </div>
        </div>
    );
}; 
