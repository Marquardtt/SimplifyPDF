"use client"

import { FileP } from "@/models";
import { createContext} from "react";

type FilesProps = {
    files?: FileP[];
    setFiles?: (files:FileP[]) => void
}

export const FilesContext = createContext<FilesProps>({});