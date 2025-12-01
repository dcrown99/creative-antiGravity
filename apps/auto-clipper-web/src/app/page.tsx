'use client';
import { useState, useEffect } from 'react';
import UrlInput from '@/components/UrlInput';
import JobStatus from '@/components/JobStatus';
import { Clapperboard } from 'lucide-react';

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);

  // Load last job ID on mount
  useEffect(() => {
    const savedJobId = localStorage.getItem('lastJobId');
    if (savedJobId) {
      setJobId(savedJobId);
    }
  }, []);

  // Save job ID when it changes
  useEffect(() => {
    if (jobId) {
      localStorage.setItem('lastJobId', jobId);
    }
  }, [jobId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container max-w-6xl mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <Clapperboard className="w-5 h-5" />
            </div>
            <span>AutoClipper <span className="text-blue-600">Studio</span></span>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {!jobId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Create Viral Shorts in Seconds
              </h1>
              <p className="text-xl text-muted-foreground">
                AIが動画を解析し、最適な瞬間を切り抜いてショート動画を自動生成します。
              </p>
            </div>
            <div className="w-full max-w-xl p-6 bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 border">
              <UrlInput onJobCreated={setJobId} />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <JobStatus jobId={jobId} />

            <div className="mt-12 text-center">
              <button
                onClick={() => {
                  setJobId(null);
                  localStorage.removeItem('lastJobId');
                }}
                className="text-sm text-muted-foreground hover:text-blue-600 transition-colors underline decoration-dotted underline-offset-4"
              >
                ← 新しいプロジェクトを開始する
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
