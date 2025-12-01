import { useState, useEffect, useCallback } from 'react';

// 蝙句ｮ夂ｾｩ
export type ReadingDirection = 'ltr' | 'rtl'; // ltr: 蟾ｦ髢九″(蟆剰ｪｬ遲・, rtl: 蜿ｳ髢九″(貍ｫ逕ｻ)
export type ViewMode = 'single' | 'spread';   // single: 1繝壹・繧ｸ, spread: 隕矩幕縺・

interface ReadingProgress {
  lastReadIndex: number;
  totalLength: number;
  updatedAt: number;
}

interface ViewerSettings {
  direction: ReadingDirection;
  viewMode: ViewMode;
  fitMode: 'contain' | 'cover'; // contain: 蜈ｨ菴楢｡ｨ遉ｺ, cover: 逕ｻ髱｢荳譚ｯ(蛻・ｊ謚懊″縺ゅｊ)
}

const STORAGE_KEY_PREFIX = 'my-kindle-progress-';
const SETTINGS_KEY = 'my-kindle-settings';

export function useReadingState(bookId: string) {
  // --- 險ｭ螳・(Settings) ---
  const [settings, setSettings] = useState<ViewerSettings>({
    direction: 'rtl', // 繝・ヵ繧ｩ繝ｫ繝医・貍ｫ逕ｻ繝｢繝ｼ繝会ｼ亥承髢九″・・
    viewMode: 'single', // 繝・ヵ繧ｩ繝ｫ繝医・蜊倥・繝ｼ繧ｸ・医Δ繝舌う繝ｫ閠・・縲￣C縺ｪ繧鋭pread謗ｨ螂ｨ縺縺御ｸ譌ｦsingle・・
    fitMode: 'contain', // 繝・ヵ繧ｩ繝ｫ繝医・縲悟・菴薙ｒ陦ｨ遉ｺ縲・
  });

  // --- 騾ｲ謐・(Progress) ---
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 蛻晄悄繝ｭ繝ｼ繝会ｼ夊ｨｭ螳壹→騾ｲ謐励ｒ蠕ｩ蜈・
  useEffect(() => {
    try {
      // 險ｭ螳壹・隱ｭ縺ｿ霎ｼ縺ｿ
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) }); // 譌｢蟄倩ｨｭ螳・+ 譁ｰ隕城・岼縺ｮ繝槭・繧ｸ
      } else {
        // 蛻晏屓縺ｧPC/繧ｿ繝悶Ξ繝・ヨ縺ｮ繧医≧縺ｪ讓ｪ髟ｷ逕ｻ髱｢縺ｪ繧芽ｦ矩幕縺阪ｒ繝・ヵ繧ｩ繝ｫ繝医↓縺吶ｋ蛻､螳壹ｒ蜈･繧後※繧り憶縺・
        if (typeof window !== 'undefined' && window.innerWidth > window.innerHeight) {
          setSettings(prev => ({ ...prev, viewMode: 'spread' }));
        }
      }

      // 騾ｲ謐励・隱ｭ縺ｿ霎ｼ縺ｿ
      const savedProgress = localStorage.getItem(`${STORAGE_KEY_PREFIX}${bookId}`);
      if (savedProgress) {
        const progress: ReadingProgress = JSON.parse(savedProgress);
        setCurrentIndex(progress.lastReadIndex);
      }
    } catch (e) {
      console.error('Failed to load reading state', e);
    } finally {
      setIsLoaded(true);
    }
  }, [bookId]);

  // 騾ｲ謐励・菫晏ｭ・
  const saveProgress = useCallback((index: number, total: number) => {
    setCurrentIndex(index);
    try {
      const progress: ReadingProgress = {
        lastReadIndex: index,
        totalLength: total,
        updatedAt: Date.now(),
      };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${bookId}`, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }, [bookId]);

  // 險ｭ螳壹・菫晏ｭ・
  const saveSettings = useCallback((newSettings: Partial<ViewerSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    currentIndex,
    settings,
    isLoaded,
    saveProgress,
    saveSettings,
  };
}
