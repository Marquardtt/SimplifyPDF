'use client';
import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import { PDFDocument, rgb } from 'pdf-lib';
import EditableText from './EditableText';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface TextLayer {
    id: string;
    content: string;
    x: number;
    y: number;
    fontSize: number;
}

const PdfEditor = () => {
    const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
    const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const fetchPdf = async () => {
        const res = await fetch('/c4496ee3-70ca-4a12-9d07-75cc1ab2f193 (1).pdf');
        const pdfData = new Uint8Array(await res.arrayBuffer());
        setPdfBytes(pdfData);
        await renderPdf(pdfData);
        await extractTextFromPdf(pdfData); 
    };

    const extractTextFromPdf = async (pdfData: Uint8Array) => {
        setTextLayers([]);
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const page = await pdfDoc.getPage(1); 
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        const layers: TextLayer[] = textContent.items.map((item: any, index: number) => {
            const [x, y] = item.transform.slice(4, 6);
            return {
                id: `text-1-${index}`,
                content: item.str,
                x,
                y: viewport.height - y,
                fontSize: item.height,
            };
        });

        setTextLayers(layers);
    };

    const renderPdf = async (pdfData: Uint8Array) => {
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const page = await pdfDoc.getPage(1); 
        const viewport = page.getViewport({ scale: 1 });
    
        if (canvasContainerRef.current) {
            canvasContainerRef.current.innerHTML = ''; 
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
    
            if (context) {
                const operatorList = await page.getOperatorList();
                const filteredFnArray = operatorList.fnArray.filter(
                    (fn) =>
                        fn !== pdfjsLib.OPS.setFont && fn !== pdfjsLib.OPS.showText
                );
                const filteredArgsArray = operatorList.argsArray.filter(
                    (_, index) =>
                        operatorList.fnArray[index] !== pdfjsLib.OPS.setFont &&
                        operatorList.fnArray[index] !== pdfjsLib.OPS.showText
                );
                const modifiedOperatorList = {
                    fnArray: filteredFnArray,
                    argsArray: filteredArgsArray,
                };
    
                const renderContext = {
                    canvasContext: context,
                    viewport,
                    operatorList: modifiedOperatorList, 
                };
                await page.render(renderContext).promise;
    
                canvasContainerRef.current.appendChild(canvas);
    
                canvasContainerRef.current.style.width = `${viewport.width}px`;
                canvasContainerRef.current.style.height = `${viewport.height}px`;
                canvasContainerRef.current.style.position = 'relative';
            }
        }
    };

    const savePdf = async () => {
        if (!pdfBytes) return;

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const newPdfDoc = await PDFDocument.create();
        const pages = await pdfDoc.getPages();

        pages.forEach((page, pageIndex) => {
            const { width, height } = page.getSize();
            const newPage = newPdfDoc.addPage([width, height]);

            textLayers.forEach((layer) => {
                console.log(layer.fontSize);

                if (parseInt(layer.id.split('-')[1]) - 1 === pageIndex) {
                    newPage.drawText(layer.content, {
                        x: layer.x,
                        y: newPage.getHeight() - layer.y - layer.fontSize,
                        size: layer.fontSize,
                        color: rgb(0, 0, 0),
                    });
                }
            });
        });

        const updatedPdfBytes = await newPdfDoc.save();
        const blob = new Blob([updatedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'modified.pdf';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full" style={{ position: 'relative' }}>
            <div className="absolute right-0 top-0">
                <button onClick={() => fetchPdf()}>Carregar PDF</button>
                <button onClick={savePdf} style={{ marginBottom: '20px' }}>
                    Salvar PDF
                </button>
            </div>
            <div className="flex flex-col items-start">
                <div
                    id="text-layer"
                    ref={canvasContainerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                    }}
                ></div>
                {textLayers.map((layer) => (
                    <EditableText
                        key={layer.id}
                        id={layer.id}
                        content={layer.content}
                        x={layer.x}
                        y={layer.y}
                        fontSize={layer.fontSize}
                        onChange={(id, content) =>
                            setTextLayers((prev) =>
                                prev.map((layer) => (layer.id === id ? { ...layer, content } : layer))
                            )
                        }
                        containerRef={canvasContainerRef}
                    />
                ))}
            </div>
        </div>
    );
};

export default PdfEditor;