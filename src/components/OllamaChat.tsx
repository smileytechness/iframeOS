import React, { useState, useEffect } from 'react';
import { IoClose, IoSettingsSharp } from 'react-icons/io5';
import APISettingsPanel from './OllamaChat/APISettings';
import { APISettings } from '../types/api';

interface OllamaChatProps {
    onClose: () => void;
}

const OllamaChat: React.FC<OllamaChatProps> = ({ onClose }) => {
    // Add API Settings state
    const [apiSettings, setApiSettings] = useState<APISettings>({
        serverUrl: 'http://10.0.0.236:11434/v1/chat/completions',
        model: 'qwen2.5',
        temperature: 0.7,
        maxTokens: 150,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
    });

    // Add chat state
    const [messages, setMessages] = useState<Array<{ content: string; isUser: boolean }>>([]);
    const [input, setInput] = useState('');
    const messagesContainerRef = React.useRef<HTMLDivElement>(null);
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(() => 
        window.innerWidth >= 768
    );

    // Add useEffect to handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsSettingsExpanded(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        
        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { content: userMessage, isUser: true }]);

        try {
            const response = await fetch(apiSettings.serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: apiSettings.model,
                    messages: [{ role: "user", content: userMessage }],
                    max_tokens: apiSettings.maxTokens,
                    temperature: apiSettings.temperature,
                    top_p: apiSettings.topP,
                    frequency_penalty: apiSettings.frequencyPenalty,
                    presence_penalty: apiSettings.presencePenalty,
                    stream: true
                })
            });

            // Handle streaming response
            const reader = response.body?.getReader();
            let responseText = '';

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    if (line.includes('"content":')) {
                        const content = line.match(/"content":"([^"]*)"/)![1];
                        responseText += content;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            if (newMessages[newMessages.length - 1]?.isUser) {
                                newMessages.push({ content: responseText, isUser: false });
                            } else {
                                newMessages[newMessages.length - 1].content = responseText;
                            }
                            return newMessages;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                isUser: false 
            }]);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row bg-neutral-50 dark:bg-neutral-900">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col border-b border-gray-200 dark:border-gray-700">
                    {/* Main Header */}
                    <div className="p-3 flex justify-between items-center">
                        <h2 className="text-xl font-bold">AI Chat</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <IoClose className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Mobile Settings Bar */}
                    <div className="md:hidden px-3 pb-3 flex items-center gap-2">
                        <button
                            onClick={() => setIsSettingsExpanded(true)}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 
                                     hover:text-primary dark:hover:text-primary-light transition-colors"
                        >
                            <IoSettingsSharp className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                        <div className="flex-1 text-right">
                            <span className="text-xs text-gray-500 truncate">
                                {apiSettings.serverUrl}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-100 dark:bg-neutral-800"
                >
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`max-w-[70%] p-3 rounded-lg ${
                                message.isUser 
                                    ? 'ml-auto bg-primary text-white' 
                                    : 'mr-auto bg-white dark:bg-neutral-700'
                            }`}
                        >
                            {message.content}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-neutral-900">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                                     bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 
                                     focus:ring-primary"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg 
                                     transition-colors duration-200"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* API Settings Panel */}
            <APISettingsPanel 
                settings={apiSettings}
                onSettingsChange={setApiSettings}
                isExpanded={isSettingsExpanded}
                onExpandedChange={setIsSettingsExpanded}
            />
        </div>
    );
};

export default OllamaChat; 