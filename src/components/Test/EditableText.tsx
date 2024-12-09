import React, { useState, useEffect } from 'react';

interface EditableTextProps {
    id: string;
    content: string;
    x: number;
    y: number;
    fontSize: number;
    onChange: (id: string, newContent: string) => void;
    containerRef: React.RefObject<HTMLDivElement>; // Ref para o contêiner do canvas
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

    // Função para calcular a largura do texto
    const calculateTextWidth = () => {
        const containerOffset = containerRef.current?.getBoundingClientRect();
        return containerOffset ? containerOffset.width - x : 0; // Calcula largura com base na posição X
    };

    useEffect(() => {
        setTextWidth(calculateTextWidth());
    }, [x]); // Recalcula a largura do texto se a posição mudar

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(id, event.target.value); // Atualiza o conteúdo do texto
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        e.target.style.border = '1px solid blue';
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        e.target.style.border = 'none';
    };

    // Ajusta as coordenadas para considerar o contêiner
    const containerOffset = containerRef.current?.getBoundingClientRect();
    const adjustedX = x;
    const adjustedY = y;

    return (
        <textarea
            value={content}
            style={{
                position: 'absolute',
                left: `${adjustedX}px`,
                top: `${adjustedY}px`,
                width: `${textWidth}px`, // Largura ajustada conforme o espaço disponível
                fontSize: `${fontSize}px`,
                background: 'none',
                resize: 'none',
                outline: 'none',
                wordWrap: 'break-word', // Permite a quebra de linha dentro do textarea
                whiteSpace: 'pre-wrap', // Mantém os espaços em branco e quebras de linha
            }}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
};

export default EditableText;
