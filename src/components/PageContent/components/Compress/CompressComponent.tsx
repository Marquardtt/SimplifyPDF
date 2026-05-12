import { FilesContext } from "@/contexts/FilesContext";
import { FileP } from "@/models";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { useContext } from "react";

export const CompressComponent = () => {
    const { files, setFiles } = useContext(FilesContext);

    const handleCompress = async () => {
        if (files && files.length > 0) {
            const compressedFiles = await compressFiles(files);
            setFiles?.(compressedFiles);
        }
    };

    const compressFiles = async (pdfFiles: FileP[]) => {
        const newFiles: FileP[] = [];

        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const compressedBytes = await pdf.save({
                useObjectStreams: true,
                addDefaultPage: false,
                updateFieldAppearances: false,
            });

            const fileName = file.name.replace(/\.pdf$/i, "");
            const compressedFile = new File([compressedBytes], `${fileName}-compactado.pdf`, {
                type: "application/pdf",
                lastModified: Date.now(),
            }) as FileP;

            compressedFile.url = URL.createObjectURL(new Blob([compressedFile], { type: "application/pdf" }));
            newFiles.push(compressedFile);
        }

        return newFiles;
    };

    return (
        <motion.div
            whileTap={{ scale: 1.0 }}
            whileHover={{ scale: 1.1 }}
            className="dark:bg-black bg-primary w-40 h-12 rounded-md flex items-center justify-center cursor-pointer text-white font-bold"
            onClick={handleCompress}
        >
            <span className="text-center">Comprimir PDFs</span>
        </motion.div>
    );
};
