import "@/style/global.css"
import React from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-br" className="w-screen h-screen ">
            {children}
        </html>
    )
}