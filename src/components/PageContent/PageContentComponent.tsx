"use client"
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

export function PageContentComponent() {
   const [files, setFiles] = useState([] as File[]);
   const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
       if (e.target.files) {
           setFiles(Array.from(e.target.files));
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
       const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
       const url = URL.createObjectURL(blob);
       setMergedPdfUrl(url);
   };

   const handleMerge = () => {
       if (files.length > 0) {
           mergePDFs(files);
       }
   };

   return (
       <div className="flex flex-col items-center justify-center gap-10 pt-10">
           <div>
               <input accept=".pdf" multiple={true} type="file" onChange={handleFile} />
           </div>
           <div className="bg-black w-40 h-12 rounded-md flex items-center justify-center">
               <span 
                   className="text-xl text-white cursor-pointer"
                   onClick={handleMerge}
               >
                   Agrupar PDFs
               </span>
           </div>
           {mergedPdfUrl && (
               <div className="bg-black w-40 h-12 rounded-md flex justify-center items-center">
                   <a href={mergedPdfUrl} target="_blank" rel="noopener noreferrer">
                       <div className=" text-white">Baixar PDF Agrupado</div>
                   </a>
               </div>
           )}
       </div>
   );
}
