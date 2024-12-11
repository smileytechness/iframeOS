// src/utils/localStorage.ts

// Update the types
interface Settings {
    userName?: string;
    darkMode: boolean;
}

// Save settings to local storage
export const saveSettings = (settings: Settings) => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
};

// Load settings from local storage
export const loadSettings = (): Settings => {
    const settings = localStorage.getItem('userSettings');
    return settings ? JSON.parse(settings) : { darkMode: false };
};

// Save apps to local storage
export const saveApps = (apps: { name: string; url: string }[]) => {
    localStorage.setItem('userApps', JSON.stringify(apps));
};

// Load apps from local storage
export const loadApps = () => {
    const apps = localStorage.getItem('userApps');
    if (apps) {
        return JSON.parse(apps);
    } else {
        // Add a default app if none exist
        const defaultApps = [
            { name: 'Snapdrop', url: 'https://snapdrop.net' }
        ];
        saveApps(defaultApps); // Save default apps to local storage
        return defaultApps;
    }
};

// Get the size of local storage in bytes
export const getLocalStorageSize = () => {
    let total = 0;
    for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
            total += (localStorage[x].length + x.length) * 2; // Approximate size in bytes
        }
    }
    return total;
};
