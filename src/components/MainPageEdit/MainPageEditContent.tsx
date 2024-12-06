'use client'
import { motion } from "framer-motion";
import { ButtonComponent } from "../PageContent/components/PDFEdit/components/ButtonComponent";
import { ColorBallComponent } from "../PageContent/components/PDFEdit/components/ColorBallComponent";
import { IndexComponent } from "../PageContent/components/PDFEdit/components/IndexComponent/IndexComponent";
import { StrokeSVGComponent } from "../PageContent/components/PDFEdit/components/StrokeSVG";
import { TextAreaComponent } from "../PageContent/components/PDFEdit/components/TextAreaComponent";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import * as funcs from '@/functions'
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import { FileP } from "@/models";
import { FilesContext } from "@/contexts/FilesContext";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const MainPageEditContent = () => {
    const { files, setFiles } = useContext(FilesContext);
    const [drawings, setDrawings] = useState<any[]>([]);
    const [pageNumber, setPageNumber] = useState<string | undefined>("1");
    const [pdf, setPdf] = useState<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const renderTaskRef = useRef<any>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const [indexOpen, setIndexOpen] = useState(false);
    const [pdfPagesUrls, setPdfPagesUrls] = useState<string[]>([]);
    const [tempDrawings, setTempDrawings] = useState<any[]>([]);
    const [mode, setMode] = useState<'draw' | 'erase' | 'text' | 'none'>('none');
    const [textConfg, setTextConfg] = useState(false);
    const presetColors = ["#000000", "#7F7F7F", "#880015", "#D20103", "#FF7F27", "#FFF200", "#22B14C", "#00A2E8", "#FFFFFF", "#C3C3C3", "#FFC90E", "#B5E61D"]
    const [colorSelected, setColorSelected] = useState("#FFFFFF");
    const [colorPicker, setColorPicker] = useState("#FFFFFF");
    const [colorSize, setColorSize] = useState<number | string>(2);
    const [fontSize, setFontSize] = useState(6);
    const [inCanvas, setInCanvas] = useState(false);
    const [editingText, setEditingText] = useState<any>(null);
    const [textAreaVisible, setTextAreaVisible] = useState(false);
    const [editableText, setEditableText] = useState<string>("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (pdf) {
            funcs.renderPdf(canvasRef, pdf, parseInt(pageNumber!), zoomLevel, renderTaskRef, drawingCanvasRef, drawings);
        }
    }, [pdf, zoomLevel, pageNumber]);

    useEffect(() => {
        const loadPDF = async () => {
            if (files) {
                const loadingTask = pdfjsLib.getDocument(files[0]);
                const loadedPDF = await loadingTask.promise;
                setPdf(loadedPDF);
                console.log(canvasRef);
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
            }
        };
        loadPDF();
    }, [files]);

    useEffect(() => {
        if (mode === 'text' && inCanvas) {
            document.body.style.cursor = 'text';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [mode, inCanvas])

    const handleUndo = useCallback(() => {
        if (drawings.length > 0) {
            const lastDrawing = drawings[drawings.length - 1];
            setTempDrawings([...tempDrawings, lastDrawing]);

            setDrawings(drawings.slice(0, drawings.length - 1));
            funcs.renderDrawings(drawingCanvasRef, drawings, zoomLevel);
        }
    }, [drawings, tempDrawings, drawingCanvasRef, zoomLevel]);

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


    // const saveDef = async () => {
    //     const savedFile = await funcs.save(file, pageNumber, drawings);
    //     if (setFiles && files) {
    //         const newFiles = [...files];
    //         newFiles.splice(newFiles.indexOf(file), 1, savedFile);
    //         setFiles(newFiles);
    //     }
    // }

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

    const dragOverFile = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const pdfLink = (files: FileP[]) => {
        for (const file of files) {
            const url = URL.createObjectURL(new Blob([file], { type: "application/pdf" }));
            file.url = url;
        }
    };

    const dragDropFile = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf") as FileP[];
        if (setFiles && files && droppedFiles.length > 0) {
            pdfLink(droppedFiles);
            setFiles([...files, ...droppedFiles]);
        }
    };



    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setFiles && files) {
            if (e.target.files) {
                const selectedFiles = Array.from(e.target.files) as FileP[];
                pdfLink(selectedFiles);
                setFiles(selectedFiles);
            }
        }
    };

    const zoomChange = (inOrOut: string) => {
        setZoomLevel((prevZoom) => Math.min(Math.max(prevZoom + (inOrOut === 'in' ? 0.1 : -0.1), 0.5), 3));
    };

    const toggleMode = (newMode: 'draw' | 'erase' | 'none' | 'text') => {
        setMode(newMode);
        setTextConfg(false)
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

    const removeFiles = () => {
        if (setFiles && files) {
            setFiles([]);
        }
    }

    const saveDef = async () => {
        if (files != null) {
            const savedFile = await funcs.save(files[0], pageNumber, drawings);
            if (setFiles && files) {
                const newFiles = [...files];
                newFiles.splice(newFiles.indexOf(files[0]), 1, savedFile);
                setFiles(newFiles);
            }
        }
    }

    return (
        <div className="fixed  w-full h-full lg:h-full pt-14 lg:w-1/1 bg-gray-400 dark:bg-slate-600 rounded-md flex flex-col items-center justify-end text-white">
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
                    <ButtonComponent icon="pi-times" onClick={() => removeFiles()} color={'#E00B0B'} />
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
                        </div>
                    </div>
                </motion.div>
                <div className="relative w-full h-full flex justify-center items-center">
                    {files?.[0] ? (
                        <div className="relative w-full h-full flex justify-center overflow-hidden overflow-y-auto">
                            <motion.canvas animate={{ top: textConfg ? 70 : 0 }} ref={canvasRef} className="absolute z-1" />
                            <motion.canvas
                                animate={{ top: textConfg ? 70 : 0 }}
                                onMouseOver={() => setInCanvas(true)}
                                onMouseOut={() => setInCanvas(false)}
                                ref={drawingCanvasRef}
                                onClick={() => (writeInPdf())}
                                className="absolute z-10"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={() => setIsDrawing(false)}
                            />
                            {textAreaVisible ? (
                                <TextAreaComponent canvasElement={canvasRef.current} drawingRef={drawingCanvasRef} x={mousePos.x} y={mousePos.y} editableText={editableText} fontsize={() => textClicked()} fontColor={colorSelected} zoomLevel={zoomLevel} onTextSubmit={handleTextSubmit} />
                            ) :
                                ("")}
                        </div>
                    ) : (
                        <div
                            className=" flex justify-center items-center border-2 border-dashed sm:w-1/2 sm:h-[30vh] sm:mx-6 h-[15vh] mx-6 rounded-md hover:bg-gray-100 dark:bg-opacity-30 duration-300"
                            onDrop={dragDropFile}
                            onDragOver={dragOverFile}
                        >
                            <label className="text-center flex justify-center items-center w-11/12 h-full dark:text-white dark:opacity-100 opacity-50 text-xl font-bold" htmlFor="arquivos">
                                Arraste os arquivos até aqui ou clique para selecionar
                            </label>
                            <input
                                id="arquivos"
                                className="hidden"
                                accept=".pdf"
                                multiple={false}
                                type="file"
                                onChange={handleFile}
                            />
                        </div>
                    )}
                </div>

            </div >
        </div >
    )
}