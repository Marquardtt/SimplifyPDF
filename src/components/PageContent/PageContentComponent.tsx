"use client"

import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CardComponent } from "./components/PDFCard";
import { motion, Variants } from "framer-motion";
import 'primeicons/primeicons.css';

interface FileP {
    url: string;
    name: string;
    size: number;
    type: string;
    lastModified: number;
    webkitRelativePath: string;
    slice: (start?: number, end?: number, contentType?: string) => Blob;
    stream: () => ReadableStream<Uint8Array>;
    text: () => Promise<string>;
    arrayBuffer: () => Promise<ArrayBuffer>;
}

export function PageContentComponent() {
    const [files, setFiles] = useState([] as FileP[]);
    const [removeFiles, setRemoveFiles] = useState(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files) as FileP[];
            pdfLink(selectedFiles);
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

        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf") as FileP[];
        if (droppedFiles.length > 0) {
            pdfLink(droppedFiles);
            setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
        }
    };

    const pdfLink = (files: FileP[]) => {
        for (const file of files) {
            const url = URL.createObjectURL(new Blob([file], { type: "application/pdf" }));
            file.url = url;
        }
    }

    const enumerateFiles = async (files: FileP[]) => {
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

    const mergePDFs = async (pdfFiles: FileP[]) => {
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
        console.log(files[0].url);
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

    const removeFile = (index: number) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-10 pt-24 pb-10">
            <div
                className="border-2 border-dashed w-[100vh] h-[30vh] rounded-md"
                onDrop={dragDropFile}
                onDragOver={dragOverFile}
            >
                <label className="flex justify-center items-center w-[100vh] h-[30vh] dark:text-white opacity-50 text-xl font-bold" htmlFor="arquivos">
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
            <div className="flex gap-10 text-sm">
                <motion.div
                    whileTap={{ scale: 1.0 }}
                    whileHover={{ scale: 1.1 }}
                    className=" dark:bg-black bg-primary w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-white font-bold" onClick={handleMerge}>
                    <span className="text-center">Agrupar PDFs</span>
                </motion.div>
                <motion.div
                    whileTap={{ scale: 1.0 }}
                    whileHover={{ scale: 1.1 }}
                    className=" dark:bg-black bg-primary w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-white font-bold" onClick={handleEnumerate}>
                    <span className="text-center">Enumerar PDFs</span>
                </motion.div>
            </div>

            <DndProvider backend={HTML5Backend}>
                <div>
                    <div>
                        <motion.div
                            onClick={() => setFiles([])}
                            initial={false}
                            onMouseOver={() => setRemoveFiles(true)}
                            onMouseLeave={() => setRemoveFiles(false)}
                            whileHover={{ width: "12rem" }}
                            className={`w-[2rem] h-[2rem] bg-primary rounded-full flex items-center  cursor-pointer ${!removeFiles ? "justify-center" : "px-2"}`}
                        >
                            <div className="text-nowrap text-white text-sm flex justify-center items-center gap-2">
                                <i className="pi pi-eraser" style={{ color: "white" }}></i>
                                {removeFiles ? <span>Remover todos arquivos</span> : ""}
                            </div>

                        </motion.div>
                    </div>
                    <div className="w-[100vh] min-h-[20vh] border-2 px-4 py-4 rounded-md flex items-center justify-center">
                        {files.length === 0 ? (
                            <span className="dark:text-white opacity-50 text-xl font-bold">Nenhum arquivo selecionado :(</span>
                        ) : (
                            <div className="grid grid-cols-9 gap-4">
                                <div>
                                    {files.map((file, index) => (
                                        <CardComponent
                                            key={file.url}
                                            index={index}
                                            file={file}
                                            moveFile={() => { }}
                                            removeFile={() => { }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </DndProvider>
        </div>
    );
}