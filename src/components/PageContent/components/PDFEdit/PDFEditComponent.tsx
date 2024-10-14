import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { FileP } from "@/models";
import { motion } from "framer-motion";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFEditProps {
    file: FileP;
    pageNumber: number;
}

export const PDFEditComponent = ({ file, pageNumber: initialPageNumber }: PDFEditProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [pageNumber, setPageNumber] = useState(initialPageNumber);
    const [zoomLevel, setZoomLevel] = useState(1);
    const renderTaskRef = useRef<any>(null);
    const [colorSelected, setColorSelected] = useState("#FFFFFF");
    const [colorPickerOpen, setColorPickerOpen] = useState(false);

    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'draw' | 'erase'>('draw');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const loadPDF = async () => {
            const loadingTask = pdfjsLib.getDocument(file.url);
            const loadedPDF = await loadingTask.promise;
            setPdf(loadedPDF);
        };
        loadPDF();
    }, [file]);

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

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const rect = canvas?.getBoundingClientRect();
        setMousePos({
            x: e.clientX - (rect?.left ?? 0),
            y: e.clientY - (rect?.top ?? 0),
        });
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();

        const newMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        if (context) {
            context.strokeStyle = colorSelected;
            context.lineWidth = mode === "draw" ? 2 : 10;

            context.beginPath();
            context.moveTo(mousePos.x, mousePos.y);
            context.lineTo(newMousePos.x, newMousePos.y);
            context.stroke();

            setMousePos(newMousePos);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const toggleMode = (newMode: 'draw' | 'erase') => {
        setMode(newMode);
    };

    return (
        <div className="relative flex flex-col items-center bg-gray-300 w-full md:h-[93%]">
            {file.url != null ? (
                <>
                    <div className="flex flex-col absolute right-0 top-[45%] px-4 py-4 gap-4">
                        <div
                            onMouseOver={() => setColorPickerOpen(true)}
                            onMouseOut={() => setColorPickerOpen(false)}
                            className="relative">
                            <motion.div
                                animate={{ borderRadius: colorPickerOpen ? "0% 100% 100% 0%" : "100%" }}
                                className={`bg-primary w-9 h-9 flex justify-center items-center cursor-pointer ${mode === 'draw' ? 'active' : ''}`}
                                onClick={() => toggleMode('draw')}
                            >
                                <div className={`bg-[${colorSelected}] w-5 h-5 rounded-full`}></div>
                            </motion.div>
                            {colorPickerOpen ? (
                                <motion.div
                                    transition={{ type: "spring", duration: 0.3, ease: "easeInOut" }}
                                    animate={{ width: colorPickerOpen ? "13rem" : "0rem", padding: "6px" }}
                                    className="grid grid-cols-5 h-9 absolute gap-3 bg-primary right-9 top-0 rounded-l-md">
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setColorSelected("#7DDA58")}
                                        className={`bg-[#7DDA58] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setColorSelected("#FFDE59")}
                                        className={`bg-[#FFDE59] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setColorSelected("#D20103")}
                                        className={`bg-[#D20103] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setColorSelected("#000000")}
                                        className={`bg-[#000000] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setColorSelected("#FFFFFF")}
                                        className={`bg-[#FFFFFF] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                </motion.div>
                            ) : ""}
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`bg-primary w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${mode === 'draw' ? 'active' : ''}`}
                            onClick={() => toggleMode('draw')}
                        >
                            <i className="pi pi-pencil" style={{ color: "white" }}></i>
                        </motion.div>
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1, rotate: 1 }}
                            className={`bg-primary w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${mode === 'erase' ? 'active' : ''}`}
                            onClick={() => toggleMode('erase')}
                        >
                            <i className="pi pi-eraser" style={{ color: "white" }}></i>
                        </motion.div>
                    </div>
                    <div className="flex justify-center py-2 gap-3">
                        <div className="flex gap-4">
                            <button onClick={zoomOut}>
                                <i className="pi pi-minus"></i>
                            </button>
                            <button onClick={zoomIn}>
                                <i className="pi pi-plus"></i>
                            </button>
                        </div>

                        <div className="flex gap-1">
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
                    <div className="flex justify-center items-center w-full h-full overflow-auto border-4 border-gray-300 rounded-md">
                        <canvas
                            ref={canvasRef}
                            className="block"
                            style={{
                                maxWidth: "100%",
                                height: "auto",
                            }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        ></canvas>
                    </div>
                </>
            )
                :
                ("")
            }
        </div>
    );
};
