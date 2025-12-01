"use client";

import { useAssetsContext } from "@/contexts/AssetsContext";

export function useAssets() {
    return useAssetsContext();
}
