import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

import { ThemeProvider } from "@repo/ui";
import { AssetsProvider } from "@/contexts/AssetsContext";
import { getPortfolio } from "@/lib/actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Money Master",
    description: "シンプルで使いやすい家計簿アプリ",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let initialData;
    try {
        initialData = await getPortfolio();
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        initialData = { assets: [], dividends: [] };
    }

    return (
        <html lang="ja" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AssetsProvider initialData={initialData}>
                        <div className="flex min-h-screen">
                            <Sidebar />
                            <main className="flex-1 p-8 pt-16 md:pt-8">
                                {children}
                            </main>
                        </div>
                        {/* <Toaster /> */}
                    </AssetsProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
