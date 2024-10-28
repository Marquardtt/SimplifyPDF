import { LineCapStyle } from 'pdf-lib';
import * as funcs from './index';

export function writeChanges(drawings:any, pageToEdit:any, height:any) {
 drawings.forEach(async (drawing:any) => {

    if (drawing.type === 'line') {
        const startY = height - drawing.from.y;
        const endY = height - drawing.to.y;
        pageToEdit.drawLine({
            start: { x: drawing.from.x, y: startY },
            end: { x: drawing.to.x, y: endY },
            lineCap: LineCapStyle.Round,
            color: funcs.drawColor(drawing.color),
            thickness: Number(drawing.lineWidth),
            opacity: 1,
        });
    } else if (drawing.type === 'text') {
        pageToEdit.drawText(drawing.text, {
            x: drawing.x,
            y: height - drawing.y,
            size: drawing.fontSize,
            color: funcs.drawColor(drawing.color),
        });
    }
});
}