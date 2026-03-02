import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

const MAX_TEXT_LENGTH = 50000;

function extractTitle(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed.length > 10 && trimmed.length < 200) {
      return trimmed;
    }
  }
  return 'Untitled Paper';
}

async function extractTextFromBuffer(buffer: ArrayBuffer): Promise<{ text: string; title: string }> {
  const pdf = new PDFParse({ data: new Uint8Array(buffer) });

  let title = 'Untitled Paper';
  try {
    const info = await pdf.getInfo();
    if (info.info?.Title) {
      title = info.info.Title;
    }
  } catch {
    // Info extraction can fail, that's OK
  }

  const textResult = await pdf.getText();
  const fullText = textResult.text.slice(0, MAX_TEXT_LENGTH);

  if (title === 'Untitled Paper') {
    title = extractTitle(fullText);
  }

  await pdf.destroy();
  return { text: fullText, title };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { url } = body;

      if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
      }

      // Convert paper URLs to PDF URLs
      let pdfUrl = url;
      if (url.includes('arxiv.org/abs/')) {
        pdfUrl = url.replace('arxiv.org/abs/', 'arxiv.org/pdf/');
      }
      if (!pdfUrl.endsWith('.pdf') && pdfUrl.includes('arxiv.org/pdf/')) {
        pdfUrl = pdfUrl + '.pdf';
      }
      // OpenReview: convert forum page to PDF download
      if (url.includes('openreview.net/forum')) {
        pdfUrl = url.replace('openreview.net/forum', 'openreview.net/pdf');
      }

      const response = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PaperToPlayground/1.0)',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch PDF: ${response.statusText}` },
          { status: 400 }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const result = await extractTextFromBuffer(arrayBuffer);
      return NextResponse.json(result);

    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const result = await extractTextFromBuffer(arrayBuffer);
      return NextResponse.json(result);

    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please try a different file.' },
      { status: 500 }
    );
  }
}
