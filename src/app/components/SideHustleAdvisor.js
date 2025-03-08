'use client';

import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from './ChatBot.module.css'; // We can reuse some of the chat styles

const sideHustleInfo = {
    "Uber": {
        category: "Ride-sharing",
        type: "Transportation",
        flexibility: "High",
        initialInvestment: "Vehicle required"
    },
    "Etsy": {
        category: "E-commerce",
        type: "Creative/Crafts",
        flexibility: "High",
        initialInvestment: "Materials cost"
    },
    "Pokemon": {
        category: "Collectibles",
        type: "Trading",
        flexibility: "Medium",
        initialInvestment: "Inventory cost"
    },
    "Ebay": {
        category: "E-commerce",
        type: "Reselling",
        flexibility: "High",
        initialInvestment: "Inventory cost"
    }
};

const SideHustleAdvisor = ({ selectedHustle }) => {
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);
    const [hustleData, setHustleData] = useState(null);

    useEffect(() => {
        if (selectedHustle) {
            fetchHustleData(selectedHustle);
        }
    }, [selectedHustle]);

    const fetchHustleData = async (hustle) => {
        try {
            const [depositsRes, withdrawalsRes] = await Promise.all([
                fetch(`/api/nessie/deposits?sideHustle=${hustle}`),
                fetch(`/api/nessie/withdrawals?sideHustle=${hustle}`)
            ]);

            const depositsData = await depositsRes.json();
            const withdrawalsData = await withdrawalsRes.json();

            // Process the transaction data
            const deposits = depositsData.deposits || [];
            const withdrawals = withdrawalsData.withdrawals || [];

            // Analyze transaction patterns
            const analysis = analyzeTransactions(deposits, withdrawals);
            setHustleData(analysis);
            
            // Generate advice once we have the data
            getHustleAdvice(hustle, analysis);
        } catch (error) {
            console.error('Error fetching hustle data:', error);
        }
    };

    const analyzeTransactions = (deposits, withdrawals) => {
        // Get time patterns
        const timeAnalysis = [...deposits, ...withdrawals].reduce((acc, t) => {
            const hour = new Date(t.transaction_date).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        // Find peak hours (top 3 busiest hours)
        const peakHours = Object.entries(timeAnalysis)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));

        // Calculate earnings stats
        const totalEarnings = deposits.reduce((sum, d) => sum + d.amount, 0);
        const totalExpenses = withdrawals.reduce((sum, w) => sum + w.amount, 0);
        const netEarnings = totalEarnings - totalExpenses;
        const averageTransaction = deposits.length ? totalEarnings / deposits.length : 0;

        return {
            peakHours,
            totalEarnings,
            totalExpenses,
            netEarnings,
            averageTransaction,
            transactionCount: deposits.length + withdrawals.length,
            recentTransactions: [...deposits, ...withdrawals]
                .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
                .slice(0, 5)
        };
    };

    const getHustleAdvice = async (hustle, data) => {
        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const hustleDetails = sideHustleInfo[hustle] || {};
            
            const prompt = `You are a side hustle advisor providing specific, actionable advice for ${hustle}.
Based on real transaction data:

Business Details:
- Category: ${hustleDetails.category}
- Type: ${hustleDetails.type}
- Flexibility: ${hustleDetails.flexibility}
- Initial Investment: ${hustleDetails.initialInvestment}

Performance Data:
- Total Earnings: $${data.totalEarnings.toFixed(2)}
- Average Transaction: $${data.averageTransaction.toFixed(2)}
- Peak Hours: ${data.peakHours.map(h => `${h}:00`).join(', ')}
- Total Transactions: ${data.transactionCount}

Provide a concise response with:

1. Best Times to Work
- Focus on the peak hours shown in the data
- Suggest specific time slots based on ${hustleDetails.category} patterns

2. Performance Tips
- Based on actual earnings data
- Consider the average transaction value
- Account for any expenses

3. Earnings Potential
- Use real earnings data as reference
- Provide realistic ranges
- Factor in peak vs. off-peak hours

Keep the response brief and focused on actionable insights from the real data. No markdown formatting.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text()
                .replace(/\*\*/g, '')
                .replace(/\#/g, '')
                .replace(/\[|\]/g, '')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line)
                .join('\n\n');

            setAdvice(response);
        } catch (error) {
            console.error('Error getting side hustle advice:', error);
            setAdvice('Sorry, I couldn\'t generate advice at the moment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedHustle) {
        return null;
    }

    return (
        <div className={styles.messageWrapper}>
            <div className={`${styles.message} ${styles.botMessage}`}>
                {loading ? (
                    <div>Analyzing {selectedHustle} data and generating advice...</div>
                ) : (
                    advice.split('\n').map((line, i) => (
                        <div key={i} style={{ minHeight: '1.2em' }}>
                            {line}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SideHustleAdvisor; 