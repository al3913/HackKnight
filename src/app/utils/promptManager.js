import { formatResponse } from './formatters';

// Prompt types and their detection patterns
const PROMPT_TYPES = {
    WEB_SEARCH: {
        patterns: ['article', 'learn', 'guide', 'explain', 'how to', 'what is'],
        template: (userMessage) => `
You are an intelligent financial assistant. The user has asked for web resources about: "${userMessage}"

Please provide a response that:
1. Acknowledges that while you can't directly search the web in real-time, you can provide general knowledge about the topic
2. Offers your existing knowledge about the topic
3. Suggests what kinds of resources they might want to look for
4. Recommends types of reliable sources they could consult (e.g. financial websites, government resources, etc.)

Keep your response conversational and educational.`
    },
    TRANSACTION_ANALYSIS: {
        patterns: ['transaction', 'spend', 'spent', 'payment', 'deposit', 'withdrawal', 'budget', 'expense', 'money'],
        template: (userMessage, data) => `
You are an intelligent financial assistant capable of both analysis and future planning. 
Provide personalized, actionable insights based on spending patterns.

Current Financial Snapshot:
- Total Transactions: ${data.metadata.totalTransactions}
- Total Deposits: ${data.metadata.depositsCount} (${data.metadata.totalDeposits})
- Total Withdrawals: ${data.metadata.withdrawalsCount} (${data.metadata.totalWithdrawals})
- Average Daily Spending: $${(data.metadata.totalWithdrawals / 30).toFixed(2)}
- Projected Monthly Spending: $${(data.metadata.totalWithdrawals).toFixed(2)}

Hourly Spending Pattern:
${Object.entries(data.timeSeriesData)
    .map(([hour, amount]) => `Hour ${hour}: $${amount.toFixed(2)}`)
    .join('\n')}

Based on this data, provide insights for the following question: ${userMessage}

Structure your response in these sections:
1. Immediate Analysis (2-3 sentences about current situation)
2. Future Projections (spending trajectory, savings potential, risk areas, growth opportunities)
3. Interactive Suggestions (scenarios to consider, questions for refinement, potential goals)
4. Actionable Next Steps (immediate actions, medium-term adjustments, long-term strategies)

Consider these factors:
- Current spending patterns
- Historical trends
- Seasonal variations
- Potential financial goals
- Risk factors

Encourage interaction by suggesting follow-up questions or scenarios to explore.`
    },
    DEFAULT: {
        template: (userMessage) => `
You are a financial assistant. Please provide guidance on: ${userMessage}

Structure your response to be:
1. Clear and concise
2. Actionable and practical
3. Educational
4. Interactive (encourage follow-up questions)
`
    }
};

// Detect which type of prompt to use based on user message
const detectPromptType = (message) => {
    const lowercaseMessage = message.toLowerCase();
    return Object.entries(PROMPT_TYPES).find(([type, config]) => 
        type !== 'DEFAULT' && config.patterns?.some(pattern => 
            lowercaseMessage.includes(pattern.toLowerCase())
        )
    )?.[0] || 'DEFAULT';
};

// Main prompt generation function
export async function generatePrompt(userMessage, context = {}) {
    const promptType = detectPromptType(userMessage);
    const config = PROMPT_TYPES[promptType];
    
    // Handle web search requests with general knowledge
    if (promptType === 'WEB_SEARCH') {
        return config.template(userMessage);
    }
    
    // Handle transaction analysis if needed
    if (promptType === 'TRANSACTION_ANALYSIS') {
        try {
            const summaryRes = await fetch('/api/nessie/summaries');
            const summaryData = await summaryRes.json();
            return config.template(userMessage, summaryData);
        } catch (error) {
            console.error('Transaction analysis error:', error);
            return PROMPT_TYPES.DEFAULT.template(userMessage);
        }
    }
    
    return config.template(userMessage);
}

// Format the AI response
export function formatAIResponse(response) {
    return formatResponse(response)
        .replace(/\*\*/g, '')
        .replace(/\#/g, '')
        .replace(/\[|\]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n\n')
        .replace(/\n{3,}/g, '\n\n');
} 