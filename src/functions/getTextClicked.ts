export function getTextClicked(drawings:any, mousePos:any, zoomLevel:any, drawingCanvasRef:any, fontSize:any) {
    const drawingClicked = drawings.find((d:any) => {
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

        return drawingClicked;
    } else {
        return null;
    }
};