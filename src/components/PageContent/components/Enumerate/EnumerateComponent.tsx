import { FilesContext } from "@/contexts/FilesContext";
import { FileP } from "@/models";
import { motion } from "framer-motion";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { useContext } from "react";

export const EnumerateComponent = () => {

    const { files } = useContext(FilesContext);

    const handleEnumerate = async () => {
        if (files) {
            if (files.length > 0) {
                enumerateFiles(files);
            }
        }
    };

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
                    size: 8,
                });
            }
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
            className=" dark:bg-black bg-primary w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-white font-bold" onClick={handleEnumerate}>
            <span className="text-center">Numerar PDFs</span>
        </motion.div>
    )
}