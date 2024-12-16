import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [show, setShow] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {children}
            </div>
            {show && (
                <div className="absolute z-50 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg 
                              -translate-x-1/2 left-1/2 dark:bg-gray-800">
                    {content}
                </div>
            )}
        </div>
    );
}; 