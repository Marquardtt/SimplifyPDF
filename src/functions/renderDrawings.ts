export function renderDrawings(drawingCanvasRef:any, drawings:any, zoomLevel:any) {
    if (!drawingCanvasRef.current) return;

    const canvasDrawing = drawingCanvasRef.current;
    const context = canvasDrawing.getContext("2d");
    if (context) {
        context.clearRect(0, 0, canvasDrawing.width, canvasDrawing.height);
        drawings.forEach((drawing:any) => {
            if (drawing.type === 'line') {
                context.beginPath();
                context.lineWidth = drawing.lineWidth * zoomLevel;
                context.strokeStyle = drawing.color;
                context.lineCap = 'round';
                context.moveTo(drawing.from.x * zoomLevel, drawing.from.y * zoomLevel);
                context.lineTo(drawing.to.x * zoomLevel, drawing.to.y * zoomLevel);
                context.stroke();
            } else if (drawing.type === 'text') {
                context.font = drawing.fontSize * zoomLevel + 'px Arial';
                context.fillStyle = drawing.color;
                context.fillText(drawing.text, drawing.x * zoomLevel, drawing.y * zoomLevel);
            }
        });
    }
};