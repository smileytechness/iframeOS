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
                           flex items-center justify-center text-white text-2xl font-semibold
                           ring-1 ring-white/20 backdrop-blur-sm
                           ${className}`}>
                {url === 'settings' ? '⚙️' : name.charAt(0)}
            </div>
        );
    }

    return (
        <div className={`rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm
                        ring-1 ring-black/5 dark:ring-white/10 ${className}`}>
            <img
                src={logoUrl}
                alt={`${name} logo`}
                className="w-full h-full object-contain p-2.5"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

export default LogoIcon; 
