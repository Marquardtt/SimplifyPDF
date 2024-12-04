import * as funcs from './index';

export async function renderPdf(canvasRef:any, pdf:any, pageNumber: number, zoom: number, renderTaskRef:any, drawingCanvasRef:any, drawings:any) {
    if (!canvasRef.current || !pdf) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let page = await pdf.getPage(1);
    if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    try{
        page = await pdf.getPage(pageNumber);
    } catch (err) {
        
    }

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
    funcs.renderDrawings(drawingCanvasRef, drawings, zoom);
};