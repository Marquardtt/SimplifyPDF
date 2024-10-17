import { useContext, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { FileP } from "@/models";
import { motion } from "framer-motion";
import BrushIcon from '@mui/icons-material/Brush';
import { rgb, PDFDocument } from "pdf-lib"; 
import { FilesContext } from "@/contexts/FilesContext";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFEditProps {
    file: FileP;
    pageNumber: number;
}

export const PDFEditComponent = ({ file, pageNumber: initialPageNumber }: PDFEditProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [pageNumber, setPageNumber] = useState(initialPageNumber);
    const [zoomLevel, setZoomLevel] = useState(1);
    const renderTaskRef = useRef<any>(null);
    const [colorSelected, setColorSelected] = useState("#FFFFFF");
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [colorPicker, setColorPicker] = useState("#FFFFFF");
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'draw' | 'erase' | 'view'>('view');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [inputRange, setInputRange] = useState(false);
    const { files, setFiles } = useContext(FilesContext);

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

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: zoom });

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

        if (drawingCanvasRef.current) {
            const drawingCanvas = drawingCanvasRef.current;
            drawingCanvas.height = viewport.height;
            drawingCanvas.width = viewport.width;
        }
    };

    useEffect(() => {
        if (pdf) {
            renderPdf(pageNumber, zoomLevel);
        }
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
        const canvasDrawing = drawingCanvasRef.current;
        const rect = canvasDrawing?.getBoundingClientRect();
        setMousePos({
            x: e.clientX - (rect?.left ?? 0),
            y: e.clientY - (rect?.top ?? 0),
        });
        if (mode === 'draw' || mode === 'erase') {
            setIsDrawing(true);
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !drawingCanvasRef.current) return;

        const canvasDrawing = drawingCanvasRef.current;
        const context = canvasDrawing.getContext("2d");
        const rect = canvasDrawing.getBoundingClientRect();

        const newMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        if (context) {
            if (mode === "draw") {
                context.globalCompositeOperation = "source-over";
                context.strokeStyle = colorSelected;
                context.lineWidth = 2;
            } else if (mode === "erase") {
                context.globalCompositeOperation = "destination-out";
                context.lineWidth = 10;
            }

            context.beginPath();
            context.moveTo(mousePos.x, mousePos.y);
            context.lineTo(newMousePos.x, newMousePos.y);
            context.stroke();

            setMousePos(newMousePos);
        }
    };

    const save = async () => {
        const drawingCanvas = drawingCanvasRef.current;
        const pdfCanvas = canvasRef.current;

        if (!drawingCanvas || !pdfCanvas) return;

        const pdfContext = pdfCanvas.getContext("2d");

        if (pdfContext) {
            pdfContext.drawImage(drawingCanvas, 0, 0);
            const finalImageDataURL = pdfCanvas.toDataURL("image/png");
            const response = await fetch(finalImageDataURL);
            const blob = await response.blob();
            const imageArrayBuffer = await blob.arrayBuffer();

            const pdfDoc = await PDFDocument.create();
            const pngImage = await pdfDoc.embedPng(imageArrayBuffer);
            const page = pdfDoc.addPage([pdfCanvas.width, pdfCanvas.height]);
            page.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: pdfCanvas.width,
                height: pdfCanvas.height,
            });

            const pdfBytes = await pdfDoc.save();
            const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
            const fileP = new FileP(
                URL.createObjectURL(pdfBlob),
                file.name,
                pdfBlob.size,
                'application/pdf',
                Date.now(),
                '',
                pdfBlob.slice.bind(pdfBlob),
                pdfBlob.stream.bind(pdfBlob),
                pdfBlob.text.bind(pdfBlob),
                pdfBlob.arrayBuffer.bind(pdfBlob),
            );
            if (files && setFiles) {
                const updatedFiles = [...files];
                const editedFileIndex = files.indexOf(file);
                if (editedFileIndex !== -1) {
                    updatedFiles[editedFileIndex] = fileP; 
                    setFiles(updatedFiles); 
                }
            }

        }
    }

    const stopDrawing = async () => {
        setIsDrawing(false);
    };

    const toggleMode = (newMode: 'draw' | 'erase' | 'view') => {
        setMode(newMode);
    };

    return (
        <div className="relative flex flex-col items-center bg-gray-300 dark:bg-gray-500 dark:bg- w-full md:h-[93%] rounded-md">
            {file.url != null ? (
                <>
                    <div className="z-30 flex flex-col absolute right-0 top-[45%] px-4 py-4 gap-4">
                        <div
                            onMouseOver={() => setColorPickerOpen(true)}
                            onMouseOut={() => setColorPickerOpen(false)}
                            className="relative">
                            <motion.div
                                transition={{ type: "spring", duration: 0.1, ease: "easeInOut" }}
                                animate={{ borderRadius: colorPickerOpen ? "0% 100% 100% 0%" : "100%" }}
                                className={`rounded-r-full bg-primary dark:bg-slate-600 w-9 h-9 flex justify-center items-center ${mode === 'draw' ? 'active' : ''}`}
                                onClick={() => toggleMode('draw')}
                            >
                                <div style={{ backgroundColor: colorSelected }} className={`w-5 h-5 rounded-full`}></div>
                            </motion.div>
                            {colorPickerOpen && (
                                <motion.div
                                    transition={{ type: "spring", duration: 0.2, ease: [0, 0.71, 0.2, 1.01] }}
                                    animate={{ width: colorSelected ? "13rem" : "0rem", padding: "6px" }}
                                    className="grid grid-cols-5 h-9 absolute gap-3 bg-primary dark:bg-slate-600 right-9 top-0 rounded-l-full">
                                    <div className="bg-white w-6 h-6 rounded-full ">
                                        <motion.input
                                            style={{ position: "absolute", opacity: 0 }}
                                            id="colorPicker"
                                            type="color"
                                            whileTap={{ scale: 0.9 }}
                                            onChange={(e) => (setColorSelected(e.currentTarget.value), setColorPicker(e.currentTarget.value))}
                                        >
                                        </motion.input>
                                        <label className="flex px-[2px] pt-[2px]" htmlFor="colorPicker">
                                            <BrushIcon sx={{ color: colorPicker, fontSize: 20 }}></BrushIcon>
                                        </label>
                                    </div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => (setColorSelected("#7DDA58"), setColorPicker("#000000"))}
                                        className={`bg-[#7DDA58] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => (setColorSelected("#D20103"), setColorPicker("#000000"))}
                                        className={`bg-[#D20103] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => (setColorSelected("#000000"), setColorPicker("#000000"))}
                                        className={`bg-[#000000] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => (setColorSelected("#FFFFFF"), setColorPicker("#000000"))}
                                        className={`bg-[#FFFFFF] cursor-pointer w-6 h-6 rounded-full`}>
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>
                        <div
                            onMouseOver={() => setInputRange(true)}
                            onMouseOut={() => setInputRange(false)}
                            className="relative">
                            <motion.div
                                transition={{ type: "spring", duration: 0.1, ease: "easeInOut" }}
                                animate={{ borderRadius: inputRange ? "0% 100% 100% 0%" : "100%" }}
                                className={`bg-primary dark:bg-slate-600 w-9 h-9 flex justify-center items-center ${mode === 'draw' ? 'active' : ''}`}
                            >
                            </motion.div>
                            {inputRange && (
                                <motion.div
                                    transition={{ type: "spring", duration: 0.2, ease: [0, 0.71, 0.2, 1.01] }}
                                    animate={{ width: inputRange ? "13rem" : "0rem", padding: "6px" }}
                                    className="grid grid-cols-5 h-9 absolute gap-3 bg-primary dark:bg-slate-600 right-9 top-0 rounded-l-full">
                                    <input type="range" name="" id="" />
                                </motion.div>
                            )}
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`bg-primary dark:bg-slate-600 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${mode === 'draw' ? 'active' : ''}`}
                            onClick={() => toggleMode('draw')}
                        >
                            <i className="pi pi-pencil" style={{ color: "white" }}></i>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`bg-primary dark:bg-slate-600 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${mode === 'draw' ? 'active' : ''}`}
                            onClick={() => toggleMode('view')}
                        >
                            <i className="pi pi-arrows-alt" style={{ color: "white" }}></i>
                        </motion.div>
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1, rotate: 1 }}
                            className={`bg-primary dark:bg-slate-600 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${mode === 'erase' ? 'active' : ''}`}
                            onClick={() => (toggleMode('erase'))}
                        >
                            <i className="pi pi-eraser" style={{ color: "white" }}></i>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`bg-primary dark:bg-slate-600 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer}`}
                            onClick={save}
                        >
                            <i className="pi pi-arrows-alt" style={{ color: "white" }}></i>
                        </motion.div>
                    </div>
                    <div className="my-2 mx-2 relative flex justify-center items-center w-full h-full overflow-auto">
                        <canvas
                            ref={canvasRef}
                            className="absolute z-0"

                        ></canvas>
                        <canvas
                            ref={drawingCanvasRef}
                            className="absolute z-10"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        >
                        </canvas>
                    </div>
                    <div className="flex gap-4 py-2">
                        <div className="flex gap-2">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.1, rotate: 1 }}
                                className={`bg-primary dark:bg-slate-600 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${mode === 'erase' ? 'active' : ''}`}
                                onClick={zoomOut}
                            >
                                <i className="pi pi-minus" style={{ color: "white" }}></i>
                            </motion.div>
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.1, rotate: 1 }}
                                className={`bg-primary dark:bg-slate-600 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${mode === 'erase' ? 'active' : ''}`}
                                onClick={zoomIn}
                            >
                                <i className="pi pi-plus" style={{ color: "white" }}></i>
                            </motion.div>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={pageNumber}
                                onChange={handlePageChange}
                                className="border rounded px-2"
                                min={1}
                            />
                            <div>
                                <span> de {pdf?.numPages}</span>
                            </div>
                        </div>
                    </div>
                </>
            )
                :
                ("")
            }
        </div >
    );
};
