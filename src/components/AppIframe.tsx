import React from 'react';

interface AppIframeProps {
    url: string;
    onClose: () => void;
}

const AppIframe: React.FC<AppIframeProps> = ({ url, onClose }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow relative">
                <iframe
                    src={url}
                    className="w-full h-full"
                    title="App Content"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4
                          flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white 
                             transition-colors duration-200"
                >
                    Close
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white 
                                 transition-colors duration-200"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppIframe;
