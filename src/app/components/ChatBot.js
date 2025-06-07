'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ChatBot.module.css';
import { GoogleGenerativeAI } from "@google/generative-ai";



// Define allowed topics and keywords for financial literacy
const allowedTopics = {
    'transactions': ['transaction', 'spend', 'spent', 'spending', 'purchase', 'bought', 'buy', 'payment', 'paid', 'deposit', 'withdrawal', 'money'],
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

// Function to standardize transaction timestamps
const standardizeTransactionTime = (date) => {
    // Create a date object
    const d = new Date(date);
    
    // Options for converting to EST time
    const options = {
        timeZone: 'America/New_York',  // This ensures EST timezone
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    // Get the date in EST
    const estFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // Convert to EST timestamp
    const [month, day, year, hour, minute, second] = estFormatter.format(d)
        .replace(',', '')
        .split(/[\/\s:]/)
        .map(num => parseInt(num, 10));

    const estDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    return {
        formatted: d.toLocaleString('en-US', options),
        timestamp: estDate.getTime(),
        hour: hour // Add the EST hour for time-based analysis
    };
};

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

// Function to calculate spending patterns and insights
const analyzeTransactions = (transactions) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter transactions by time periods using EST timestamps
    const weeklyTransactions = transactions.filter(t => t.timestamp >= oneWeekAgo.getTime());
    const monthlyTransactions = transactions.filter(t => t.timestamp >= oneMonthAgo.getTime());

    // Calculate spending by type
    const categorizeTransactions = (txns) => {
        return txns.reduce((acc, t) => {
            const description = t.description.toLowerCase();
            let category = 'other';
            
            if (description.includes('food') || description.includes('restaurant') || description.includes('grocery')) {
                category = 'food';
            } else if (description.includes('transport') || description.includes('gas') || description.includes('uber')) {
                category = 'transportation';
            } else if (description.includes('bill') || description.includes('utility') || description.includes('rent')) {
                category = 'bills';
            } else if (description.includes('entertainment') || description.includes('movie') || description.includes('game')) {
                category = 'entertainment';
            }

            // Add time-based analysis
            const hour = new Date(t.timestamp).getHours();
            if (!acc[category]) {
                acc[category] = { total: 0, count: 0, byHour: {} };
            }
            if (!acc[category].byHour[hour]) {
                acc[category].byHour[hour] = { total: 0, count: 0 };
            }
            acc[category].total += t.amount;
            acc[category].count += 1;
            acc[category].byHour[hour].total += t.amount;
            acc[category].byHour[hour].count += 1;
            return acc;
        }, {});
    };

    const weeklySpendingByCategory = categorizeTransactions(weeklyTransactions.filter(t => t.type === 'withdrawal'));
    const monthlySpendingByCategory = categorizeTransactions(monthlyTransactions.filter(t => t.type === 'withdrawal'));

    // Analyze transaction patterns by hour (in EST)
    const hourlyPatterns = transactions.reduce((acc, t) => {
        const hour = new Date(t.timestamp).getHours();
        if (!acc[hour]) {
            acc[hour] = { count: 0, total: 0 };
        }
        acc[hour].count += 1;
        acc[hour].total += t.amount;
        return acc;
    }, {});

    return {
        weekly: {
            spending: weeklyTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0),
            deposits: weeklyTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0),
            categories: weeklySpendingByCategory,
            transactionCount: weeklyTransactions.length
        },
        monthly: {
            spending: monthlyTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0),
            deposits: monthlyTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0),
            categories: monthlySpendingByCategory,
            transactionCount: monthlyTransactions.length
        },
        recentTransactions: transactions.slice(0, 5),
        trends: {
            averageTransactionAmount: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length,
            mostFrequentCategory: Object.entries(monthlySpendingByCategory)
                .sort((a, b) => b[1].count - a[1].count)[0]?.[0] || 'none',
            hourlyPatterns: hourlyPatterns
        }
    };
};

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { text: 'Hello! I\'m your financial literacy assistant. I can help you understand your spending patterns and provide financial advice. Feel free to ask about your recent transactions or any financial topics!', isBot: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [chat, setChat] = useState(null);
    const [transactionData, setTransactionData] = useState(null);
    const messagesEndRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const initializeChat = async () => {
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
                        parts: [{ text: "Hello! I'm your financial literacy assistant. I can help you understand your spending patterns and provide financial advice. Feel free to ask about your recent transactions or any financial topics!" }],
                    },
                ],
            });
            
            setChat(newChat);

            // Fetch transaction data immediately
            await fetchTransactionData();
        };

        initializeChat();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchTransactionData = async () => {
        try {
            const [depositsRes, withdrawalsRes] = await Promise.all([
                fetch('/api/nessie/deposits'),
                fetch('/api/nessie/withdrawals')
            ]);

            const depositsData = await depositsRes.json();
            const withdrawalsData = await withdrawalsRes.json();

            // Combine and format transactions
            const allTransactions = [
                ...depositsData.deposits.map(d => {
                    const timeInfo = standardizeTransactionTime(d.transaction_date);
                    return {
                        ...d,
                        type: 'deposit',
                        formattedAmount: `+$${d.amount.toFixed(2)}`,
                        formattedDate: timeInfo.formatted,
                        timestamp: timeInfo.timestamp
                    };
                }),
                ...withdrawalsData.withdrawals.map(w => {
                    const timeInfo = standardizeTransactionTime(w.transaction_date);
                    return {
                        ...w,
                        type: 'withdrawal',
                        formattedAmount: `-$${w.amount.toFixed(2)}`,
                        formattedDate: timeInfo.formatted,
                        timestamp: timeInfo.timestamp
                    };
                })
            ];

            // Sort by timestamp
            allTransactions.sort((a, b) => b.timestamp - a.timestamp);

            // Calculate totals
            const totalDeposits = depositsData.deposits.reduce((sum, d) => sum + d.amount, 0);
            const totalWithdrawals = withdrawalsData.withdrawals.reduce((sum, w) => sum + w.amount, 0);
            const netAmount = totalDeposits - totalWithdrawals;

            // Analyze transactions
            const analysis = analyzeTransactions(allTransactions);
            setTransactionData(analysis);
        } catch (error) {
            console.error('Error fetching transaction data:', error);
        }
    };

    const handleSend = async () => {
        if (!inputMessage.trim()) return;
        if (!chat) return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                    text: 'I apologize, but I can only provide information about financial topics such as your transactions, spending, investments, personal finance, financial planning, business finance, and cryptocurrency. Could you please ask something related to these areas?',
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                return;
            }

            let prompt = userMessage;
            if (userMessage.toLowerCase().match(/transaction|spend|spent|payment|deposit|withdrawal|budget|expense|money/)) {
                // Fetch all transactions
                const [depositsRes, withdrawalsRes] = await Promise.all([
                    fetch('/api/nessie/deposits'),
                    fetch('/api/nessie/withdrawals')
                ]);

                const depositsData = await depositsRes.json();
                const withdrawalsData = await withdrawalsRes.json();

                // Combine and format transactions
                const allTransactions = [
                    ...depositsData.deposits.map(d => ({
                        ...d,
                        type: 'deposit',
                        formattedAmount: `+$${d.amount.toFixed(2)}`
                    })),
                    ...withdrawalsData.withdrawals.map(w => ({
                        ...w,
                        type: 'withdrawal',
                        formattedAmount: `-$${w.amount.toFixed(2)}`
                    }))
                ];

                // Sort by date
                allTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

                // Calculate totals
                const totalDeposits = depositsData.deposits.reduce((sum, d) => sum + d.amount, 0);
                const totalWithdrawals = withdrawalsData.withdrawals.reduce((sum, w) => sum + w.amount, 0);
                const netAmount = totalDeposits - totalWithdrawals;

                prompt = `You are a friendly dinosaur financial assistant having a casual conversation. First part of response should be sounds that a dinosaur would make. Then respond in a simple, easy-to-understand way without using financial jargon. Keep your response brief and conversational, as if chatting with a friend.

Here is your complete financial transaction data:

Transaction Summary:
Total Transactions: ${allTransactions.length}
Total Deposits: ${depositsData.deposits.length} (Total: $${totalDeposits.toFixed(2)})
Total Withdrawals: ${withdrawalsData.withdrawals.length} (Total: $${totalWithdrawals.toFixed(2)})
Net Amount: $${netAmount.toFixed(2)}

All Transactions (from newest to oldest):
${allTransactions.map(t => 
    `${t.formattedDate} - ${t.description}: ${t.formattedAmount}`
).join('\n')}
Make all times into Eastern time, not 24 hour clock time.
Question: ${userMessage}

Please provide a brief, friendly response in 2-3 short sentences. Use everyday language and avoid technical terms. Focus on the most important points that would matter to someone managing their money.`;
            }

            const result = await chat.sendMessage(prompt);
            const response = formatResponse(result.response.text())
                // Remove any markdown formatting
                .replace(/\*\*/g, '')
                .replace(/\#/g, '')
                .replace(/\[|\]/g, '')
                // Ensure proper spacing but not too much
                .split('\n')
                .map(line => line.trim())
                .filter(line => line) // Remove empty lines
                .join('\n\n')
                // Reduce multiple newlines to maximum of two
                .replace(/\n{3,}/g, '\n\n');
            
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
                        {message.isBot && (
                            <div className={styles.avatarContainer}>
                                <Image
                                    src="/dragon2.png"
                                    alt="Bot Avatar"
                                    width={40}
                                    height={40}
                                    className={styles.avatar}
                                />
                            </div>
                        )}
                        <div className={styles.messageContent}>
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