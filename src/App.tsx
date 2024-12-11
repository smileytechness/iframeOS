import React from 'react';
import HomeScreen from './components/Homescreen';
import Settings from './components/Settings';

const App: React.FC = () => {
    return (
        <div>
            <HomeScreen />
            {/* Uncomment to show settings */}
            {/* <Settings /> */}
        </div>
    );
};

export default App;
