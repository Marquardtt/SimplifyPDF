"use client"

import { PDFEditComponent } from "@/components/PageContent/components/PDFEdit";
import { FileP } from "@/models";
import { useState } from "react";

export default function EditPage() {
    const [file, setFile] = useState([] as FileP[]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files) as FileP[];
            pdfLink(selectedFiles);
            setFile((prevFiles) => [...prevFiles, ...selectedFiles]);
        }
    };

    const pdfLink = (files: FileP[]) => {
        for (const file of files) {
            const url = URL.createObjectURL(new Blob([file], { type: "application/pdf" }));
            file.url = url;
        }
    }

    return (
        <div>
            <div>
                <label htmlFor="arquivo">clique aqui</label>
                <input id="arquivo" type="file" onChange={handleFile} />
            </div>
            {file.length > 0 ? (
                <div className="">
                    <PDFEditComponent file={file[0]} pageNumber={1} />
                </div>
            ) : (
                <><span>nenhum arquivo carregado</span></>
            )}
        </div>
    );
}