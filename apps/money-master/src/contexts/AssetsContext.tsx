"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Portfolio } from "@/types";
import { getPortfolio, updateAssetJson, deleteAsset as deleteAssetAction } from "@/lib/actions";

interface AssetsContextType {
    assets: Portfolio;
    setAssets: (assets: Portfolio) => void;
    refreshAssets: () => Promise<void>;
    updateAsset: (id: string, data: any) => Promise<void>; // Using any for now to avoid import issues, ideally Asset
    deleteAsset: (id: string) => Promise<void>;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({
    children,
    initialData,
}: {
    children: React.ReactNode;
    initialData: Portfolio;
}) {
    const [assets, setAssets] = useState<Portfolio>(initialData);

    const refreshAssets = useCallback(async () => {
        try {
            const data = await getPortfolio();
            setAssets(data);
        } catch (error) {
            console.error("Failed to refresh assets:", error);
        }
    }, []);

    const updateAsset = useCallback(async (id: string, data: any) => {
        try {
            await updateAssetJson(id, data);
            await refreshAssets();
        } catch (error) {
            console.error("Failed to update asset:", error);
        }
    }, [refreshAssets]);

    const deleteAsset = useCallback(async (id: string) => {
        try {
            await deleteAssetAction(id);
            await refreshAssets();
        } catch (error) {
            console.error("Failed to delete asset:", error);
        }
    }, [refreshAssets]);

    return (
        <AssetsContext.Provider value={{ assets, setAssets, refreshAssets, updateAsset, deleteAsset }}>
            {children}
        </AssetsContext.Provider>
    );
}

export function useAssetsContext() {
    const context = useContext(AssetsContext);
    if (context === undefined) {
        throw new Error("useAssetsContext must be used within an AssetsProvider");
    }
    return context;
}
