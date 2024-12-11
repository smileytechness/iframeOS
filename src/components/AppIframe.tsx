import React from 'react';

interface AppIframeProps {
    url: string;
    onClose: () => void;
}

const AppIframe: React.FC<AppIframeProps> = ({ url, onClose }) => {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {url === 'settings' ? (
                <div className="p-4 flex-grow">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    {/* Render your settings content here */}
                    <p>This is the settings view.</p>
                    <button onClick={onClose} className="bg-red-500 text-white p-2 rounded">Close</button>
                </div>
            ) : (
                <iframe src={url} className="flex-grow w-full h-full" title="App Iframe" />
            )}
            <div className="flex justify-around p-2 bg-gray-800 text-white">
                <button onClick={onClose}>Close</button>
                <button onClick={() => console.log('Go to Home')}>Home</button>
                <button onClick={() => console.log('Open Settings')}>Settings</button>
            </div>
        </div>
    );
};

export default AppIframe;
