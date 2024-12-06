'use client'
import React, { useState, useEffect } from 'react';
import { Viewer } from '@react-pdf-viewer/core';
import EditableText from './EditableText';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import { PDFDocument } from 'pdf-lib';
import { rgb } from 'pdf-lib';

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

    useEffect(() => {
        fetch('/CPF.pdf')
            .then((res) => res.arrayBuffer())
            .then((data) => {
                const pdfData = new Uint8Array(data);
                setPdfBytes(pdfData);
                extractTextFromPdf(pdfData);  // Função para extrair texto do PDF
            });
    }, []);

    const extractTextFromPdf = async (pdfData: Uint8Array) => {
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const numPages = pdfDoc.numPages;
        let allTextLayers: TextLayer[] = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1.0 });

            textContent.items.forEach((item, index) => {
                if ('transform' in item) {
                    const [x, y] = item.transform.slice(4, 6);
                    allTextLayers.push({
                        id: `text-${pageNum}-${index}`,
                        content: item.str,
                        x: x,  
                        y: viewport.height - y,  
                        fontSize: item.height,
                    });
                }
            });
        }

        setTextLayers(allTextLayers);
    };

    const handleTextChange = (id: string, newContent: string) => {
        setTextLayers((prev) =>
            prev.map((layer) => (layer.id === id ? { ...layer, content: newContent } : layer))
        );
    };

    const savePdf = async () => {
        if (!pdfBytes) return;

        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Criar um novo documento PDF
        const newPdfDoc = await PDFDocument.create();

        const pages = await pdfDoc.getPages();

        pages.forEach((page, pageIndex) => {
            const { width, height } = page.getSize();
            const newPage = newPdfDoc.addPage([width, height]);

            // Desenhar o conteúdo do texto nas posições correspondentes
            textLayers.forEach((layer) => {
                if (parseInt(layer.id.split('-')[1]) - 1 === pageIndex) {
                    // Desenhar o texto
                    newPage.drawText(layer.content, {
                        x: layer.x,
                        y: newPage.getHeight() - layer.y - layer.fontSize,  
                        size: layer.fontSize,
                        color: rgb(0, 0, 0), // Cor preta para o texto
                    });
                }
            });
        });

        const updatedPdfBytes = await newPdfDoc.save();

        // Salvar o PDF modificado
        const blob = new Blob([updatedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'modified.pdf';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="pt-96" style={{ position: 'relative' }}>
            <button onClick={savePdf} style={{ marginBottom: '20px' }}>
                Salvar PDF
            </button>
            {pdfBytes && (
                <Viewer fileUrl={pdfBytes} plugins={[]} />
            )}
            {textLayers.map((layer) => (
                <EditableText
                    key={layer.id}
                    id={layer.id}
                    content={layer.content}
                    x={layer.x}
                    y={layer.y}
                    fontSize={layer.fontSize}
                    onChange={handleTextChange}
                />
            ))}
        </div>
    );
};

export default PdfEditor;
