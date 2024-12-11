import React, { useState, useEffect } from 'react';
import { saveSettings, loadSettings, saveApps, loadApps, getLocalStorageSize } from '../utils/localStorage';

interface SettingsProps {
    onClose: () => void; // Prop to handle closing the settings
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
    const [apps, setApps] = useState(loadApps());
    const [appName, setAppName] = useState('');
    const [appURL, setAppURL] = useState('');
    const [userName, setUserName] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const settings = loadSettings();
        setUserName(settings.userName || '');
        setDarkMode(settings.darkMode || false);
    }, []);

    const handleAddApp = () => {
        const newApp = { name: appName, url: appURL };
        const updatedApps = [...apps, newApp];
        setApps(updatedApps);
        saveApps(updatedApps);
        setAppName('');
        setAppURL('');
    };

    const handleSaveUserName = () => {
        const settings = { userName, darkMode };
        saveSettings(settings);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        const settings = { userName, darkMode: newDarkMode };
        saveSettings(settings);
    };

    const handleDeleteApp = (index: number) => {
        const updatedApps = apps.filter((_, i) => i !== index);
        setApps(updatedApps);
        saveApps(updatedApps);
    };

    const handleEditApp = (index: number) => {
        const appToEdit = apps[index];
        setAppName(appToEdit.name);
        setAppURL(appToEdit.url);
        handleDeleteApp(index); // Remove the app before adding it again
    };

    const localStorageSize = getLocalStorageSize();

    return (
        <div className={`p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-lg`}>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <button onClick={onClose} className="bg-red-500 text-white p-2 rounded mb-4">Close Settings</button>
            <div className="mb-6">
                <h3 className="text-xl">User Account</h3>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                />
                <button onClick={handleSaveUserName} className="bg-blue-500 text-white p-2 rounded w-full">Save</button>
            </div>
            <div className="mb-6">
                <h3 className="text-xl">Dark Mode</h3>
                <button onClick={toggleDarkMode} className={`p-2 rounded w-full ${darkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                    {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
            </div>
            <div className="mb-6">
                <h3 className="text-xl">Manage Apps</h3>
                <input
                    type="text"
                    placeholder="App Name"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                />
                <input
                    type="text"
                    placeholder="App URL"
                    value={appURL}
                    onChange={(e) => setAppURL(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                />
                <button onClick={handleAddApp} className="bg-blue-500 text-white p-2 rounded w-full">Add App</button>
                <ul className="mt-4">
                    {apps.map((app, index) => (
                        <li key={index} className="flex justify-between items-center border-b py-2">
                            <span>{app.name} - {app.url}</span>
                            <div>
                                <button onClick={() => handleEditApp(index)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                                <button onClick={() => handleDeleteApp(index)} className="bg-red-500 text-white p-1 rounded">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Local Storage Usage</h3>
                <p>{localStorageSize} bytes used</p>
            </div>
        </div>
    );
};

export default Settings;
