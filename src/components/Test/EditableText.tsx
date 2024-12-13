import React, { useState, useEffect } from 'react';

interface EditableTextProps {
    id: string;
    content: string;
    x: number;
    y: number;
    fontSize: number;
    onChange: (id: string, newContent: string) => void;
    containerRef: React.RefObject<HTMLDivElement>; 
}

const EditableText: React.FC<EditableTextProps> = ({
    id,
    content,
    x,
    y,
    fontSize,
    onChange,
    containerRef,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [textWidth, setTextWidth] = useState(0);

    const calculateTextWidth = () => {
        const containerOffset = containerRef.current?.getBoundingClientRect();
        return containerOffset ? containerOffset.width - x : 0; 
    };

    useEffect(() => {
        setTextWidth(calculateTextWidth());
    }, [x]); 

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(id, event.target.value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        e.target.style.border = '1px solid blue';
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        e.target.style.border = 'none';
    };

    // const containerOffset = containerRef.current?.getBoundingClientRect();
    const adjustedX = x;
    const adjustedY = y;

    return (
        <textarea
            value={content}
            style={{
                position: 'absolute',
                left: `${adjustedX}px`,
                top: `${adjustedY}px`,
                width: `${textWidth}px`, 
                fontSize: `${fontSize}px`,
                background: 'none',
                resize: 'none',
                outline: 'none',
                wordWrap: 'break-word', 
                whiteSpace: 'pre-wrap', 
            }}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
};

export default EditableText;
