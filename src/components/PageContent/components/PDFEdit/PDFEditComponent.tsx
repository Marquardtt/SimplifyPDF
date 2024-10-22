import { useContext, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { FileP } from "@/models";
import { motion } from "framer-motion";
import BrushIcon from '@mui/icons-material/Brush';
import { rgb, PDFDocument, LineCapStyle } from "pdf-lib";
import { FilesContext } from "@/contexts/FilesContext";
import { ColorBallComponent } from "./components/ColorBallComponent";
import { StrokeSVGComponent } from "./components/StrokeSVG";
import { ButtonComponent } from "./components/ButtonComponent";
import { PDFView } from "../PDFView";
import Image from "next/image";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFEditProps { file: FileP; pageNumber: number; closeModal: (a: any) => void; }

export const PDFEditComponent = ({ file, pageNumber: initialPageNumber, closeModal }: PDFEditProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [pdfPagesUrls, setPdfPagesUrls] = useState<string[]>([]);
    const [pageNumber, setPageNumber] = useState<string | undefined>(initialPageNumber.toString());
    const [zoomLevel, setZoomLevel] = useState(1);
    const renderTaskRef = useRef<any>(null);
    const [colorSelected, setColorSelected] = useState("#FFFFFF");
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [colorPicker, setColorPicker] = useState("#FFFFFF");
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'draw' | 'erase' | 'view'>('view');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { files, setFiles } = useContext(FilesContext);
    const [colorSize, setColorSize] = useState<number | string>(2);
    const [drawings, setDrawings] = useState<any[]>([]);
    const [tempDrawings, setTempDrawings] = useState<any[]>([]);
    const [indexOpen, setIndexOpen] = useState(false);
    const presetColors = ["#7DDA58", "#D20103", "#000000", "#FFFFFF"]



    useEffect(() => {
        const loadPDF = async () => {
            const loadingTask = pdfjsLib.getDocument(file); // Passando o File diretamente
            const loadedPDF = await loadingTask.promise;
            setPdf(loadedPDF);

            // Gerar URLs para as miniaturas
            const urls: string[] = [];
            for (let i = 1; i <= loadedPDF.numPages; i++) {
                const page = await loadedPDF.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                // Criar um canvas para renderizar a página
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                if (!context) {
                    throw new Error("Não foi possível obter o contexto do canvas.");
                }

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport,
                };

                await page.render(renderContext).promise;
                urls.push(canvas.toDataURL());  // Adiciona a imagem da miniatura
            }
            setPdfPagesUrls(urls);
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
        renderDrawings()
    };

    useEffect(() => {
        if (pdf) {
            renderPdf(parseInt(pageNumber!), zoomLevel);
        }
    }, [pdf, zoomLevel, pageNumber]);

    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setDrawings([])
        if (value === '') {
            setPageNumber(undefined)
            return
        }
        const newPage = parseInt(value);
        if (newPage > 0 && newPage <= pdf?.numPages) {
            setPageNumber(newPage.toString());
            renderPdf(newPage, zoomLevel);
        }
    };

    const zoomChange = (inOrOut: string) => {
        setZoomLevel((prevZoom) => Math.min(Math.max(prevZoom + (inOrOut === 'in' ? 0.1 : -0.1), 0.5), 3));
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvasDrawing = drawingCanvasRef.current;
        const rect = canvasDrawing?.getBoundingClientRect();
        setMousePos({
            x: (e.clientX - rect!.left) / zoomLevel,
            y: (e.clientY - rect!.top) / zoomLevel,
        });
        if (mode === 'draw' || mode === 'erase') {
            setIsDrawing(true);
        }
    };

    const distanceToLine = (lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }, point: { x: number; y: number }) => {
        const A = (point.x - lineStart.x)
        const B = (point.y - lineStart.y)
        const C = (lineEnd.x - lineStart.x)
        const D = (lineEnd.y - lineStart.y)

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        const param = (len_sq !== 0) ? (dot / len_sq) : -1;

        let xx, yy;

        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !drawingCanvasRef.current) return;

        const canvasDrawing = drawingCanvasRef.current;
        const rect = canvasDrawing.getBoundingClientRect();

        const newMousePos = {
            x: (e.clientX - rect.left) / zoomLevel,
            y: (e.clientY - rect.top) / zoomLevel,
        };

        if (mode === "draw") {
            const newDrawing = {
                type: 'line',
                color: colorSelected,
                lineWidth: colorSize as number,
                from: { ...mousePos },
                to: { ...newMousePos }
            };
            setDrawings((prev) => [...prev, newDrawing]);
        } else if (mode === "erase") {
            const eraseRadius = (colorSize as number) * 2;
            setDrawings((prev) => {
                return prev.filter(drawing => {
                    if (drawing.type === 'line') {
                        const distFromStart = distanceToLine(drawing.from, drawing.to, newMousePos);
                        return distFromStart > eraseRadius;
                    }
                    return true;
                });
            });
        }

        setMousePos(newMousePos);
        renderDrawings();
    };

    const renderDrawings = () => {
        if (!drawingCanvasRef.current) return;

        const canvasDrawing = drawingCanvasRef.current;
        const context = canvasDrawing.getContext("2d");
        if (context) {
            context.clearRect(0, 0, canvasDrawing.width, canvasDrawing.height);
            drawings.forEach((drawing) => {
                context.beginPath();
                context.lineWidth = drawing.lineWidth * zoomLevel;
                context.strokeStyle = drawing.color;
                context.lineCap = 'round';
                context.moveTo(drawing.from.x * zoomLevel, drawing.from.y * zoomLevel);
                context.lineTo(drawing.to.x * zoomLevel, drawing.to.y * zoomLevel);
                context.stroke();
            });
        }
    };

    const saveDef = async () => {
        const pdfDoc = await PDFDocument.create();
        const originalPdfBytes = await fetch(file.url).then((res) => res.arrayBuffer());
        const originalPdf = await PDFDocument.load(originalPdfBytes);

        const [originalPage] = await pdfDoc.copyPages(originalPdf, [parseInt(pageNumber!) - 1]);
        pdfDoc.addPage(originalPage);

        const page = pdfDoc.getPages()[0];
        const { height } = originalPage.getSize();

        const drawColor = (color: string) => {
            return rgb(
                parseInt(color.slice(1, 3), 16) / 255,
                parseInt(color.slice(3, 5), 16) / 255,
                parseInt(color.slice(5, 7), 16) / 255
            );
        };

        drawings.forEach((drawing) => {
            const startY = height - drawing.from.y;
            const endY = height - drawing.to.y;

            if (drawing.type === 'line') {
                page.drawLine({
                    start: { x: drawing.from.x, y: startY },
                    end: { x: drawing.to.x, y: endY },
                    lineCap: LineCapStyle.Round,
                    color: drawColor(drawing.color),
                    thickness: Number(drawing.lineWidth),
                    opacity: 1,
                });
            } else if (drawing.type === 'erase') {
                page.drawLine({
                    start: { x: drawing.from.x, y: startY },
                    end: { x: drawing.to.x, y: endY },
                    lineCap: LineCapStyle.Round,
                    thickness: Number(drawing.lineWidth),
                    color: rgb(1, 1, 1),
                    opacity: 0.5,
                });
            }
        });

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

        if (setFiles && files) {
            const newFiles = [...files];
            newFiles.splice(newFiles.indexOf(file), 1, newFileP);
            setFiles(newFiles);
        }
    }

    const toggleMode = (newMode: 'draw' | 'erase' | 'view') => {
        setMode(newMode);
    };

    const handleUndo = () => {
        if (drawings.length > 0) {
            const lastDrawing = drawings[drawings.length - 1];
            setTempDrawings([...tempDrawings, lastDrawing]);

            setDrawings(drawings.slice(0, drawings.length - 1));
            renderDrawings();
        }
    };

    const handleRedo = () => {
        if (tempDrawings.length > 0) {
            const lastTempDrawing = tempDrawings[tempDrawings.length - 1];
            setDrawings([...drawings, lastTempDrawing]);

            setTempDrawings(tempDrawings.slice(0, tempDrawings.length - 1));
            renderDrawings();
        }
    };

    useEffect(() => {
        const handle = setTimeout(() => {
            if (drawings.length > 1) {

                window.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.key === 'z') {
                        handleUndo();
                    }
                });

                return () => {
                    window.removeEventListener('keydown', handleUndo);
                };
            }
        }, 500)
        return () => clearTimeout(handle);
    }, [drawings]);

    return (
        <div className="relative md:w-[90vw] md:h-[50vw] w-[90vw] h-full lg:h-[94%] lg:w-1/1 bg-gray-400 dark:bg-slate-600 rounded-md flex flex-col items-center justify-end text-white">
            <motion.div
                onMouseLeave={() => setIndexOpen(false)}
                animate={{ width: indexOpen ? '20%' : '0%', opacity: indexOpen ? 1 : 0 }}
                className="flex justify-center  absolute w-30 h-full bg-primary dark:bg-slate-600 z-50 left-0">
                <div className="flex flex-col items-center my-10 px-5">
                    <span className="pb-5">Sumário</span>
                    <motion.div
                        className="flex flex-col gap-3 items-center overflow-y-scroll h-full">
                        {pdfPagesUrls.map((url, index) => (
                            <motion.div
                                key={index}
                                onClick={() => (handlePageChange({ target: { value: index + 1 } } as any))}
                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                            ><Image alt="preview" className="p-10" key={index} src={url} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
            <div className="flex items-center gap-4 my-2 w-full h-12 px-3 justify-between relative">
                <div className="flex gap-3">
                    <ButtonComponent icon="pi-book" onClick={() => setIndexOpen(!indexOpen)} />

                    <div
                        className="relative"
                        onMouseOver={() => setColorPickerOpen(true)}
                        onMouseOut={() => setColorPickerOpen(false)}
                    >
                        <div
                            className={`relative flex flex-col justify-center bg-primary dark:bg-slate-500 rounded-md  w-44 h-9  items-start z-40 `}>
                            <div className="w-full flex items-center justify-between gap-3 px-3" onClick={() => toggleMode('draw')}>
                                <div
                                    className="flex gap-2 items-center cursor-pointer">
                                    <i className="pi pi-pencil" style={{ color: "white" }}></i>
                                    <span>Desenhar</span>
                                </div>
                                <div className="flex items-center">
                                    <motion.i
                                        className="w-fit h-fit pi pi-angle-up"
                                        animate={{ rotate: colorPickerOpen ? 180 : 0 }}>
                                    </motion.i>
                                </div>
                            </div>
                        </div>
                        {colorPickerOpen && (
                            <>
                                <motion.div
                                    className="absolute w-full z-40"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="h-2 bg-transparent"></div>
                                    <motion.div className="bg-primary dark:bg-gray-600 w-full rounded-md py-2 flex flex-col gap-3">
                                        <div className="flex gap-3 justify-center">
                                            {presetColors.map((c) => (
                                                <ColorBallComponent key={c} onClick={() => (setColorSelected(c), setMode('draw'))} color={[c]} />
                                            ))}
                                        </div>
                                        <div className="flex gap-3 justify-center">
                                            <div className="bg-white w-7 h-7 rounded-full relative">
                                                <motion.input
                                                    style={{ position: "absolute", opacity: 0 }}
                                                    id="colorPicker"
                                                    type="color"
                                                    whileTap={{ scale: 0.9 }}
                                                    onChange={(e) => (setColorSelected(e.currentTarget.value), setColorPicker(e.currentTarget.value), setMode('draw'))}
                                                >
                                                </motion.input>
                                                <label className="flex justify-center items-center" htmlFor="colorPicker">
                                                    <BrushIcon sx={{ color: colorPicker, fontSize: 20 }}></BrushIcon>
                                                </label>
                                            </div>

                                        </div>
                                        <div className="flex gap-3 justify-center">
                                            <StrokeSVGComponent colorSelected={colorSelected} colorSize={colorSize as number} />
                                        </div>
                                        <div className="flex gap-3 justify-center">
                                            <motion.input step={2} min={4} max={20} onChange={(e) => setColorSize(e.currentTarget.value)} value={colorSize} type="range" name="" id="" />
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </>
                        )}
                    </div>
                    <ButtonComponent icon="pi-eraser" onClick={() => (toggleMode('erase'), setColorSelected('rgba(255, 255, 255, 1)'))} />
                </div>
                <div>
                    <div className="flex gap-4 py-2 mr-44">
                        <div className="flex gap-2">
                            <ButtonComponent icon="pi-replay" animate={{}} onClick={() => handleUndo()} />
                            <ButtonComponent icon="pi-refresh" onClick={() => handleRedo()} />
                            <ButtonComponent icon="pi-minus" onClick={() => zoomChange('out')} />
                            <ButtonComponent icon="pi-plus" onClick={() => zoomChange('in')} />
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={pageNumber || ''}
                                onChange={(e) => handlePageChange(e)}
                                className="border rounded px-2 text-black"
                                min={1}
                            />
                            <div>
                                <span> de {pdf?.numPages}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <ButtonComponent icon="pi-check" onClick={() => saveDef()} />
                    <ButtonComponent icon="pi-times" onClick={() => closeModal(false)} color={'#E00B0B'} />
                </div>
            </div >
            <div className="relative flex flex-col items-center justify-center bg-gray-300 dark:bg-gray-500 w-full h-full">
                {file.url && (
                    <>
                        <div className="relative flex justify-center items-center w-full h-full overflow-auto">
                            <canvas ref={canvasRef} className="absolute z-10"></canvas>
                            <canvas
                                ref={drawingCanvasRef}
                                className="absolute z-20"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={() => setIsDrawing(false)}
                            />
                        </div>
                    </>
                )}
            </div >
        </div >
    );
}