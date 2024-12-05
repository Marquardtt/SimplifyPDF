import { motion } from "framer-motion"
import { AnimationControls, TargetAndTransition, VariantLabels } from "framer-motion";
import { useEffect } from "react";

interface ButtonProps {
    onClick: (e:any) => void;
    children?: React.ReactNode;
    icon?: string;
    color?: string;
    animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition;
    title?: string
    bg?: string
}

export const ButtonComponent = ({ onClick, icon, color, animate, children, title, bg }: ButtonProps) => {

    return (
        <motion.div
            id={title}
            title={title}
            animate={animate}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1, rotate: 1 }}
            className={` dark:bg-slate-500 w-9 h-9  rounded-full flex justify-center items-center cursor-pointer ${bg != null ? `${bg}` : "bg-primary"}`}
            onClick={(e) => onClick(e)}
        >
            {children != null ? children : <i id={title} className={`pi ${icon}`} style={{ color: "white" }}></i>}

        </motion.div>
    )
}