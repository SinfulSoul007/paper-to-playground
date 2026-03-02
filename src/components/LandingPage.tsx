'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, ArrowRight, FileText, Sparkles, Layers, Zap } from 'lucide-react';

interface LandingPageProps {
  onPdfUpload: (file: File) => void;
  onArxivSubmit: (url: string) => void;
  isLoading: boolean;
}

const EXAMPLE_PAPERS = [
  { label: 'Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762' },
  { label: 'BERT', url: 'https://arxiv.org/abs/1810.04805' },
  { label: 'Diffusion Models', url: 'https://arxiv.org/abs/2006.11239' },
];

export default function LandingPage({ onPdfUpload, onArxivSubmit, isLoading }: LandingPageProps) {
  const [arxivUrl, setArxivUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePaperUrl = (url: string) => {
    return url.includes('arxiv.org/abs/') || url.includes('arxiv.org/pdf/') || url.includes('openreview.net/forum');
  };

  const handleArxivSubmit = useCallback(() => {
    if (!arxivUrl.trim()) {
      setError('Please enter an arXiv URL');
      return;
    }
    if (!validatePaperUrl(arxivUrl)) {
      setError('Please enter a valid paper URL (arXiv or OpenReview)');
      return;
    }
    setError('');
    onArxivSubmit(arxivUrl.trim());
  }, [arxivUrl, onArxivSubmit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setError('');
      onPdfUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setError('');
      onPdfUpload(file);
    }
  }, [onPdfUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[100px]" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full">
          {/* Hero */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Research Learning
            </div>
            <h1
              className="text-6xl md:text-7xl font-normal mb-6 text-text-primary tracking-tight"
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              Paper to Playground
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Transform any research paper into an interactive lesson in seconds.
            </p>
          </div>

          {/* Input options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* File upload dropzone */}
            <div
              className={`relative group border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 min-h-[220px]
                ${dragActive
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50 hover:bg-surface/50'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className={`p-4 rounded-full transition-colors duration-300 ${
                dragActive ? 'bg-accent/20' : 'bg-surface group-hover:bg-accent/10'
              }`}>
                <Upload className={`w-8 h-8 transition-colors duration-300 ${
                  dragActive ? 'text-accent' : 'text-text-secondary group-hover:text-accent'
                }`} />
              </div>
              <div className="text-center">
                <p className="text-text-primary font-medium mb-1">
                  Upload PDF
                </p>
                <p className="text-sm text-text-secondary">
                  Drag & drop or click to browse
                </p>
              </div>
            </div>

            {/* arXiv URL input */}
            <div className="bg-surface border border-border rounded-xl p-8 flex flex-col justify-center gap-4 min-h-[220px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <span className="text-text-primary font-medium">arXiv Paper</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://arxiv.org/abs/1706.03762"
                  value={arxivUrl}
                  onChange={(e) => {
                    setArxivUrl(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleArxivSubmit();
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50
                    focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button
                  onClick={handleArxivSubmit}
                  disabled={isLoading}
                  className="bg-accent text-background font-semibold rounded-lg px-5 py-3 hover:bg-accent-muted
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Go
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <p className="text-error text-sm">{error}</p>
              )}
            </div>
          </div>

          {/* Example papers */}
          <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-text-secondary mb-3">Try an example:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_PAPERS.map((paper) => (
                <button
                  key={paper.url}
                  onClick={() => {
                    setArxivUrl(paper.url);
                    setError('');
                    onArxivSubmit(paper.url);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary
                    hover:text-accent hover:border-accent/30 hover:bg-surface-hover transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paper.label}
                </button>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2
              className="text-2xl text-center mb-10 text-text-primary"
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              How it works
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
              {[
                { icon: <Upload className="w-6 h-6" />, title: 'Upload Paper', desc: 'Drop a PDF or paste an arXiv link' },
                { icon: <Layers className="w-6 h-6" />, title: 'Set Your Level', desc: 'Choose your background expertise' },
                { icon: <Zap className="w-6 h-6" />, title: 'Learn Interactively', desc: 'Explore an AI-generated lesson' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 md:flex-col md:text-center md:max-w-[200px]">
                  {i > 0 && (
                    <div className="hidden md:block absolute">
                      <ArrowRight className="w-5 h-5 text-text-secondary/30 -ml-9" />
                    </div>
                  )}
                  <div className="relative">
                    <div className="p-3 rounded-xl bg-surface border border-border text-accent">
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{step.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-text-secondary/50">
        Paper to Playground — Built with Claude AI
      </footer>
    </div>
  );
}
