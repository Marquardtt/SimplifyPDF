import { useContext, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { FileP } from "@/models";
import { motion } from "framer-motion";
import BrushIcon from '@mui/icons-material/Brush';
import { rgb, PDFDocument, LineCapStyle, StandardFonts } from "pdf-lib";
import { FilesContext } from "@/contexts/FilesContext";
import { ColorBallComponent } from "./components/ColorBallComponent";
import { StrokeSVGComponent } from "./components/StrokeSVG";
import { ButtonComponent } from "./components/ButtonComponent";
import Image from "next/image";
import { TextAreaComponent } from "./components/TextAreaComponent";

import TextFieldsIcon from '@mui/icons-material/TextFields';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import { url } from "inspector";

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
    const [colorPicker, setColorPicker] = useState("#FFFFFF");
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'draw' | 'erase' | 'text' | 'none'>('none');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { files, setFiles } = useContext(FilesContext);
    const [colorSize, setColorSize] = useState<number | string>(2);
    const [drawings, setDrawings] = useState<any[]>([]);
    const [tempDrawings, setTempDrawings] = useState<any[]>([]);
    const [indexOpen, setIndexOpen] = useState(false);
    const presetColors = ["#000000", "#7F7F7F", "#880015", "#D20103", "#FF7F27", "#FFF200", "#22B14C", "#00A2E8", "#FFFFFF", "#C3C3C3", "#B97A57", "#FFAEC9", "#FFC90E", "#B5E61D", "#99D9EA", "#C8BFE7"]
    const [textAreaPos, setTextAreaPos] = useState({ x: 0, y: 0 });
    const [textAreaVisible, setTextAreaVisible] = useState(false);
    const [fontSize, setFontSize] = useState(12);
    const [inCanvas, setInCanvas] = useState(false);
    const [editableText, setEditableText] = useState<string>("");


    useEffect(() => {
        const loadPDF = async () => {
            const loadingTask = pdfjsLib.getDocument(file);
            const loadedPDF = await loadingTask.promise;
            setPdf(loadedPDF);

            const urls: string[] = [];
            for (let i = 1; i <= loadedPDF.numPages; i++) {
                const page = await loadedPDF.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                if (!context) {
                    throw new Error("Erro");
                }

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport,
                };

                await page.render(renderContext).promise;
                urls.push(canvas.toDataURL());
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

    const writeInPdf = async () => {
        const drawingClicked = getTextClicked();
        if (drawingClicked) {
            setTextAreaPos({ x: drawingClicked.x / zoomLevel, y: drawingClicked.y / zoomLevel });
            setTextAreaVisible(true);
            setEditableText(drawingClicked.text);
        } else if (mode === 'text') {
            setTextAreaPos({ x: mousePos.x, y: mousePos.y });
            setTextAreaVisible(true);
            setEditableText("");
        }
    };


    const handleTextSubmit = (text: string) => {
        const canvasDrawing = drawingCanvasRef.current;
        const ctx = canvasDrawing?.getContext("2d");

        if (ctx) {
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = colorSelected;

            if (getTextClicked()) {
                const drawingClicked = getTextClicked();
                if (drawingClicked) {
                    drawingClicked.text = text;
                }
            } else {
                ctx.fillText(text, mousePos.x * zoomLevel, mousePos.y * zoomLevel);
                setDrawings((prev) => [
                    ...prev,
                    {
                        id: Math.random(),
                        type: 'text',
                        color: colorSelected,
                        x: mousePos.x * zoomLevel,
                        y: mousePos.y * zoomLevel,
                        text: text,
                    },
                ]);
            }
        }
        renderDrawings()
        setTextAreaVisible(false);
    };


    const getTextClicked = () => {
        const drawingClicked = drawings.find((d) => {
            if (d.type !== 'text') return false;

            const ctx = drawingCanvasRef.current?.getContext("2d");
            if (!ctx) return false;

            ctx.font = `${fontSize}px Arial`;
            const textWidth = ctx.measureText(d.text).width;
            const textHeight = fontSize;

            const left = d.x / zoomLevel;
            const right = left + textWidth / zoomLevel;
            const top = d.y / zoomLevel - textHeight / zoomLevel;
            const bottom = d.y / zoomLevel;
            return mousePos.x >= left && mousePos.x <= right && mousePos.y >= top && mousePos.y <= bottom;
        });

        if (drawingClicked != null) {
            console.log(drawings.find((d) => d.x * zoomLevel === drawingClicked.x && d.y * zoomLevel === drawingClicked.y));

            return drawingClicked;
        } else {
            return null;
        }
    };



    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !drawingCanvasRef.current) return;

        const canvasDrawing = drawingCanvasRef.current;
        const rect = canvasDrawing.getBoundingClientRect();

        const newMousePos = {
            x: (e.clientX - rect.left) / zoomLevel,
            y: (e.clientY - rect.top) / zoomLevel,
        };

        if (mode === "draw" || mode === "text") {
            const newDrawing = {
                type: 'line',
                color: colorSelected,
                lineWidth: colorSize as number,
                from: { ...mousePos },
                to: { ...newMousePos }
            };
            setDrawings([...drawings, newDrawing]);
        } else if (mode === "erase") {
            const eraseRadius = (colorSize as number) * 2;
            setDrawings((prev) => {
                return prev.filter(drawing => {
                    if (drawing.type === 'line') {
                        const distFromStart = distanceToLine(drawing.from, drawing.to, newMousePos);
                        return distFromStart > eraseRadius;
                    }
                    else if (drawing.type === 'text') {
                        const textWidth = drawing.text.length * 8;
                        const textHeight = 16;
                        const textToDelete = newMousePos.x > drawing.x && newMousePos.x < drawing.x + textWidth &&
                            newMousePos.y > drawing.y - textHeight && newMousePos.y < drawing.y;
                        setDrawings(prev => prev.filter(d => !(d === drawing && textToDelete)));

                    }

                    return true;
                });
            });
        }

        renderDrawings();
        setMousePos(newMousePos);
    };

    const renderDrawings = () => {
        if (!drawingCanvasRef.current) return;

        const canvasDrawing = drawingCanvasRef.current;
        const context = canvasDrawing.getContext("2d");
        if (context) {
            context.clearRect(0, 0, canvasDrawing.width, canvasDrawing.height);
            drawings.forEach((drawing) => {
                if (drawing.type === 'line') {
                    context.beginPath();
                    context.lineWidth = drawing.lineWidth * zoomLevel;
                    context.strokeStyle = drawing.color;
                    context.lineCap = 'round';
                    context.moveTo(drawing.from.x * zoomLevel, drawing.from.y * zoomLevel);
                    context.lineTo(drawing.to.x * zoomLevel, drawing.to.y * zoomLevel);
                    context.stroke();
                } else if (drawing.type === 'text') {
                    context.font = 16 * zoomLevel + 'px Arial';
                    context.fillStyle = drawing.color;
                    context.fillText(drawing.text, drawing.x * zoomLevel, drawing.y * zoomLevel);
                }
            });
        }
    };

    const saveDef = async () => {
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

        const drawColor = (color: string) => {
            return rgb(
                parseInt(color.slice(1, 3), 16) / 255,
                parseInt(color.slice(3, 5), 16) / 255,
                parseInt(color.slice(5, 7), 16) / 255
            );
        };

        drawings.forEach(async (drawing) => {

            if (drawing.type === 'line') {
                const startY = height - drawing.from.y;
                const endY = height - drawing.to.y;
                pageToEdit.drawLine({
                    start: { x: drawing.from.x, y: startY },
                    end: { x: drawing.to.x, y: endY },
                    lineCap: LineCapStyle.Round,
                    color: drawColor(drawing.color),
                    thickness: Number(drawing.lineWidth),
                    opacity: 1,
                });
            } else if (drawing.type === 'text') {
                pageToEdit.drawText(drawing.text, {
                    x: drawing.x,
                    y: height - drawing.y,
                    size: 16,
                    color: drawColor(drawing.color),
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

    const toggleMode = (newMode: 'draw' | 'erase' | 'none') => {
        setMode(newMode);
    };

    useEffect(() => {
        if (mode === 'text' && inCanvas) {
            document.body.style.cursor = 'text';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [mode, inCanvas])

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
                animate={{ width: indexOpen ? '20%' : '0%', opacity: indexOpen ? 1 : 0, display: indexOpen ? 'block' : 'none' }}
                className={`flex justify-center  absolute w-30 h-full bg-primary dark:bg-slate-600 z-30 left-0 overflow-hidden overflow-y-scroll`}>
                <div className="flex flex-col items-center my-10 px-5">
                    <span className="pb-5">Sumário</span>
                    <motion.div
                        className="flex flex-col gap-3 items-center h-full">
                        {pdfPagesUrls.map((url, index) => (
                            <motion.div
                                key={index}
                                onClick={() => (handlePageChange({ target: { value: index + 1 } } as any))}
                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                            ><Image width={300} height={300} alt="preview" className="p-10" key={index} src={url} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            <div className="flex items-start gap-4 my-3 w-full px-5 relative">
                <div className="flex flex-col gap-3 ">
                    <div className="flex items-center justify-center h-16">
                        <ButtonComponent icon="pi-book" onClick={() => setIndexOpen(!indexOpen)} />
                    </div>
                    <div className="flex justify-center text-sm"><span>Sumário</span></div>
                </div>
                <div className="w-[2px] h-[80%] bg-gray-500"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3 h-16 items-center">
                        <ButtonComponent animate={{}} onClick={() => handleUndo()}><UndoIcon /></ButtonComponent>
                        <ButtonComponent onClick={() => handleRedo()} ><RedoIcon /></ButtonComponent>
                        <ButtonComponent icon="pi-minus" onClick={() => zoomChange('out')} />
                        <ButtonComponent icon="pi-plus" onClick={() => zoomChange('in')} />
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
                    <div className="flex justify-center text-sm">
                        <span>Controles de página</span>
                    </div>
                </div>
                <div className="w-[2px] h-[80%] bg-gray-500"></div>
                <div className="flex flex-col gap-3 ">
                    <div className="flex gap-3 h-16 items-center">
                        <ButtonComponent icon="pi-pencil" onClick={() => toggleMode('draw')} />
                        <ButtonComponent icon="pi-eraser" onClick={() => (toggleMode('erase'))} />
                        {/* Retirada para colocar no ambiente de produção (ainda tem muitos problemas) 
                        <ButtonComponent onClick={() => setMode('text')><TextFieldsIcon /></ButtonComponent>*/}
                        <ButtonComponent onClick={() => alert("Essa função está temporariamente desativada por causa instabilidade")} ><TextFieldsIcon /></ButtonComponent>
                        <ButtonComponent onClick={() => toggleMode('none')}><PanToolAltIcon /></ButtonComponent>
                        
                    </div>
                    <div className="flex justify-center text-sm">
                        <span>Ferramentas</span>
                    </div>
                </div>
                <div className="w-[2px] h-[80%] bg-gray-500"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex w-full gap-3">
                        <div className=" w-full rounded-md h-16 flex gap-3 items-center">
                            <div className="grid grid-rows-2 grid-cols-8 gap-3">
                                {presetColors.map((c) => (
                                    <ColorBallComponent key={c} onClick={() => (setColorSelected(c), toggleMode('draw'))} color={[c]} />
                                ))}
                            </div>
                            <div className="relative w-7 h-7 rounded-full flex justify-center">
                                <div className="color-wheel absolute w-7 h-7 rounded-full" style={{
                                    background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                                }}></div>
                                <motion.input
                                    style={{ position: "absolute", opacity: 0, width: '100%', height: '100%' }}
                                    id="colorPicker"
                                    type="color"
                                    whileTap={{ scale: 0.9 }}
                                    onChange={(e) => {
                                        setColorSelected(e.currentTarget.value);
                                        setColorPicker(e.currentTarget.value);
                                        toggleMode('draw');
                                    }}
                                />
                                <label className="flex justify-center items-center" htmlFor="colorPicker"></label>
                            </div>

                        </div>
                    </div>
                    <div className="col-span-2 flex justify-center text-sm h-fit">
                        <span>Cores</span>
                    </div>
                </div>
                <div className="w-[2px] h-[80%] bg-gray-500"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col items-center h-16">
                        <StrokeSVGComponent colorSelected={colorSelected} colorSize={colorSize as number} />
                        <motion.input step={2} min={4} max={20} onChange={(e) => setColorSize(e.currentTarget.value)} value={colorSize} type="range" name="" id="" />
                    </div>
                    <div className="text-sm flex justify-center"><span>Tamanho</span></div>
                </div>
                <div className="absolute right-0  px-3 flex justify-center items-center gap-2">
                    <ButtonComponent icon="pi-check" onClick={() => saveDef()} />
                    <ButtonComponent icon="pi-times" onClick={() => closeModal(false)} color={'#E00B0B'} />
                </div>
            </div >


            <div className="relative bg-gray-300 dark:bg-gray-500 w-full h-full">
                <motion.div
                    animate={{ height: mode === 'text' ? '55px' : '0px', opacity: mode === 'text' ? 1 : 0 }}
                    className=" z-[1000] top-0 absolute w-[38%] text-black overflow-hidden ">
                    <div className="bg-primary dark:bg-slate-600 w-full h-full flex justify-center py-7 gap-4 items-center rounded-b-md">

                        <div>
                            <select className="outline-none rounded-md" id="fontFamily">
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                            </select>
                        </div>
                        <div>
                            <select className="outline-none rounded-md" id="fontSize" onChange={(e) => (setFontSize(parseInt(e.target.value)))}>
                                <option value="11">11</option>
                                <option value="15">15</option>
                            </select>
                        </div>
                        <div className="w-[2px] h-[2rem] bg-gray-500"></div>
                        <ButtonComponent onClick={() => { }} ><FormatBoldIcon sx={{ color: "white" }} /></ButtonComponent>
                        <ButtonComponent onClick={() => { }} ><FormatItalicIcon sx={{ color: "white" }} /></ButtonComponent>
                        <ButtonComponent onClick={() => { }} ><FormatUnderlinedIcon sx={{ color: "white" }} /></ButtonComponent>
                        <ButtonComponent onClick={() => { }} ><StrikethroughSIcon sx={{ color: "white" }} /></ButtonComponent>
                        <div className="w-[2px] h-[2rem] bg-gray-500"></div>
                        <ButtonComponent icon="pi-align-left" onClick={() => { }}> </ButtonComponent>
                        <ButtonComponent icon="pi-align-center" onClick={() => { }}> </ButtonComponent>
                        <ButtonComponent icon="pi-align-right" onClick={() => { }}> </ButtonComponent>
                    </div>
                </motion.div>
                {file.url && (
                    <div className="relative w-full h-full justify-center overflow-hidden flex overflow-y-auto">
                        <canvas ref={canvasRef} className="absolute z-10 " />
                        <canvas
                            onMouseOver={() => setInCanvas(true)}
                            onMouseOut={() => setInCanvas(false)}
                            ref={drawingCanvasRef}
                            // Retirada para colocar no ambiente de produção (ainda tem muitos problemas)
                            // onClick={writeInPdf}
                            className="absolute z-20 w-fit h-fit"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={() => setIsDrawing(false)}
                        />
                        {textAreaVisible && (
                            <TextAreaComponent editableText={editableText} fontsize={fontSize} fontColor={colorSelected} x={textAreaPos.x} y={textAreaPos.y} zoomLevel={zoomLevel} onTextSubmit={handleTextSubmit} />
                        )}
                    </div>
                )}
            </div >
        </div >
    );
}