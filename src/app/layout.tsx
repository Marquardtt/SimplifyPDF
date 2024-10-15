import { PageContent } from "@/contexts/PageContentContext";
import "@/style/global.css"
import React, { ReactNode } from "react"

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (

        <html>
            <head>
                <link rel="shortcut icon" href="logo.ico" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
                <title>SimplifyPDF</title>
            </head>
            <body>
                <PageContent>
                    {children}
                </PageContent>
            </body>
        </html>

    )
}