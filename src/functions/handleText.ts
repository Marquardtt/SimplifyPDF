export function handleText(drawingCanvasRef:any, drawings:any, mousePos:any, zoomLevel:any, colorSelected:any, funcs:any, setDrawings:any, text:any, fontSize:any) {
    const canvasDrawing = drawingCanvasRef.current;
    const ctx = canvasDrawing?.getContext("2d");
    
    if (ctx) {
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = colorSelected;

        const drawingClicked = funcs.getTextClicked(drawings, mousePos, zoomLevel, drawingCanvasRef, fontSize);
        if (drawingClicked) {
            drawingClicked.text = text;
            drawingClicked.fontSize = fontSize; 
        } else {
            ctx.fillText(text, mousePos.x * zoomLevel, mousePos.y * zoomLevel);
            
            setDrawings((prev:any) => [
                ...prev,
                {
                    id: Math.random(),
                    type: 'text',
                    color: colorSelected,
                    x: mousePos.x,
                    y: mousePos.y,
                    text: text,
                    fontSize: fontSize, 
                },
            ]);
        }
    }
}
