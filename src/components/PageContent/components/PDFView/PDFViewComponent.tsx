import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFViewProps {
    url: string;
}

export const PDFView = ({ url }: PDFViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const renderTaskRef = useRef<any>(null);

    useEffect(() => {
        const loadPDF = async () => {
            const loadingTask = pdfjsLib.getDocument(url);
            const loadedPDF = await loadingTask.promise;
            setPdf(loadedPDF);
        };
        loadPDF();
    }, [url]);

    const renderPdf = useCallback(async (pageNumber: number) => {
        if (!canvasRef.current) return;

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
            canvasContext: context,
            viewport,
        };

        if (renderTaskRef.current) {
            await renderTaskRef.current.promise;
        }

        renderTaskRef.current = page.render(renderContext);

        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
    }, [pdf]);

    useEffect(() => {
        if (pdf) {
            renderPdf(1);
        }
    }, [pdf, renderPdf]);

    return (
        <canvas
            className="rounded-md border-4 border-gray-300 w-20 h-20 overflow-hidden"
            ref={canvasRef}
        />
    );
};
