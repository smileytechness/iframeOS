import React, { useState, useEffect, useRef } from 'react';
import APISettingsPanel from './OllamaChat/APISettings';
import { APISettings } from '../types/api';
import { loadSavedConfigs } from '../utils/configStorage';
import { FiMinus, FiX, FiArrowDown } from 'react-icons/fi';
import MessageBubble from './OllamaChat/MessageBubble';
import StatusIndicator from './OllamaChat/StatusIndicator';

interface OllamaChatProps {
    onClose: () => void;
    onMinimize: () => void;
}

// Add this helper function at the top of the file
const getDisplayUrl = (url: string): string => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname;
    } catch (e) {
        // Return a sensible fallback for invalid/incomplete URLs
        return url.replace(/^https?:\/\//, '') || 'Configure Server';
    }
};

const OllamaChat: React.FC<OllamaChatProps> = ({ onClose, onMinimize }) => {
    // Initialize API Settings from saved configs or defaults
    const [apiSettings, setApiSettings] = useState<APISettings>(() => {
        const saved = loadSavedConfigs();
        return saved[0] || {
            serverUrl: 'http://localhost:11434/v1/chat/completions',
            model: 'qwen2.5',
            temperature: 1.0,
            maxTokens: 150,
            topP: 0.9,
            frequencyPenalty: 0,
            presencePenalty: 0
        };
    });

    // Add chat state
    const [messages, setMessages] = useState<Array<{ content: string; isUser: boolean }>>([]);
    const [input, setInput] = useState('');
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(() => window.innerWidth >= 768);
    const [serverStatus, setServerStatus] = useState<'success' | 'error' | 'loading' | 'unchecked'>('unchecked');
    const [userHasScrolled, setUserHasScrolled] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);

    // Add useEffect to handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsSettingsExpanded(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle scroll events
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const isAtBottom = Math.abs(
            element.scrollHeight - element.clientHeight - element.scrollTop
        ) < 50;

        setUserHasScrolled(!isAtBottom);
        // Only update autoScroll if user manually scrolls
        if (!isAtBottom && autoScroll) {
            setAutoScroll(false);
        }
    };

    // Update scroll behavior when messages change
    useEffect(() => {
        if (autoScroll && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, autoScroll]);

    // Reset scroll behavior when user sends a message
    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].isUser) {
            setAutoScroll(true);
            setUserHasScrolled(false);
        }
    }, [messages]);

    // Scroll to bottom button handler
    const handleScrollToBottom = () => {
        setAutoScroll(true);
        setUserHasScrolled(false);
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { content: input, isUser: true }]);
        const userMessage = input;
        setInput('');

        try {
            // Use current apiSettings for the API call
            const response = await fetch(apiSettings.serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                        'Authorization':`Bearer ${apiSettings.apiKey}`
                 },
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

            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            let currentMessage = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Convert the chunk to text
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line === 'data: [DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(line.replace('data: ', ''));
                        if (parsed.choices?.[0]?.delta?.content) {
                            currentMessage += parsed.choices[0].delta.content;
                            setMessages(prev => {
                                const newMessages = [...prev];
                                const lastMessage = newMessages[newMessages.length - 1];
                                
                                if (!lastMessage || lastMessage.isUser) {
                                    newMessages.push({ content: currentMessage, isUser: false });
                                } else {
                                    newMessages[newMessages.length - 1] = {
                                        content: currentMessage,
                                        isUser: false
                                    };
                                }
                                
                                return newMessages;
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                content: 'Error: Failed to get response from server',
                isUser: false
            }]);
        }
    };

    // Add handler to receive status updates from APISettingsPanel
    const handleStatusUpdate = (newStatus: 'success' | 'error' | 'loading' | 'unchecked') => {
        setServerStatus(newStatus);
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col">
            {/* Header - Fixed height */}
            <div className="flex-none border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold">AI Chat</h1>
                        
                        {/* Settings Status - Show in both mobile and desktop */}
                        <button 
                            onClick={() => setIsSettingsExpanded(true)}
                            className="flex items-center space-x-2 px-3 py-1.5 text-sm 
                                     bg-gray-100 dark:bg-gray-800 rounded-full"
                        >
                            <span className="truncate max-w-[150px]">
                                {getDisplayUrl(apiSettings.serverUrl)}
                            </span>
                            <StatusIndicator status={serverStatus} />
                        </button>
                    </div>
                    
                    {/* Window Controls - Ensure they're always on top */}
                    <div className="flex items-center space-x-2 z-50">
                        <button
                            onClick={onMinimize}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            <FiMinus className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Chat Container */}
                <div className={`flex-1 flex flex-col transition-all duration-300
                               ${isSettingsExpanded && window.innerWidth >= 768 ? 'mr-96' : ''}`}>
                    
                    {/* Messages Area */}
                    <div className="flex-1 relative">
                        <div 
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="absolute inset-0 overflow-y-auto p-4"
                        >
                            <div className="max-w-3xl mx-auto space-y-4">
                                {messages.map((message, index) => (
                                    <MessageBubble key={index} message={message} />
                                ))}
                            </div>
                        </div>

                        {/* Scroll Button */}
                        {userHasScrolled && messages.length > 0 && (
                            <div className="absolute bottom-4 right-4 z-10">
                                <button
                                    onClick={handleScrollToBottom}
                                    className="p-2 bg-primary text-white rounded-full 
                                             shadow-lg hover:bg-primary-dark transition-colors"
                                >
                                    <FiArrowDown className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex-none border-t border-gray-200 dark:border-gray-700">
                        <div className="max-w-3xl mx-auto p-4">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 
                                             rounded-lg bg-white dark:bg-gray-800"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="px-4 py-2 bg-primary text-white rounded-lg 
                                             hover:bg-primary-dark"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Panel */}
                <div className={`absolute top-0 bottom-0 right-0 w-96 bg-white dark:bg-gray-800 
                               shadow-xl transition-transform duration-300 transform
                               ${isSettingsExpanded ? 'translate-x-0' : 'translate-x-full'}
                               border-l border-gray-200 dark:border-gray-700`}>
                    <APISettingsPanel
                        settings={apiSettings}
                        onSettingsChange={setApiSettings}
                        isExpanded={isSettingsExpanded}
                        onExpandedChange={setIsSettingsExpanded}
                        onStatusUpdate={handleStatusUpdate}
                    />
                </div>
            </div>
        </div>
    );
};

export default OllamaChat; 