import { createContext } from "react";

type DrawingProps = {
    drawings?: any[];
    setDrawings?: (drawings: any[]) => void
}

export const DrawingsContext = createContext<DrawingProps>({});