import React from 'react';

interface StatusIndicatorProps {
    status: 'success' | 'error' | 'loading' | 'unchecked' | 'skipped';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'loading':
                return 'bg-yellow-500';
            case 'skipped':
                return 'bg-gray-300';
            default:
                return 'bg-gray-300';
        }
    };

    return (
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
    );
};

export default StatusIndicator; 