import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";

interface FileItemProps {
    file: File;
    index: number;
    moveFile: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = {
    FILE: "file",
};

export const CardComponent: React.FC<FileItemProps> = ({ file, index, moveFile }) => {

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
            className={`text-sm flex items-end justify-center rounded-md border-2 dark:border-white border-gray-300 w-20 h-20 ${isDragging ? "opacity-50" : ""}`}
        >

            <div className="flex justify-center items-center w-full dark:bg-white bg-gray-300  ">
                <span className="text-center w-[85%] truncate">{file.name.replace(".pdf", "")}</span>
            </div>
        </motion.div>
    );
};
