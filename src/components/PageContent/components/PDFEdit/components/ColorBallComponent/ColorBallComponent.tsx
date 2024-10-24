import { motion } from "framer-motion"

interface ColorBallProps {
    onClick: () => void;
    color: string[];
}

export const ColorBallComponent = ({ onClick, color }: ColorBallProps) => {
    return (
        <>
            {color.map((c, index) => (
                <motion.div
                    key={c}
                    onClick={onClick}
                    style={{ backgroundColor: color[index] }}
                    className="w-5 h-5 rounded-full cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                />
            ))}

        </>
    )
}