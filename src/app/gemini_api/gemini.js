const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

async function runChatbot() {
    console.log("💰 Starting Financial Advisor Chatbot...");
    
    const genAI = new GoogleGenerativeAI("AIzaSyATmuXaJXnZQRiaQOy5PQiUHQDDhw1xsx0");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Initialize chat with financial context
    const chat = model.startChat({
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

    console.log("\n💼 Bot: I'm your financial literacy assistant, specializing in personal finance, investing, financial planning, business finance, and cryptocurrency. How can I help you make better financial decisions? (Type 'exit' to end the chat or 'topics' to see available topics)");

    // Function to handle chat interaction
    const askQuestion = () => {
        rl.question('\n💭 You: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                console.log('\n💼 Bot: Thank you for consulting with me! Remember, always do your own research before making financial decisions. Goodbye!');
                rl.close();
                return;
            }

            if (userInput.toLowerCase() === 'topics') {
                console.log('\n📊 Available Financial Topics:');
                Object.entries(allowedTopics).forEach(([topic, keywords]) => {
                    const formattedTopic = topic.replace('_', ' ').split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    console.log(`- ${formattedTopic}`);
                });
                askQuestion();
                return;
            }

            try {
                if (!isRelevantTopic(userInput)) {
                    console.log('\n⚠️ Bot: I apologize, but I can only provide information about financial topics such as investing, personal finance, financial planning, business finance, and cryptocurrency. Could you please ask something related to these areas? Type \'topics\' to see available topics.');
                    askQuestion();
                    return;
                }

                const result = await chat.sendMessage(userInput);
                console.log('\n💼 Bot:', result.response.text());
                askQuestion(); // Continue the conversation
            } catch (error) {
                console.error('\n❌ Error:', error.message);
                askQuestion(); // Continue despite error
            }
        });
    };

    // Start the conversation
    askQuestion();
}

// Handle readline close
rl.on('close', () => {
    process.exit(0);
});

// Start the chatbot
runChatbot();