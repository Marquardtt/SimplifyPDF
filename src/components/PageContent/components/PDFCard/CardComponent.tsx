import React, { useContext, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { PDFView } from "@/components/PageContent/components/PDFView";
import { FileP } from "@/models";
import { FilesContext } from "@/contexts/FilesContext";

interface FileItemProps {
    file: FileP;
    index: number;
    moveFile: (dragIndex: number, hoverIndex: number) => void;
    removeFile: (index: number) => void;
}

const ItemType = {
    FILE: "file",
};

export const CardComponent: React.FC<FileItemProps> = ({ file, index, moveFile, removeFile }) => {
    const [hover, setHover] = useState<number | null>(null);
    const { files } = useContext(FilesContext);

    const [{ isDragging }, dragRef] = useDrag({
        type: ItemType.FILE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const handleRemove = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        removeFile(index);
    }

    const [, dropRef] = useDrop({
        accept: ItemType.FILE,
        drop: (draggedItem: { index: number }) => {
            if (draggedItem.index !== index) {
                moveFile(draggedItem.index, index);
            }
        },
    });

    const setRefs = (node: HTMLDivElement | null) => {
        dragRef(node);
        dropRef(node);
    };

    return (
        <motion.div
            key={file.url}
            ref={setRefs}
            onMouseOver={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
            whileHover={{ scale: 1.1, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            dragTransition={{ bounceStiffness: 500, bounceDamping: 20 }}
            style={{
                cursor: "grab",
                opacity: isDragging ? 0.5 : 1,
                transformOrigin: "center",
                transition: "box-shadow ease",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            }}
            className={`relative text-sm flex items-end justify-center rounded-md border-2 dark:border-white border-gray-300 w-20 h-20 ${isDragging ? "bg-opacity-50" : "bg-white"}`}
            layout
        >
            {hover === index && (
                <div
                    className="dark:bg-white bg-gray-300 absolute rounded-bl-md w-5 h-5 top-0 right-0 flex justify-center items-center cursor-pointer"
                    onClick={(e) => handleRemove(e)}
                >
                    <i className="pi pi-times"></i>
                </div>
            )}
            <div className="flex flex-col justify-center items-center w-full dark:bg-white bg-gray-300">
                <PDFView url={files!.find((f)=> f.url == file.url)!.url} />
                <div className="absolute bottom-0 text-center w-full truncate bg-gray-300">
                    <span className="w-[85%]" title={files!.find((f) => f.name == file.name )?.name.replace('.pdf', '')}>
                    {files!.find((f) => f.name == file.name )?.name.replace('.pdf', '')}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
