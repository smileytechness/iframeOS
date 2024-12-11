import React from 'react';
import { HomeScreen } from './components/Homescreen';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
                <HomeScreen />
            </div>
        </ThemeProvider>
    );
};

export default App;
