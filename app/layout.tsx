import React from "react";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentEnv = process.env.VERCEL_ENV || "development";
    return (
        <html className="light" dark-theme="light">
            <head></head>
            <body>{children}</body>
        </html>
    );
}
