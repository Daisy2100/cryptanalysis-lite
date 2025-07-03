import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "primereact/resources/themes/lara-dark-teal/theme.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import { Providers } from "./providers";
import AppMenu from "@/components/AppMenu";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "密碼強度檢查器",
    description: "一個檢查密碼強度並查詢是否在資料外洩中洩漏的工具",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
            >
                <Providers>
                    <AppMenu />
                    <div className="flex-grow overflow-auto">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
