import * as funcs from "@/functions";
import { FileP } from "@/models";
import { PDFDocument } from "pdf-lib";

export async function save(file:FileP, pageNumber:any, drawings:any) {
    const pdfDoc = await PDFDocument.create();
    const originalPdfBytes = await fetch(file.url).then((res) => res.arrayBuffer());
    const originalPdf = await PDFDocument.load(originalPdfBytes);

    const totalPages = originalPdf.getPageCount();
    const copiedPages = await pdfDoc.copyPages(originalPdf, Array.from({ length: totalPages }, (_, i) => i));

    copiedPages.forEach((page) => {
        pdfDoc.addPage(page);
    });

    const pageToEdit = pdfDoc.getPages()[parseInt(pageNumber!) - 1];
    const { height } = pageToEdit.getSize();

    funcs.writeChanges(drawings, pageToEdit, height);

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const fileP = new File([pdfBlob], file.name);
    const newFileP = new FileP(
        URL.createObjectURL(fileP),
        fileP.name,
        fileP.size,
        fileP.type,
        fileP.lastModified,
        fileP.webkitRelativePath,
        fileP.slice.bind(fileP),
        fileP.stream.bind(fileP),
        fileP.text.bind(fileP),
        fileP.arrayBuffer.bind(fileP)
    );
    return newFileP;
}