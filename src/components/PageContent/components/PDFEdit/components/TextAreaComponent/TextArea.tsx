import React, { useEffect, useRef, useState } from 'react';

interface TextAreaComponentProps {
    x: number;
    y: number;
    zoomLevel: number;
    onTextSubmit: (text: string) => void;
    fontsize?: number;
    fontColor?: string;
}

export const TextAreaComponent: React.FC<TextAreaComponentProps> = ({ x, y, zoomLevel, onTextSubmit, fontsize, fontColor }) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleBlur = () => {
        if (textAreaRef.current) {
            onTextSubmit(textAreaRef.current.value);
        }
    };

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && textAreaRef.current) {
                e.preventDefault()
                onTextSubmit(textAreaRef.current.value);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onTextSubmit]);

    return (

        <textarea
            style={{
                color: fontColor,
                fontSize: fontsize+'px',
                left: `${x * zoomLevel}px`,
                top: `${y * zoomLevel}px`,
            }}
            className='absolute overflow-hidden z-20 border-2 border-dashed  p-0 m-0 w-60 h-auto bg-transparent outline-none resize-none rounded-md'
            ref={textAreaRef}
            onBlur={handleBlur}
            placeholder='Escreva aqui...'
        />
    );
};