import React, { useState } from 'react';
import { getClearbitLogoUrl } from '../utils/urlUtils';

interface LogoIconProps {
    url: string;
    name: string;
    className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ url, name, className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const logoUrl = getClearbitLogoUrl(url);

    if (!logoUrl || imageError || url === 'settings') {
        return (
            <div className={`rounded-2xl bg-gradient-to-br from-primary via-blue-500 to-blue-400
                           flex items-center justify-center text-white text-xl font-semibold
                           ring-1 ring-white/20 shadow-lg
                           ${className}`}>
                {url === 'settings' ? '⚙️' : name.charAt(0)}
            </div>
        );
    }

    return (
        <div className={`rounded-2xl overflow-hidden bg-white/90
                        ring-1 ring-black/5 dark:ring-white/10 shadow-lg
                        ${className}`}>
            <img
                src={logoUrl}
                alt={`${name} logo`}
                className="w-full h-full object-contain p-2"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

export default LogoIcon; 
