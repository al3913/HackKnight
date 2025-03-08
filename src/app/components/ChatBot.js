'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ChatBot.module.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define allowed topics and keywords for financial literacy
const allowedTopics = {
    'investing': ['stocks', 'bonds', 'mutual funds', 'etf', 'investment', 'portfolio', 'market', 'trading', 'dividend', 'returns'],
    'personal_finance': ['budget', 'saving', 'income', 'expense', 'debt', 'credit', 'loan', 'mortgage', 'banking', 'interest'],
    'financial_planning': ['retirement', 'insurance', 'tax', 'estate', 'planning', 'goals', 'emergency fund', 'wealth', 'net worth'],
    'business_finance': ['business', 'revenue', 'profit', 'cash flow', 'accounting', 'balance sheet', 'financial statement', 'assets'],
    'cryptocurrency': ['crypto', 'bitcoin', 'blockchain', 'digital currency', 'defi', 'wallet', 'exchange', 'token']
};

// Function to check if input is relevant to allowed topics
function isRelevantTopic(input) {
    const lowercaseInput = input.toLowerCase();
    return Object.values(allowedTopics).flat().some(keyword => 
        lowercaseInput.includes(keyword.toLowerCase())
    );
}

// Function to format the response text with proper line breaks and indentation
const formatResponse = (text) => {
    // Split by line breaks and remove empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Process each line
    return lines.map(line => {
        // Add indentation for lists
        if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
            return '    ' + line;
        }
        return line;
    }).join('\n');
};

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { text: 'Hello! I\'m your financial literacy assistant, ready to help you understand personal finance, investing, financial planning, business finance, and cryptocurrency. How can I assist you with your financial questions today?', isBot: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [chat, setChat] = useState(null);
    const messagesEndRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        // Initialize Gemini chat
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const newChat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Hello" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! I'm your financial literacy assistant, ready to help you understand personal finance, investing, financial planning, business finance, and cryptocurrency. How can I assist you with your financial questions today?" }],
                },
            ],
        });
        
        setChat(newChat);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputMessage.trim()) return;
        if (!chat) return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add user message
        setMessages(prev => [...prev, { 
            text: inputMessage, 
            isBot: false,
            timestamp: currentTime
        }]);
        
        const userMessage = inputMessage;
        setInputMessage('');

        try {
            if (!isRelevantTopic(userMessage)) {
                setMessages(prev => [...prev, {
                    text: 'I apologize, but I can only provide information about financial topics such as investing, personal finance, financial planning, business finance, and cryptocurrency. Could you please ask something related to these areas?',
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                return;
            }

            const result = await chat.sendMessage(userMessage);
            const response = formatResponse(result.response.text());
            
            setMessages(prev => [...prev, {
                text: response,
                isBot: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                text: 'I apologize, but I encountered an error. Please try again.',
                isBot: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.header}>
                <button 
                    className={styles.backButton}
                    onClick={() => router.back()}
                >←</button>
                <h1>Chat</h1>
                <button className={styles.menuButton}>☰</button>
            </div>
            
            <div className={styles.messagesContainer}>
                {messages.map((message, index) => (
                    <div key={index} className={styles.messageWrapper}>
                        <div
                            className={`${styles.message} ${
                                message.isBot ? styles.botMessage : styles.userMessage
                            }`}
                        >
                            {message.text.split('\n').map((line, i) => (
                                <div key={i} style={{ minHeight: '1.2em' }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                        <div className={`${styles.timestamp} ${
                            message.isBot ? styles.botTimestamp : styles.userTimestamp
                        }`}>
                            {message.timestamp}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Write Here..."
                    className={styles.input}
                />
                <button className={styles.voiceButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                    </svg>
                </button>
                <button 
                    className={styles.sendButton}
                    onClick={handleSend}
                    type="button"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatBot; 