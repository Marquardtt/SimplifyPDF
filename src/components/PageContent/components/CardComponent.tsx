import React from "react";
import { useDrag, useDrop } from "react-dnd";

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
        <div
            ref={setRefs}
            className={`text-sm flex items-end justify-center rounded-md border-2 truncate w-20 h-20 ${isDragging ? "opacity-50" : ""}`}
        >
            <span>{file.name.replace(".pdf", "")}</span>
        </div>
    );
};
