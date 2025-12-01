import { TouchEvent, useState } from 'react';

interface SwipeInput {
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    threshold?: number; // 繧ｹ繝ｯ繧､繝励→縺ｿ縺ｪ縺呎怙蟆剰ｷ晞屬 (px)
}

interface SwipeHandlers {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeInput): SwipeHandlers {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // 繧ｹ繝ｯ繧､繝怜愛螳壻ｸｭ縺ｯ繧ｯ繝ｪ繝・け(繧ｿ繝・・)繧､繝吶Φ繝医ｒ辟｡蜉ｹ蛹悶☆繧九◆繧√・繝輔Λ繧ｰ邂｡逅・↑縺ｩ縺ｫ菴ｿ縺医ｋ縺後・
    // 莉雁屓縺ｯ繧ｷ繝ｳ繝励Ν縺ｫ霍晞屬蛻､螳壹・縺ｿ陦後≧縲・

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > threshold;
        const isRightSwipe = distance < -threshold;

        if (isLeftSwipe) {
            onSwipeLeft();
        } else if (isRightSwipe) {
            onSwipeRight();
        }

        // Reset logic is handled by setting state to null on next start
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    };
}
