export function distanceToLine(lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }, point: { x: number; y: number }){
    const A = (point.x - lineStart.x)
    const B = (point.y - lineStart.y)
    const C = (lineEnd.x - lineStart.x)
    const D = (lineEnd.y - lineStart.y)

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = (len_sq !== 0) ? (dot / len_sq) : -1;

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
};