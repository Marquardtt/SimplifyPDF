"use client"

import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CardComponent } from "./components";
import { motion } from "framer-motion";

export function PageContentComponent() {
    const [files, setFiles] = useState([] as File[]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
        }
    };

    const dragOverFile = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const dragDropFile = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf");
        if (droppedFiles.length > 0) {
            setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
        }
    };

    const enumerateFiles = async (files: File[]) => {
        const mergedPdf = await PDFDocument.create();
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await mergedPdf.embedFont(StandardFonts.Helvetica);
            const pages = pdf.getPages();
            const pageCount = pages.length;

            for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
                const copiedPage = await mergedPdf.copyPages(pdf, [pageIndex]);
                mergedPdf.addPage(copiedPage[0]);

                const copiedPageWidth = copiedPage[0].getWidth();
                const pageNumberText = mergedPdf.getPageCount();
                copiedPage[0].setFont(helveticaFont);
                copiedPage[0].drawText(pageNumberText.toString(), {
                    x: copiedPageWidth - 30,
                    y: 15,
                    size: 12,
                });
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url);
    };

    const mergePDFs = async (pdfFiles: File[]) => {
        const mergedPdf = await PDFDocument.create();

        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url);
    };

    const moveFile = (dragIndex: number, hoverIndex: number) => {
        const updatedFiles = [...files];
        const [draggedFile] = updatedFiles.splice(dragIndex, 1);
        updatedFiles.splice(hoverIndex, 0, draggedFile);
        setFiles(updatedFiles);
    };

    const handleMerge = async () => {
        if (files.length > 0) {
            mergePDFs(files);
        }
    };

    const handleEnumerate = async () => {
        if (files.length > 0) {
            enumerateFiles(files);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-10 pt-24 pb-10">
            <div
                className="border-2 w-[100vh] h-[30vh] rounded-md"
                onDrop={dragDropFile}
                onDragOver={dragOverFile}
            >
                <label className="flex justify-center items-center w-[100vh] h-[30vh] dark:text-white" htmlFor="arquivos">
                    Arraste os arquivos até aqui ou clique para selecionar
                </label>
                <input
                    id="arquivos"
                    className="hidden"
                    accept=".pdf"
                    multiple={true}
                    type="file"
                    onChange={handleFile}
                />
            </div>

            <DndProvider backend={HTML5Backend}>
                <div className="cursor-pointer w-[100vh] grid grid-cols-9 gap-4">
                    {files.map((file, index) => (
                        <CardComponent key={index} index={index} file={file} moveFile={moveFile} />
                    ))}
                </div>
            </DndProvider>

            <div className="flex gap-10 text-sm">
                <motion.div
                    whileTap={{ scale: 1.0 }}
                    whileHover={{ scale: 1.1 }}
                    className=" dark:bg-black bg-primary w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-white" onClick={handleMerge}>
                    <span className="text-center">Agrupar PDFs</span>
                </motion.div>
                <motion.div
                    whileTap={{ scale: 1.0 }}
                    whileHover={{ scale: 1.1 }}
                    className=" dark:bg-black bg-primary w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-white" onClick={handleEnumerate}>
                    <span className="text-center">Enumerar PDFs</span>
                </motion.div>
            </div>
        </div>
    );
}