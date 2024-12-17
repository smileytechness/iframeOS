import React, { useState } from 'react';
import { APISettings } from '../../types/api';
import { loadSavedConfigs, deleteConfig, updateConfigName } from '../../utils/configStorage';

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
        updateConfigName(id, editingName);
        setConfigs(loadSavedConfigs());
        setEditingId(null);
    };

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Saved Configurations</h3>
            <div className="space-y-2">
                {configs.map(config => (
                    <div key={config.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                        {editingId === config.id ? (
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={() => handleRename(config.id!)}
                                className="border rounded px-2"
                            />
                        ) : (
                            <span onClick={() => {
                                setEditingId(config.id);
                                setEditingName(config.name || '');
                            }}>
                                {config.name}
                            </span>
                        )}
                        <div>
                            <button 
                                onClick={() => onLoadConfig(config)}
                                className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                            >
                                Load
                            </button>
                            <button 
                                onClick={() => handleDelete(config.id!)}
                                className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
