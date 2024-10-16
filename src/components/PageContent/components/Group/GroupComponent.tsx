import { FileP } from "@/models";
import { FilesContext } from "@/contexts/FilesContext";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { useContext } from "react";

export const GroupComponent = () => {

    const { files } = useContext(FilesContext);

    const handleMerge = async () => {
        if (files) {
            if (files.length > 0) {
                mergePDFs(files);
            }
        }
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
        window.open(url);

    };

    return (
        <motion.div
            whileTap={{ scale: 1.0 }}
            whileHover={{ scale: 1.1 }}
            className=" dark:bg-black bg-primary w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-white font-bold" onClick={handleMerge}>
            <span className="text-center">Agrupar PDFs</span>
        </motion.div>
    )
}