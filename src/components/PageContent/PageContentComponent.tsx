"use client";

import React, { useContext, useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { AnimatePresence, motion } from "framer-motion";
import { CardComponent } from "./components/PDFCard";
import { PDFEditComponent } from "./components/PDFEdit";
import { FileP } from "@/models";
import 'primeicons/primeicons.css';
import { FilesContext } from "@/contexts/FilesContext";

interface PageContentProps {
    func: JSX.Element;
}

export function PageContentComponent({ func }: PageContentProps) {
    const { files, setFiles } = useContext(FilesContext);
    const [selectedFile, setSelectedFile] = useState<number | null>(null);
    const [removeFiles, setRemoveFiles] = useState(false);
    const [pageNumber, setPageNumber] = useState<number>(0);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setFiles && files) {
            if (e.target.files) {
                const selectedFiles = Array.from(e.target.files) as FileP[];
                pdfLink(selectedFiles);
                setFiles([...files, ...selectedFiles]);
            }
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
        if (setFiles && files && droppedFiles.length > 0) {
            pdfLink(droppedFiles);
            setFiles([...files, ...droppedFiles]);
        }
    };

    const pdfLink = (files: FileP[]) => {
        for (const file of files) {
            const url = URL.createObjectURL(new Blob([file], { type: "application/pdf" }));
            file.url = url;
        }
    };

    useEffect(() => {
        const getPageCount = async (index: number) => {
            const arrayBuffer = await files?.[index]?.arrayBuffer();
            if (arrayBuffer) {
                const pdfdoc = await PDFDocument.load(arrayBuffer);
                const pages = pdfdoc.getPages();
                setPageNumber(pages.length);
            }
        };
        if (selectedFile !== null && files) {
            getPageCount(selectedFile);
        }
    }, [selectedFile]);

    const moveFile = (dragIndex: number, hoverIndex: number) => {
        if (files && setFiles) {
            const updatedFiles = [...files];
            const [draggedFile] = updatedFiles.splice(dragIndex, 1);
            updatedFiles.splice(hoverIndex, 0, draggedFile);
            setFiles(updatedFiles);
        }
    };

    const removeFile = (index: number) => {
        if (files && setFiles) {
            const updatedFiles = [...files];
            updatedFiles.splice(index, 1);
            setFiles(updatedFiles);
        }
    };

    useEffect(() => {
        if (setFiles && files) {
            setFiles(files);
        }
    }, [files])

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-10">
            <div
                className=" flex justify-center items-center border-2 border-dashed sm:w-1/2 sm:h-[30vh] sm:mx-6 h-[15vh] mx-6 rounded-md hover:bg-gray-100 dark:bg-opacity-30 duration-300"
                onDrop={dragDropFile}
                onDragOver={dragOverFile}
            >
                <label className="text-center flex justify-center items-center w-11/12 h-full dark:text-white dark:opacity-100 opacity-50 text-xl font-bold" htmlFor="arquivos">
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
                {func}
            </div>

            <div className="flex flex-col justify-center items-center  w-full min-h-[20vh] mx-0 sm:mx-6">
                <div className="flex flex-col justify-center items-end gap-2">
                    <div className=" h-[2rem]">
                        {files && files?.length > 0 && (
                            <motion.div
                                onClick={() => { setFiles?.([]), setRemoveFiles(false); }}
                                animate={{ width: removeFiles ? "13rem" : "2rem" }}
                                onMouseOver={() => setRemoveFiles(true)}
                                onMouseLeave={() => setRemoveFiles(false)}
                                transition={{ type: "spring", duration: 0.3, ease: "easeInOut" }}
                                style={{ transformOrigin: "left" }}
                                className={`h-[2rem] dark:bg-black bg-primary rounded-full flex items-center cursor-pointer ${!removeFiles ? "justify-center" : "px-2"}`}
                            >
                                <div className="overflow-hidden text-nowrap text-white text-sm flex justify-center items-center gap-2">
                                    <i className="pi pi-eraser" style={{ color: "white" }}></i>
                                    {removeFiles ? <span>Remover todos arquivos</span> : ""}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="w-fit h-full border-2 px-4 py-4 rounded-md flex items-center justify-center">
                        {files?.length === 0 ? (
                            <motion.span
                                className="dark:text-white opacity-50 dark:opacity-100 text-xl font-bold"
                                transition={{ duration: 0.5 }}
                            >
                                Nenhum arquivo selecionado :(
                            </motion.span>
                        ) : (
                            <motion.div
                                className="grid lg:grid-cols-9 grid-cols-4 gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {files?.map((file, index) => (
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
            </div>
            <AnimatePresence>
                {files && selectedFile !== null && pageNumber && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <PDFEditComponent file={files?.[selectedFile]} pageNumber={pageNumber} closeModal={() => setSelectedFile(null)}></PDFEditComponent>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
