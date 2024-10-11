"use client"

import React, { useEffect, useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AnimatePresence, motion } from "framer-motion";
import { CardComponent } from "./components/PDFCard";
import 'primeicons/primeicons.css';
import { PDFEditComponent } from "./components/PDFEdit";

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
    const [selectedFile, setSelectedFile] = useState<number | null>(null)
    const [removeFiles, setRemoveFiles] = useState(false);
    const [pageNumber, setPageNumber] = useState<number>(0);

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

    useEffect(() => {
        const pageNumber = async (index: number) => {
            const arrayBuffer = await files[index].arrayBuffer();
            const pdfdoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfdoc.getPages();
            setPageNumber(pages.length);
        }
        if (selectedFile !== null) {
            pageNumber(selectedFile);
        }
    }, [selectedFile])


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
                className="border-2 border-dashed w-[100vh] h-[30vh] rounded-md hover:bg-gray-100 dark:bg-opacity-30 duration-300"
                onDrop={dragDropFile}
                onDragOver={dragOverFile}
            >
                <label className="flex justify-center items-center w-[100vh] h-[30vh] dark:text-white dark:opacity-100 opacity-50 text-xl font-bold" htmlFor="arquivos">
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
                <div className="flex flex-col items-end gap-2">
                    <div className="h-[2rem]">
                        {files.length > 0 && (
                            <motion.div
                                onClick={() => { setFiles([]), setRemoveFiles(false) }}
                                animate={{ width: removeFiles ? "13rem" : "2rem" }}
                                onMouseOver={() => setRemoveFiles(true)}
                                onMouseLeave={() => setRemoveFiles(false)}
                                transition={{ type: "spring", duration: 0.3, ease: "easeInOut" }}
                                style={{ transformOrigin: "left" }}
                                className={`h-[2rem] dark:bg-black bg-primary rounded-full flex items-center cursor-pointer ${!removeFiles ? "justify-center" : "px-2"}`}
                            >
                                <div className="overflow-hidden text-nowrap text-white text-sm flex justify-center items-center gap-2">
                                    <i className="  pi pi-eraser" style={{ color: "white" }}></i>
                                    {removeFiles ? <span>Remover todos arquivos</span> : ""}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div
                        className="w-[100vh] min-h-[20vh] border-2 px-4 py-4 rounded-md flex items-center justify-center ">
                        {files.length === 0 ? (
                            <span className="dark:text-white opacity-50 dark:opacity-100 text-xl font-bold">Nenhum arquivo selecionado :(</span>
                        ) : (
                            <motion.div className="grid grid-cols-9 gap-4">
                                {files.map((file, index) => (
                                    <div key={file.url} onClick={() => setSelectedFile(index)}>
                                        <CardComponent
                                            key={file.url}
                                            index={index}
                                            file={file}
                                            moveFile={moveFile}
                                            removeFile={removeFile}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </DndProvider>
            <AnimatePresence>
                {selectedFile !== null && pageNumber && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="w-[40vw] h-[40vw] bg-white rounded-md flex flex-col items-center gap-4 p-4">
                            <div className="flex justify-end w-full">
                                <i className="pi pi-times cursor-pointer" onClick={() => setSelectedFile(null)}></i>
                            </div>
                            <PDFEditComponent file={files[selectedFile]} pageNumber={pageNumber}></PDFEditComponent>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


{/* <div className="flex justify-center items-center">
                                        <i className="pi pi-pencil" style={{ color: "black" }}></i>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <i className="pi pi-eraser" style={{ color: "black" }}></i>
                                    </div> */}