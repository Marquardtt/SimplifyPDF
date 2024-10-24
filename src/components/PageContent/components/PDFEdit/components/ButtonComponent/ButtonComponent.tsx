import { motion } from "framer-motion"
import { AnimationControls, TargetAndTransition, VariantLabels } from "framer-motion";

interface ButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
    icon?: string;
    color?: string;
    animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition;
    title?: string
}

export const ButtonComponent = ({ onClick, icon, color, animate, children, title }: ButtonProps) => {
    return (
        <motion.div
            title={title}
            animate={animate}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1, rotate: 1 }}
            className={`bg-primary dark:bg-slate-500 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${color != null ? `bg-[#E00B0B]` : "bg-primary"}`}
            onClick={() => onClick()}
        >
            {children != null ? children : <i className={`pi ${icon}`} style={{ color: "white" }}></i>}

        </motion.div>
    )
}