import { NextRequest, NextResponse } from 'next/server';
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const result = await exa.search(query, {
      type: 'auto',
      category: 'research paper',
      numResults: 6,
      includeDomains: ['arxiv.org', 'openreview.net'],
      contents: {
        highlights: {
          maxCharacters: 4000,
        },
      },
    });

    const papers = result.results.map((r) => ({
      title: r.title || 'Untitled',
      url: r.url,
      summary: r.highlights?.join(' ') || '',
      publishedDate: r.publishedDate || null,
      author: r.author || null,
    }));

    return NextResponse.json({ papers });
  } catch (error) {
    console.error('Exa search error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to search papers: ${message}` },
      { status: 500 }
    );
  }
}
