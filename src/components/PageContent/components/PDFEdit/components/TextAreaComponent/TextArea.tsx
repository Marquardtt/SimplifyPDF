import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

interface TextAreaComponentProps {
    x: number;
    y: number;
    zoomLevel: number;
    onTextSubmit: (text: string) => void;
    fontsize?: number;
    fontColor?: string;
    onclick?: () => void;
    editableText?: string;
}

export const TextAreaComponent: React.FC<TextAreaComponentProps> = ({ x, y, zoomLevel, onTextSubmit, fontsize, fontColor, onclick, editableText}) => {
    const [isFocused, setIsFocused] = useState(true); 
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
        <Draggable defaultPosition={{ x: x * zoomLevel, y: y * zoomLevel }}>
            <textarea
                onClick={onclick}
                style={{
                    color: fontColor,
                    fontSize: fontsize + 'px',
                    border: isFocused ? '2px dashed gray' : 'none',
                }}
                className='absolute overflow-hidden z-20 bg-transparent outline-none resize-none rounded-md'
                ref={textAreaRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='Escreva aqui...'
            />
        </Draggable>
    );
};