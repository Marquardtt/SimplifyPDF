import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

interface PDFEditProps {
    file: FileP;
    pageNumber: number;
}

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

export const PDFEditComponent = ({ file, pageNumber: initialPageNumber }: PDFEditProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [pageNumber, setPageNumber] = useState(initialPageNumber);
    const [zoomLevel, setZoomLevel] = useState(1);
    const renderTaskRef = useRef<any>(null);

    useEffect(() => {
        const loadPDF = async () => {
            const loadingTask = pdfjsLib.getDocument(file.url);
            const loadedPDF = await loadingTask.promise;
            setPdf(loadedPDF);
        };
        loadPDF();
    }, [file.url]);

    const renderPdf = async (pageNumber: number, zoom: number) => {
        if (!canvasRef.current || !pdf) return;

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: zoom });
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
    };

    useEffect(() => {
        renderPdf(pageNumber, zoomLevel);
    }, [pdf, pageNumber, zoomLevel]);

    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPage = parseInt(e.target.value);
        if (newPage > 0 && newPage <= pdf?.numPages) {
            setPageNumber(newPage);
        }
    };

    const zoomIn = () => {
        setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 3));
    };

    const zoomOut = () => {
        setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
    };

    return (
        <div className="flex flex-col items-center bg-gray-300 w-full h-full">
            <div className="flex justify-center pt-4">
                <div className="flex gap-4">
                    <button onClick={zoomOut}>
                        <i className="pi pi-minus"></i>
                    </button>
                    <button onClick={zoomIn}>
                        <i className="pi pi-plus"></i>
                    </button>
                </div>
                <div className="flex">
                    <input
                        type="number"
                        value={pageNumber}
                        onChange={handlePageChange}
                        className="border rounded px-2"
                        min={1}
                        max={pdf?.numPages || 1}
                    />
                    <div>
                        <span> de {pdf?.numPages}</span>
                    </div>
                </div>
            </div>
            <div className="w-full h-full overflow-auto border-4 border-gray-300 rounded-md">
                <canvas
                    ref={canvasRef}
                    className="block"
                    style={{
                        maxWidth: "100%",
                        height: "auto", 
                    }}
                ></canvas>
            </div>
        </div>
    );
};
