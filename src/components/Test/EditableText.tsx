import React, { useState } from 'react';

interface EditableTextProps {
    id: string;
    content: string;
    x: number;
    y: number;
    fontSize: number;
    onChange: (id: string, newContent: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({ id, content, x, y, fontSize, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(id, event.target.value); // Chama a função de callback passando o novo conteúdo
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <textarea
            value={content}
            style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                fontSize: `${fontSize}px`,
                border: isFocused ? '2px solid blue' : '1px solid gray', // Destaca a borda quando em foco
                background: 'none',
                resize: 'none',
                outline: 'none', // Evita a borda de foco padrão
            }}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
};

export default EditableText;
