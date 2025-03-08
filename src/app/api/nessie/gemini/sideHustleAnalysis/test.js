// Test script for side hustle analysis
async function testSideHustleAnalysis(sideHustle) {
  try {
    console.log(`\nTesting analysis for side hustle: ${sideHustle}`);
    console.log('----------------------------------------');

    // Make the request
    console.log('Making API request...');
    const response = await fetch(`http://localhost:3000/api/nessie/gemini/sideHustleAnalysis?sideHustle=${sideHustle}`);
    
    // Log response status
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();

    // Check if we got an error response
    if (data.error) {
      console.error('API Error:', data.error);
      if (data.details) {
        console.error('Error details:', data.details);
      }
      return;
    }

    // Log specific sections only if we have valid data
    if (data.financialMetrics) {
      console.log('\nFinancial Metrics:');
      console.log('----------------------------------------');
      console.log(`Total Earnings: $${data.financialMetrics.totalEarnings}`);
      console.log(`Total Expenses: $${data.financialMetrics.totalExpenses}`);
      console.log(`Net Income: $${data.financialMetrics.netIncome}`);
      console.log(`Total Transactions: ${data.financialMetrics.transactionCount}`);
      console.log(`Deposits Count: ${data.financialMetrics.depositsCount}`);
      console.log(`Withdrawals Count: ${data.financialMetrics.withdrawalsCount}`);
    }

    if (data.timingAnalysis) {
      console.log('\nTiming Analysis:');
      console.log('----------------------------------------');
      
      // Show active hours (only non-zero values)
      const activeHours = data.timingAnalysis.hourlyActivity
        .map((count, hour) => ({ hour, count }))
        .filter(({ count }) => count > 0);
      
      if (activeHours.length > 0) {
        console.log('Active Hours:');
        activeHours.forEach(({ hour, count }) => {
          console.log(`  ${hour.toString().padStart(2, '0')}:00 - ${count} transactions`);
        });
      } else {
        console.log('No active hours recorded');
      }

      // Show daily activity (only non-zero values)
      const activeDays = Object.entries(data.timingAnalysis.dailyActivity)
        .filter(([_, count]) => count > 0);
      
      if (activeDays.length > 0) {
        console.log('\nDaily Activity:');
        activeDays.forEach(([day, count]) => {
          console.log(`  ${day.padEnd(9)}: ${count} transactions`);
        });
      } else {
        console.log('No daily activity recorded');
      }
    }

    if (data.aiAnalysis) {
      console.log('\nAI Analysis:');
      console.log('----------------------------------------');
      console.log(data.aiAnalysis);
    }

    // Log metadata
    if (data.metadata) {
      console.log('\nMetadata:');
      console.log('----------------------------------------');
      console.log('Timestamp:', data.metadata.timestamp);
      console.log('Data Sources:', JSON.stringify(data.metadata.dataSource, null, 2));
    }

  } catch (error) {
    console.error('Error testing side hustle analysis:');
    console.error('Message:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    console.error('Stack trace:', error.stack);
  }
}

// Test different side hustles
const sideHustles = ['Uber', 'Pokemon', 'DoorDash'];

// Run tests sequentially to avoid race conditions
async function runTests() {
  console.log('Starting tests...');
  console.log('Make sure your Next.js development server is running on http://localhost:3000');
  
  for (const hustle of sideHustles) {
    await testSideHustleAnalysis(hustle);
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
}); 