import React, { useState, useEffect } from 'react';
import { saveSettings, loadSettings, saveApps, loadApps, getLocalStorageSize } from '../utils/localStorage';
import { useTheme } from '../context/ThemeContext';
import { App } from '../types/app';

interface SettingsProps {
    onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
    const [apps, setApps] = useState<App[]>(loadApps());
    const [appName, setAppName] = useState('');
    const [appURL, setAppURL] = useState('');
    const [userName, setUserName] = useState('');
    const { darkMode, toggleDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('apps'); // ['apps', 'appearance', 'system']
    const [serviceName, setServiceName] = useState('');
    const [serviceIP, setServiceIP] = useState('');
    const [servicePort, setServicePort] = useState('');

    useEffect(() => {
        const settings = loadSettings();
        setUserName(settings.userName || '');
    }, []);

    const handleAddApp = () => {
        if (!appName || !appURL) return;
        const newApp = { name: appName, url: appURL };
        const updatedApps = [...apps, newApp];
        setApps(updatedApps);
        saveApps(updatedApps);
        setAppName('');
        setAppURL('');
    };

    const handleAddLocalService = () => {
        if (!serviceName || !serviceIP) return;

        const url = servicePort
            ? `${serviceIP}:${servicePort}`
            : serviceIP;

        const newApp = {
            name: serviceName,
            url: url
        };

        const updatedApps = [...apps, newApp];
        setApps(updatedApps);
        saveApps(updatedApps);

        // Reset form
        setServiceName('');
        setServiceIP('');
        setServicePort('');
    };

    const handleSaveUserName = () => {
        const settings = loadSettings();
        saveSettings({ ...settings, userName });
    };

    const handleDeleteApp = (index: number) => {
        const updatedApps = apps.filter((_: App, i: number) => i !== index);
        setApps(updatedApps);
        saveApps(updatedApps);
    };

    const TabButton: React.FC<{ name: string; active: boolean; onClick: () => void }> = ({ name, active, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${active
                    ? 'bg-primary text-white shadow-md'
                    : 'text-secondary-dark dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
        >
            {name}
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-background-light dark:bg-background-dark">
            <div className="border-b border-gray-200 dark:border-slate-700 p-3 flex justify-between items-center">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    iFrame OS Settings
                </h2>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                <div className="flex space-x-2">
                    <TabButton name="Apps" active={activeTab === 'apps'} onClick={() => setActiveTab('apps')} />
                    <TabButton name="Appearance" active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                    <TabButton name="System" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {activeTab === 'apps' && (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                            <h3 className="text-base font-semibold mb-3">Add Web App</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="App Name"
                                    value={appName}
                                    onChange={(e) => setAppName(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 
                                             dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <input
                                    type="url"
                                    placeholder="App URL (https://...)"
                                    value={appURL}
                                    onChange={(e) => setAppURL(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 
                                             dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <button
                                    onClick={handleAddApp}
                                    className="w-full px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg 
                                             transition-colors duration-200"
                                >
                                    Add App
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                            <h3 className="text-base font-semibold mb-3">Add Local Service</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Service Name (e.g., Home Assistant)"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 
                                             dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="IP Address (e.g., 192.168.1.100)"
                                        value={serviceIP}
                                        onChange={(e) => setServiceIP(e.target.value)}
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 
                                                 dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        pattern="^(\d{1,3}\.){3}\d{1,3}$"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Port"
                                        value={servicePort}
                                        onChange={(e) => setServicePort(e.target.value)}
                                        className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 
                                                 dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        pattern="^\d+$"
                                    />
                                </div>
                                <button
                                    onClick={handleAddLocalService}
                                    className="w-full px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg 
                                             transition-colors duration-200"
                                >
                                    Add Local Service
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                            <h3 className="text-base font-semibold mb-3">Installed Apps</h3>
                            <div className="space-y-1">
                                {apps.map((app: App, index: number) => (
                                    <div key={index}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 
                                                 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div>
                                            <h4 className="font-medium text-sm">{app.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{app.url}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteApp(index)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
                                                     rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Theme</h3>
                            <button
                                onClick={toggleDarkMode}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border 
                                         border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                                <span>Dark Mode</span>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 
                                              ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 
                                                   ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Storage</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Local Storage Usage: {(getLocalStorageSize() / 1024).toFixed(2)} KB
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">User Profile</h3>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 
                                         dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button
                                onClick={handleSaveUserName}
                                className="mt-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg 
                                         transition-colors duration-200"
                            >
                                Save Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
