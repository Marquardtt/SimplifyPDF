"use client"

import { FooterComponent } from "@/components/Footer";
import { FilesContext } from "@/contexts/FilesContext";
import { PageContent } from "@/contexts/PageContentContext";
import { FileP } from "@/models";
import "@/style/global.css"
import React, { ReactNode, useState } from "react"
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const [files, setFiles] = useState<FileP[]>([]);

    return (

        <html>
            <head>
                <link rel="shortcut icon" href="logo.ico" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
                <title>SimplifyPDF</title>
            </head>
            <body>
                <FilesContext.Provider value={{ files, setFiles }}>
                    <DndProvider backend={HTML5Backend}>
                        <PageContent>
                            {children}
                        </PageContent>
                    </DndProvider>
                </FilesContext.Provider>
            </body>
        </html >

    )
}