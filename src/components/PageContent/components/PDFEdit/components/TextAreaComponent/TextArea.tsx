import React, { useContext, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { DrawingsContext } from '@/contexts/DrawingsContext';

interface TextAreaComponentProps {
    x?: number;
    y?: number;
    zoomLevel: number;
    onTextSubmit: (text: string) => void;
    fontsize?: () => string;
    fontColor?: string;
    onclick?: () => void;
    editableText?: string;
    drawingRef: any;
    canvasElement: any;
}

export const TextAreaComponent: React.FC<TextAreaComponentProps> = ({canvasElement, drawingRef, x, y, zoomLevel, onTextSubmit, fontsize, fontColor, onclick, editableText }) => {
    const [isFocused, setIsFocused] = useState(true);
    const textAreaRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: x, y: y });
    const [resize, setResize] = useState({ w: 120, h: 40 });
    const { drawings, setDrawings } = useContext(DrawingsContext);
    const rect = drawingRef.current.getBoundingClientRect();

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const textConfigElement = document.getElementById('textConfig');

        if (
            textConfigElement?.contains(e.relatedTarget as Node) ||
            textAreaRef.current?.contains(e.relatedTarget as Node)
        ) {
            return;
        }

        setIsFocused(false);
        onTextSubmit(textAreaRef.current?.innerText || '');
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
                onTextSubmit(textAreaRef.current!.innerText);
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
            textAreaRef.current.innerText = editableText || "";
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

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = drawingRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoomLevel;
        const y = (e.clientY - rect.top) / zoomLevel;
        setPosition({ x, y });
    };


    useEffect(() => {
        const canvasElement = drawingRef.current; 
        if (!canvasElement) return;

        canvasElement.addEventListener('click', handleCanvasClick);

        return () => {
            canvasElement.removeEventListener('click', handleCanvasClick);
        };
    }, [drawingRef, zoomLevel]);


    useEffect(() => {
        if (textAreaRef.current) {
            const observer = new ResizeObserver(() => handleResize());
            observer.observe(textAreaRef.current);

            return () => observer.disconnect();
        }
    }, []);

    return (
        <Draggable
            defaultClassName="absolute"
            position={{
                x: position.x! - (canvasElement.getBoundingClientRect().left - rect.left) / zoomLevel,
                y: position.y! - (canvasElement.getBoundingClientRect().top - rect.top) / zoomLevel,
            }}
            onDrag={(e, data) =>
                setPosition({
                    x: data.x / zoomLevel,
                    y: data.y / zoomLevel,
                })
            }>
            <div
                onClick={() => (onclick?.(), handleClickOutside())}
                className="relative overflow-hidden z-20 bg-transparent outline-none rounded-md w-fit"
                contentEditable
                style={{
                    resize: 'both',
                    overflow: 'hidden',
                    color: fontColor,
                    fontSize: fontsize + 'px',
                    border: isFocused ? '2px dashed gray' : 'none',
                    width: resize.w + 'px',
                    height: resize.h + 'px',
                }}

                ref={textAreaRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
            >

            </div>
        </Draggable>
    );
};
