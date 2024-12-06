import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { FileP } from "@/models";
import { motion } from "framer-motion";
import { FilesContext } from "@/contexts/FilesContext";
import { ColorBallComponent } from "./components/ColorBallComponent";
import { StrokeSVGComponent } from "./components/StrokeSVG";
import { ButtonComponent } from "./components/ButtonComponent";
import { TextAreaComponent } from "./components/TextAreaComponent";
import * as funcs from '@/functions'

import TextFieldsIcon from '@mui/icons-material/TextFields';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import { IndexComponent } from "./components/IndexComponent/IndexComponent";

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
    const presetColors = ["#000000", "#7F7F7F", "#880015", "#D20103", "#FF7F27", "#FFF200", "#22B14C", "#00A2E8", "#FFFFFF", "#C3C3C3", "#FFC90E", "#B5E61D"]
    const [textAreaVisible, setTextAreaVisible] = useState(false);
    const [fontSize, setFontSize] = useState(6);
    const [inCanvas, setInCanvas] = useState(false);
    const [editableText, setEditableText] = useState<string>("");
    const [textConfg, setTextConfg] = useState(false);
    const [editingText, setEditingText] = useState<any>(null);
    const [textFunc, setTextFunc] = useState<'bold' | 'italic' | 'underline' | 'strike' | 'none'>('none');

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

    useEffect(() => {
        if (pdf) {
            funcs.renderPdf(canvasRef, pdf, parseInt(pageNumber!), zoomLevel, renderTaskRef, drawingCanvasRef, drawings);
        }
    }, [pdf, zoomLevel, pageNumber]);

    const handleUndo = useCallback(() => {
        if (drawings.length > 0) {
            const lastDrawing = drawings[drawings.length - 1];
            setTempDrawings([...tempDrawings, lastDrawing]);

            setDrawings(drawings.slice(0, drawings.length - 1));
            funcs.renderDrawings(drawingCanvasRef, drawings, zoomLevel);
        }
    }, [drawings, tempDrawings, drawingCanvasRef, zoomLevel]);

    useEffect(() => {
        if (mode === 'text' && inCanvas) {
            document.body.style.cursor = 'text';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [mode, inCanvas])

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
    }, [handleUndo, drawings]);

    useEffect(() => {
        if (drawings.find(d => d.type === 'text')) {
            funcs.renderDrawings(drawingCanvasRef, drawings, zoomLevel);
        }
    }, [drawings])

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
            funcs.renderPdf(canvasRef, pdf, newPage, zoomLevel, renderTaskRef, drawingCanvasRef, drawings);
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
            y: (e.clientY - rect!.top) / zoomLevel
        });

        if (mode === 'draw' || mode === 'erase') {
            setIsDrawing(true);
        }
    };

    const writeInPdf = async () => {
        const drawingClicked = funcs.getTextClicked(drawings, mousePos, zoomLevel, drawingCanvasRef, fontSize);
        if (drawingClicked && mode === 'none' && !editingText) {
            setEditingText(drawingClicked);
            setFontSize(drawingClicked.fontSize);
            setTextAreaVisible(true);
            setTextConfg(true)
            setEditableText(drawingClicked.text);
            setDrawings((prev) => prev.filter((d) => d !== drawingClicked));
            setEditingText(null);
        } else if (mode === 'text' && !drawingClicked) {
            toggleMode('none')
            setTextConfg(true)
            setTextAreaVisible(true);
            setEditableText("");
        } else {
            return
        }
    };

    const textClicked = () => {
        const drawingClicked = funcs.getTextClicked(drawings, mousePos, zoomLevel, drawingCanvasRef, fontSize);
        if (drawingClicked) {
            return drawingClicked.fontsize
        } else {
            return null
        }
    }

    const handleTextSubmit = (text: string) => {
        funcs.handleText(false, drawingCanvasRef, drawings, mousePos, zoomLevel, colorSelected, funcs, setDrawings, text, fontSize);
        funcs.renderDrawings(drawingCanvasRef, drawings, zoomLevel);
        setTextAreaVisible(false);
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
                        const distFromStart = funcs.distanceToLine(drawing.from, drawing.to, newMousePos);
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

        funcs.renderDrawings(drawingCanvasRef, drawings, zoomLevel);
        setMousePos(newMousePos);
    };

    const saveDef = async () => {
        const savedFile = await funcs.save(file, pageNumber, drawings);
        if (setFiles && files) {
            const newFiles = [...files];
            newFiles.splice(newFiles.indexOf(file), 1, savedFile);
            setFiles(newFiles);
        }
    }

    const toggleMode = (newMode: 'draw' | 'erase' | 'none' | 'text') => {
        setMode(newMode);
        setTextConfg(false)
    };

    // useEffect(() => {
    //     const handleClickOutside = (e: MouseEvent) => {
    //         if (textAreaVisible && mode === 'none' && e.target !== drawingCanvasRef.current) {
    //             setTextAreaVisible(false);
    //             setDrawings((prev) => {
    //                 return prev.filter(d => d.type !== 'text');
    //             });
    //         }
    //     }
    //     window.addEventListener('click', handleClickOutside);
    //     return() =>{
    //         window.removeEventListener('click', handleClickOutside);
    //     }
    // },[textAreaVisible, mode])

    return (
        <div className="relative md:w-[90vw] md:h-[50vw] w-[90vw] h-full lg:h-[94%] lg:w-1/1 bg-gray-400 dark:bg-slate-600 rounded-md flex flex-col items-center justify-end text-white">
            <IndexComponent handlePageChange={(e) => handlePageChange(e)} indexOpen={indexOpen} pdfPagesUrls={pdfPagesUrls} setIndexOpen={() => setIndexOpen(!indexOpen)} />
            <div className="flex items-start gap-4 my-3 w-full px-5 ">
                <div className="flex flex-col gap-3 ">
                    <div className="flex items-center justify-center h-16">
                        <ButtonComponent icon="pi-book" onClick={() => setIndexOpen(!indexOpen)} />
                    </div>
                    <div className="flex justify-center text-sm"><span>Sumário</span></div>
                </div>
                <div className="w-[2px] h-[80%] bg-gray-500"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3 h-16 items-center">
                        <ButtonComponent onClick={() => handleUndo()}><UndoIcon /></ButtonComponent>
                        <ButtonComponent onClick={() => funcs.handleRedo} ><RedoIcon /></ButtonComponent>
                        <ButtonComponent icon="pi-minus" onClick={() => zoomChange('out')} />
                        <ButtonComponent icon="pi-plus" onClick={() => zoomChange('in')} />
                        <div className="flex items-center gap-1 truncate">
                            <input
                                type="number"
                                value={pageNumber || 1}
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
                        <ButtonComponent onClick={() => (setMode('text'), setTextConfg(true))}><TextFieldsIcon /></ButtonComponent>
                        <ButtonComponent onClick={() => (toggleMode('none'))}><PanToolAltIcon /></ButtonComponent>
                    </div>
                    <div className="flex justify-center text-sm">
                        <span>Ferramentas</span>
                    </div>
                </div>
                <div className="w-[2px] h-[80%] bg-gray-500"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex w-full gap-3">
                        <div className=" w-full rounded-md h-16 flex gap-3 items-center">
                            <div className="grid grid-rows-2 grid-cols-6 gap-3">
                                {presetColors.map((c) => (
                                    <ColorBallComponent key={c} onClick={() => (setColorSelected(c))} color={[c]} />
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
                <div className="absolute lg:right-0 px-3 flex flex-col justify-center items-center gap-2">
                    <ButtonComponent icon="pi-check" onClick={() => saveDef()} />
                    <ButtonComponent icon="pi-times" onClick={() => closeModal(false)} color={'#E00B0B'} />
                </div>
            </div >
            <div className="relative bg-gray-300 dark:bg-gray-500 w-full h-full flex justify-center">
                <motion.div

                    animate={{ height: textConfg ? '55px' : '0px', opacity: textConfg ? 1 : 0 }}
                    className=" z-[1000] absolute text-black overflow-hidden">
                    <div id="textConfig" className="px-3 bg-gray-400 dark:bg-slate-600 w-fit h-full flex justify-center py-7 gap-4 items-center rounded-b-md">
                        <div className="flex gap-3 items-center justify-center w-full">
                            <select className=" outline-none rounded-md" id="fontFamily">
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                            </select>
                            <div>
                                <select value={fontSize} className="outline-none rounded-md" id="fontSize" onChange={(e) => (setFontSize(parseInt(e.target.value)))}>
                                    {Array.from({ length: 25 }, (_, i) => i + 6).map((i: any) => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </select>
                            </div>
                            {/* <div className="w-[2px] h-[2rem] bg-gray-500"></div>
                            <ButtonComponent title="bold" bg={"bg-gray-500"} onClick={(e) => handleTextFunctionChange('bold', e)} ><FormatBoldIcon sx={{ color: "white" }} /></ButtonComponent>
                            <ButtonComponent title="italic" bg={"bg-gray-500"} onClick={(e) => handleTextFunctionChange('italic', e)} ><FormatItalicIcon sx={{ color: "white" }} /></ButtonComponent>
                            <ButtonComponent title="underline" bg={"bg-gray-500"} onClick={(e) => handleTextFunctionChange('underline', e)} ><FormatUnderlinedIcon sx={{ color: "white" }} /></ButtonComponent>
                            <ButtonComponent title="strike" bg={"bg-gray-500"} onClick={(e) => handleTextFunctionChange('strike', e)} ><StrikethroughSIcon sx={{ color: "white" }} /></ButtonComponent>

                            <div className="w-[2px] h-[2rem] bg-gray-500"></div>
                            <ButtonComponent icon="pi pi-align-left" onClick={() => { }}><div className="bg-black w-full h-full"></div> </ButtonComponent>
                            <ButtonComponent icon="pi pi-align-center" onClick={() => { }}><div className="bg-black w-full h-full"></div> </ButtonComponent>
                            <ButtonComponent icon="pi pi-align-right" onClick={() => { }}><div className="bg-black w-full h-full"></div> </ButtonComponent> */}
                        </div>
                    </div>
                </motion.div>
                {file.url && (
                    <div className="relative w-full h-full flex justify-center overflow-hidden overflow-y-auto">
                        <motion.canvas animate={{ top: textConfg ? 70 : 0 }} ref={canvasRef} className="absolute z-10" />
                        <motion.canvas
                            animate={{ top: textConfg ? 70 : 0 }}
                            onMouseOver={() => setInCanvas(true)}
                            onMouseOut={() => setInCanvas(false)}
                            ref={drawingCanvasRef}
                            onClick={() => (writeInPdf())}
                            className="absolute z-20"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={() => setIsDrawing(false)}
                        />
                        {textAreaVisible ? (
                            <TextAreaComponent canvasElement={canvasRef.current} drawingRef={drawingCanvasRef} x={mousePos.x} y={mousePos.y} editableText={editableText} fontsize={() => textClicked()} fontColor={colorSelected} zoomLevel={zoomLevel} onTextSubmit={handleTextSubmit} />
                        ) :
                            ("")}
                    </div>
                )}
            </div >
        </div >
    );
};