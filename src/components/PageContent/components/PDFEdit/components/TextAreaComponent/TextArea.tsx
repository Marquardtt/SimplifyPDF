import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

interface TextAreaComponentProps {
    x?: number;
    y?: number;
    zoomLevel: number;
    onTextSubmit: (text: string) => void;
    fontsize?:() => string;
    fontColor?: string;
    onclick?: () => void;
    editableText?: string;
    drawingRef?: any;
}

export const TextAreaComponent: React.FC<TextAreaComponentProps> = ({ drawingRef, x, y, zoomLevel, onTextSubmit, fontsize, fontColor, onclick, editableText }) => {
    const [isFocused, setIsFocused] = useState(true);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [position, setPosition] = useState({ x: x, y: y });
    const [resize, setResize] = useState({w: 40, h:40});

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const textConfigElement = document.getElementById('textConfig');

        if (
            textConfigElement?.contains(e.relatedTarget as Node) ||
            textAreaRef.current?.contains(e.relatedTarget as Node)
        ) {
            return;
        }
    
        setIsFocused(false); 
        onTextSubmit(textAreaRef.current?.value || '');
    };
    
    const handleClickOutside = () => {
        setIsFocused(true); 
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

    const handleResize = () => {
        if (textAreaRef.current) {
            setResize({
                w: textAreaRef.current.offsetWidth,
                h: textAreaRef.current.offsetHeight,
            });
        }
    };

    useEffect(() => {
        if (textAreaRef.current) {
            const observer = new ResizeObserver(() => handleResize());
            observer.observe(textAreaRef.current);

            return () => observer.disconnect();
        }
    }, []);

    return (
        <Draggable 
        defaultClassName='absolute'
        position={{
            x: (position.x!) * zoomLevel || 0,
            y: (position.y!) * zoomLevel || 0
        }}
        onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}>
            <textarea
                onClick={() => (onclick?.(), handleClickOutside())}
                style={{
                    color: fontColor,
                    fontSize: fontsize + 'px',
                    border: isFocused ? '2px dashed gray' : 'none',
                    width: resize.w + 'px',
                    height: resize.h + 'px',
                }}
                
                className='relative overflow-hidden z-20 bg-transparent outline-none resize rounded-md'
                ref={textAreaRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='Escreva aqui...'
            />
        </Draggable>
    );
};
