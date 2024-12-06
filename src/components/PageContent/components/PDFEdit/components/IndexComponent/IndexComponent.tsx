import { motion } from "framer-motion"
import Image from "next/image";
import { useEffect } from "react";

interface IndexComponentProps {
    indexOpen: boolean;
    setIndexOpen: (open: boolean) => void;
    handlePageChange: (event: any) => void;
    pdfPagesUrls: string[];
}

export const IndexComponent = ({ indexOpen, setIndexOpen, handlePageChange, pdfPagesUrls }: IndexComponentProps) => {

    useEffect(() => {
        if (indexOpen) {
            const handleClickOutside = (event: MouseEvent) => {
                const sumarioElement = document.getElementById('sumario');
                if (event.target instanceof Node && !sumarioElement?.contains(event.target)) {
                    setIndexOpen(false);
                }
            }
    
            window.addEventListener('mousedown', handleClickOutside);
    
            return () => {
                window.removeEventListener('mousedown', handleClickOutside);
            }
        }
    }, [setIndexOpen, indexOpen]);

    return (
        <motion.div
            id="sumario"
            animate={{ width: indexOpen ? '20%' : '0%', opacity: indexOpen ? 1 : 0, display: indexOpen ? 'block' : 'none' }}
            className={`pt-5 flex justify-center absolute w-30 h-full bg-primary dark:bg-slate-600 z-30 left-0 overflow-hidden overflow-y-scroll`}>
            <div className="flex flex-col items-center px-5">
                <span className="py-10">Sumário</span>
                <motion.div
                    className="flex flex-col gap-3 items-center h-full">
                    {pdfPagesUrls.map((url, index) => (
                        <motion.div
                            className="cursor-pointer rounded-md"
                            key={index}
                            onClick={() => (handlePageChange({ target: { value: index + 1 } } as any), setIndexOpen(false))}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                        ><Image width={300} height={300} alt="preview" className="p-10" key={index} src={url} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    )
}