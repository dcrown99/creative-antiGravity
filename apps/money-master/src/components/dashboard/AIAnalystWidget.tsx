"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "@repo/ui";
import { fetchLatestAnalysisAction, triggerAnalysisAction } from "@/lib/actions";
import { AnalysisLog } from "@/types";
import { Play, Pause, ExternalLink, Bot, RefreshCw, Sparkles } from "lucide-react";

export function AIAnalystWidget() {
  const [data, setData] = useState<AnalysisLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLatestAnalysisAction();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await triggerAnalysisAction();
      if (res.success && res.data) {
        // Reload data to get the saved log with correct ID and format
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePlay = () => {
    if (!data) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // 読み上げ設定
    const textToRead = data.script || data.summary;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // アンマウント時に音声停止
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Card className="h-full animate-pulse">
        <CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader>
        <CardContent><div className="h-24 bg-muted rounded"></div></CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
          <Bot className="w-10 h-10 mb-2 opacity-20" />
          <p>最新の分析データがありません</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={loadData} size="sm">再読み込み</Button>
            <Button onClick={handleAnalyze} disabled={analyzing} size="sm" className="gap-2">
              {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              分析を実行
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-l-4 border-l-indigo-500 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Bot className="w-5 h-5" />
            AI マーケット分析
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs bg-background/50">
              {formatDate(data.date)}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleAnalyze}
              disabled={analyzing}
              title="再分析"
            >
              <RefreshCw className={`w-3 h-3 ${analyzing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription className="font-medium text-foreground/80 mt-1">
          {data.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2">
          {data.summary}
        </div>

        <div className="flex flex-col gap-3">
          {/* ソースリンク */}
          {data.sources && data.sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.sources.map((src, i) => (
                <a key={i} href={src.link} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-secondary/50 hover:bg-secondary px-2 py-1 rounded-full flex items-center gap-1 transition-colors border">
                  <ExternalLink className="w-3 h-3" />
                  {src.title.length > 15 ? src.title.substring(0, 15) + '...' : src.title}
                </a>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="gap-2 text-xs"
            >
              {analyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              最新分析
            </Button>

            <Button
              onClick={handlePlay}
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
              className="gap-2 shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "停止" : "再生"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
