import React, { ReactElement, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";

interface FileItemProps {
    file: File;
    index: number;
    moveFile: (dragIndex: number, hoverIndex: number) => void;
    removeFile: (index: number) => void;
}

const ItemType = {
    FILE: "file",
};

export const CardComponent: React.FC<FileItemProps> = ({ file, index, moveFile, removeFile }) => {
    const [hover, setHover] = useState<number | null>(null);

    const [{ isDragging }, dragRef] = useDrag({
        type: ItemType.FILE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, dropRef] = useDrop({
        accept: ItemType.FILE,
        hover: (draggedItem: { index: number }) => {
            if (draggedItem.index !== index) {
                moveFile(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    const setRefs = (node: HTMLDivElement | null) => {
        dragRef(node);
        dropRef(node);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
            ref={setRefs}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
            className={`cursor-pointer relative text-sm flex items-end justify-center rounded-md border-2 dark:border-white border-gray-300 w-20 h-20 ${isDragging ? "opacity-50" : ""}`}
        >
            {index == hover ?
                <div className="dark:bg-white bg-gray-300 absolute rounded-bl-md w-5 h-5 top-0 right-0 flex justify-center items-center"
                onClick={() => removeFile(index)}>
                    <i className="pi pi-times"></i>
                </div>
                :
                ""}
            <div className="flex justify-center items-center w-full dark:bg-white bg-gray-300  ">
                <span title={file.name.replace(".pdf", "")} className="text-center w-[85%] truncate">{file.name.replace(".pdf", "")}</span>
            </div>
        </motion.div>
    );
};
