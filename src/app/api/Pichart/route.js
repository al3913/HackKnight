export async function GET() {
  const apiKey = process.env.NESSIE_API_KEY;
  const accountId = process.env.ACCOUNT_ID;
  
  try {
    const url = `http://api.nessieisreal.com/accounts/${accountId}/deposits?key=${apiKey}`;
    console.log('Requesting URL:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error('API Response not OK:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch deposits data', 
          status: response.status,
          url: url 
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    console.log('Raw deposits:', data);

    // Process the data to calculate totals by description
    const totals = {};
    let grandTotal = 0;

    // Calculate totals for each description
    data.forEach(deposit => {
      const description = deposit.description;
      const amount = deposit.amount;
      totals[description] = (totals[description] || 0) + amount;
      grandTotal += amount;
    });

    // Calculate percentages and format for pie chart
    const pieChartData = Object.entries(totals).map(([description, amount]) => ({
      description,
      amount,
      percentage: ((amount / grandTotal) * 100).toFixed(2),
    }));

    // Sort by amount in descending order
    pieChartData.sort((a, b) => b.amount - a.amount);

    const processedData = {
      rawData: data,
      pieChartData: pieChartData,
      summary: {
        totalAmount: grandTotal,
        categoryCount: Object.keys(totals).length,
      }
    };

    console.log('Processed data:', processedData);

    return new Response(JSON.stringify(processedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing deposits data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 