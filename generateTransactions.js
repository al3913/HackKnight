const sideHustles = [
  { 
    name: 'Uber', 
    minAmount: 15, 
    maxAmount: 50, 
    expenses: ['Gas', 'Car Maintenance', 'Phone Bill'],
    largeExpenses: [
      { description: 'Annual Car Insurance', amount: 800 },
      { description: 'Major Car Repair', amount: 1200 },
      { description: 'New Tires', amount: 600 }
    ]
  },
  { 
    name: 'Etsy', 
    minAmount: 20, 
    maxAmount: 200, 
    expenses: ['Supplies', 'Shipping', 'Marketing'],
    largeExpenses: [
      { description: 'Bulk Materials Purchase', amount: 900 },
      { description: 'New Equipment', amount: 1500 },
      { description: 'Trade Show Registration', amount: 750 }
    ]
  }
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getExpenseAmount(sideHustle) {
  // Expenses are typically 30-70% of the minimum income
  const minExpense = Math.floor(sideHustle.minAmount * 0.3);
  const maxExpense = Math.floor(sideHustle.minAmount * 0.7);
  return randomAmount(minExpense, maxExpense);
}

async function postTransaction(type, data) {
  try {
    const response = await fetch(`http://localhost:3000/api/nessie/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`${type} created:`, result);
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
  }
}

async function generateLargeExpenses(sideHustle, startDate, endDate) {
  // Pick 1-2 large expenses for each side hustle
  const numLargeExpenses = 1 + Math.floor(Math.random() * 2);
  const selectedExpenses = [...sideHustle.largeExpenses]
    .sort(() => 0.5 - Math.random())
    .slice(0, numLargeExpenses);

  for (const expense of selectedExpenses) {
    const date = randomDate(startDate, endDate);
    
    await postTransaction('withdrawals', {
      amount: expense.amount,
      description: `${sideHustle.name} - ${expense.description}`,
      transaction_date: date.toISOString()
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function generateTransactions() {
  const startDate = new Date('2025-02-08');
  const endDate = new Date('2025-03-08');
  
  // Generate deposits and corresponding expenses for each side hustle
  for (const sideHustle of sideHustles) {
    // Generate large sporadic expenses first
    await generateLargeExpenses(sideHustle, startDate, endDate);
    
    // Generate 12-13 deposits for each side hustle (roughly 25 total)
    const numDeposits = 12 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numDeposits; i++) {
      const amount = randomAmount(sideHustle.minAmount, sideHustle.maxAmount);
      const date = randomDate(startDate, endDate);
      
      // Create deposit
      await postTransaction('deposits', {
        amount,
        description: `${sideHustle.name} Income`,
        transaction_date: date.toISOString()
      });
      
      // Create 1-2 corresponding expenses
      const numExpenses = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < numExpenses; j++) {
        const expense = sideHustle.expenses[Math.floor(Math.random() * sideHustle.expenses.length)];
        const expenseAmount = getExpenseAmount(sideHustle);
        const expenseDate = randomDate(date, new Date(date.getTime() + 24 * 60 * 60 * 1000)); // Within 24 hours of income
        
        await postTransaction('withdrawals', {
          amount: expenseAmount,
          description: `${sideHustle.name} - ${expense}`,
          transaction_date: expenseDate.toISOString()
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('Done generating transactions!');
}

generateTransactions().then(() => console.log('All transactions completed!')); 