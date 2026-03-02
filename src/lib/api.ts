import { BackgroundLevel, ExaPaper, LessonData } from './types';

export async function parsePdfFromFile(file: File): Promise<{ text: string; title: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to parse PDF' }));
    throw new Error(err.error || 'Failed to parse PDF');
  }

  return res.json();
}

export async function parsePdfFromUrl(url: string): Promise<{ text: string; title: string }> {
  const res = await fetch('/api/parse-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to parse PDF' }));
    throw new Error(err.error || 'Failed to parse PDF');
  }

  return res.json();
}

export async function generateLesson(
  paperText: string,
  level: BackgroundLevel
): Promise<LessonData> {
  const res = await fetch('/api/generate-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperText, level }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to generate lesson' }));
    throw new Error(err.error || 'Failed to generate lesson');
  }

  return res.json();
}

export async function searchRelatedPapers(query: string): Promise<ExaPaper[]> {
  const res = await fetch('/api/search-papers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to search papers' }));
    throw new Error(err.error || 'Failed to search papers');
  }

  const data = await res.json();
  return data.papers;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithPaper(
  message: string,
  paperText: string,
  history: ChatMessage[]
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, paperText, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Chat failed' }));
    throw new Error(err.error || 'Chat failed');
  }

  const data = await res.json();
  return data.reply;
}
