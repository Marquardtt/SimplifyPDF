import "@/style/global.css"
import React from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (

        <html>
            <head>
                <link rel="shortcut icon" href="logo.ico" />
                <title>SimplifyPDF</title>
            </head>
            {children}
        </html>

    )
}