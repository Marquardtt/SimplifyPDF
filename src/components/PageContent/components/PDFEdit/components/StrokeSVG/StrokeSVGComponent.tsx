interface StrokeSVGProps {
    colorSelected: string;
    colorSize: number;
}

export const StrokeSVGComponent = ({ colorSelected, colorSize }: StrokeSVGProps) => {
    return (
        <svg
            style={{ display: "block", margin: "0 auto", transform: "scale(0.8)" }}
            width="200"
            height="40"
            viewBox="0 0 150 40"
            preserveAspectRatio="xMidYMid meet"
        >
            <path

                d="M0,20 Q25,0 50,20 T100,20 T150,20"
                strokeLinecap="round"
                stroke={colorSelected}
                strokeWidth={colorSize}
                fill="transparent"
            />
        </svg>
    )
}