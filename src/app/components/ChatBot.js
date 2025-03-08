'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ChatBot.module.css';

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { text: 'Welcome, I am your financial assistant.', isBot: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { text: 'How can I help you with your transactions today?', isBot: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputMessage.trim()) return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add user message
        setMessages(prev => [...prev, { 
            text: inputMessage, 
            isBot: false,
            timestamp: currentTime
        }]);
        
        // Clear input
        setInputMessage('');

        // Here you would typically make an API call to your backend
        // For now, we'll just simulate a response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: 'Please provide more details about your transaction.',
                isBot: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1000);
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
                            {message.text}
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