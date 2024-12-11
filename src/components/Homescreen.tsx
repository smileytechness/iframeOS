import React, { useState } from 'react';
import AppIframe from './AppIframe';
import Settings from './Settings';
import { loadApps } from '../utils/localStorage';

const HomeScreen: React.FC = () => {
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const apps = loadApps();

    // Always include the Settings app
    const defaultApps = [
        { name: 'Settings', url: 'settings' }, // Placeholder URL for settings
        ...apps
    ];

    const handleAppClick = (url: string) => {
        if (url === 'settings') {
            setShowSettings(true);
        } else {
            setSelectedApp(url);
        }
    };

    const handleCloseIframe = () => {
        setSelectedApp(null);
        setShowSettings(false);
    };

    return (
        <div className="flex flex-col items-center justify-start h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-4 text-left w-full pl-4">FramOS</h1>
            <div className="grid grid-cols-3 gap-4 mt-4 w-full">
                {defaultApps.map((app, index) => (
                    <div key={index} className="flex flex-col items-center cursor-pointer" onClick={() => handleAppClick(app.url)}>
                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white font-bold text-2xl">{app.name.charAt(0)}</span>
                        </div>
                        <span className="text-center">{app.name}</span>
                    </div>
                ))}
            </div>
            {selectedApp && <AppIframe url={selectedApp} onClose={handleCloseIframe} />}
            {showSettings && <Settings onClose={handleCloseIframe} />}
        </div>
    );
};

export default HomeScreen;
