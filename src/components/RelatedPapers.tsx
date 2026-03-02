'use client';

import { useState } from 'react';
import { RelatedPaper, ExaPaper } from '@/lib/types';
import { searchRelatedPapers } from '@/lib/api';
import { BookOpen, ArrowUpRight, Search, Loader2 } from 'lucide-react';

interface RelatedPapersProps {
  papers: RelatedPaper[];
  paperTitle: string;
}

function getAppUrl(paperUrl: string): string {
  return `/?url=${encodeURIComponent(paperUrl)}`;
}

export default function RelatedPapers({ papers, paperTitle }: RelatedPapersProps) {
  const [exaPapers, setExaPapers] = useState<ExaPaper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleDiscover = async () => {
    try {
      setIsSearching(true);
      setSearchError(null);
      const results = await searchRelatedPapers(paperTitle);
      setExaPapers(results);
      setHasSearched(true);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  if ((!papers || papers.length === 0) && !hasSearched) return null;

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <h2
            className="text-2xl text-text-primary"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            Continue Learning
          </h2>
        </div>

        {!hasSearched && (
          <button
            onClick={handleDiscover}
            disabled={isSearching}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent
              bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isSearching ? 'Searching...' : 'Discover more papers'}
          </button>
        )}
      </div>

      {searchError && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
          <p className="text-sm text-error">{searchError}</p>
        </div>
      )}

      {/* AI-suggested papers */}
      {papers && papers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map((paper, i) => {
            const hasArxiv = paper.arxivId && paper.arxivId !== 'unknown';
            const arxivUrl = hasArxiv ? `https://arxiv.org/abs/${paper.arxivId}` : null;

            return (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 hover:bg-surface-hover
                  transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {arxivUrl ? (
                      <a
                        href={getAppUrl(arxivUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-primary font-medium text-sm hover:text-accent transition-colors
                          inline-flex items-center gap-1.5 group-hover:text-accent"
                      >
                        {paper.title}
                        <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-text-primary font-medium text-sm">
                        {paper.title}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                      {paper.reason}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exa search results */}
      {exaPapers.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-8 mb-4">
            <Search className="w-4 h-4 text-text-secondary" />
            <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Discovered via Exa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exaPapers.map((paper, i) => (
              <a
                key={i}
                href={getAppUrl(paper.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 hover:bg-surface-hover
                  transition-all duration-200 group block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-text-primary font-medium text-sm group-hover:text-accent transition-colors
                      inline-flex items-center gap-1.5">
                      {paper.title}
                      <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                    </p>
                    {paper.summary && (
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-3">
                        {paper.summary}
                      </p>
                    )}
                    {(paper.author || paper.publishedDate) && (
                      <p className="text-xs text-text-tertiary mt-2">
                        {paper.author && <span>{paper.author}</span>}
                        {paper.author && paper.publishedDate && <span> &middot; </span>}
                        {paper.publishedDate && <span>{paper.publishedDate.split('T')[0]}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
