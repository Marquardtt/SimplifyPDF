import { rgb } from "pdf-lib";

export function drawColor(color: string) {
    return rgb(
        parseInt(color.slice(1, 3), 16) / 255,
        parseInt(color.slice(3, 5), 16) / 255,
        parseInt(color.slice(5, 7), 16) / 255
    );
};