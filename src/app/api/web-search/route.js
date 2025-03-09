import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        // Using Google Custom Search API
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
        
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`
        );

        const data = await response.json();

        // Format the results
        const results = data.items?.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            source: item.displayLink
        })) || [];

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
} 