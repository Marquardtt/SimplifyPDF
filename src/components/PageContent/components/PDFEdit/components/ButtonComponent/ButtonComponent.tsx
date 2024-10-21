import { motion } from "framer-motion"
import { AnimationControls, TargetAndTransition, VariantLabels } from "framer-motion";

interface ButtonProps {
    onClick: () => void;
    icon: string;
    color?: string;
    animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition;
}

export const ButtonComponent = ({ onClick, icon, color, animate}: ButtonProps) => {
    return (
        <motion.div
            animate={animate}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1, rotate: 1 }}
            className={`bg-primary dark:bg-slate-600 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer ${color !=null ? `bg-[#E00B0B]` : "bg-primary"}`}
            onClick={() => onClick()}
        >
            <i className={`pi ${icon}`} style={{ color: "white" }}></i>
        </motion.div>
    )
}