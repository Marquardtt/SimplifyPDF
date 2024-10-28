import { renderDrawings } from "./renderDrawings";

export function handleRedo(tempDrawings:any, drawings:any, setDrawings:(e:any)=> void, setTempDrawings:(e:any)=> void){
    if (tempDrawings.length > 0) {
        const lastTempDrawing = tempDrawings[tempDrawings.length - 1];
        setDrawings([...drawings, lastTempDrawing]);

        setTempDrawings(tempDrawings.slice(0, tempDrawings.length - 1));
        renderDrawings
    }
};