import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

interface TextAreaComponentProps {
    x?: number;
    y?: number;
    zoomLevel: number;
    onTextSubmit: (text: string) => void;
    fontsize?: number;
    fontColor?: string;
    onclick?: () => void;
    editableText?: string;
    drawingRef?: any;
}

export const TextAreaComponent: React.FC<TextAreaComponentProps> = ({ drawingRef, x, y, zoomLevel, onTextSubmit, fontsize, fontColor, onclick, editableText }) => {
    const [isFocused, setIsFocused] = useState(true);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [position, setPosition] = useState({ x: x, y: y });

    const handleBlur = () => {
        setIsFocused(false);
        onTextSubmit(textAreaRef.current?.value || '');
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    useEffect(() => {
        if (textAreaRef.current && isFocused) {
            textAreaRef.current.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onTextSubmit(textAreaRef.current!.value);
                setIsFocused(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onTextSubmit, isFocused]);

    useEffect(() => {
        if (textAreaRef.current && isFocused) {
            textAreaRef.current.value = editableText || "";
            textAreaRef.current.focus();
        }
    }, [editableText, isFocused]);

    return (
        <Draggable 
        defaultClassName='absolute'
        position={{
            x: (position.x!) * zoomLevel || 0,
            y: (position.y!) * zoomLevel || 0
        }}
        onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}>
            <textarea
                onClick={onclick}
                style={{
                    color: fontColor,
                    fontSize: fontsize + 'px',
                    border: isFocused ? '2px dashed gray' : 'none',
                }}
                className='relative h-fit w-fit overflow-hidden z-20 bg-transparent outline-none resize-none rounded-md'
                ref={textAreaRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='Escreva aqui...'
            />
        </Draggable>
    );
};
