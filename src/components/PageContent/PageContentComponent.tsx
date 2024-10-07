"use client"

import React, { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRouter } from "next/navigation";
import { CardComponent } from "./components";


export function PageContentComponent() {
    const [files, setFiles] = useState([] as File[]);
    const router = useRouter();

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
        router.push(url);
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

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-10 pt-24 pb-10">
            <div
                className="border-2 w-[100vh] h-[30vh] rounded-md"
                onDrop={dragDropFile}
                onDragOver={dragOverFile}
            >
                <label className="flex justify-center items-center w-[100vh] h-[30vh]" htmlFor="arquivos">
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
                <div>
                    <div className="cursor-pointer w-[100vh] grid grid-cols-9 gap-4">
                        {files.map((file, index) => (
                            <CardComponent key={index} index={index} file={file} moveFile={moveFile} />
                        ))}
                    </div>
                </div>
            </DndProvider>

            <div className="bg-black w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-xl text-white" onClick={handleMerge}>
                <span>Agrupar PDFs</span>
            </div>
        </div>
    );
}