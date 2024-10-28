import { motion } from "framer-motion"
import Image from "next/image";

interface IndexComponentProps {
    indexOpen: boolean;
    setIndexOpen: (open: boolean) => void;
    handlePageChange: (event: any) => void;
    pdfPagesUrls: string[];
}

export const IndexComponent = ({ indexOpen, setIndexOpen, handlePageChange, pdfPagesUrls }: IndexComponentProps) => {
    return (
        <motion.div
            onMouseLeave={() => setIndexOpen(false)}
            animate={{ width: indexOpen ? '20%' : '0%', opacity: indexOpen ? 1 : 0, display: indexOpen ? 'block' : 'none' }}
            className={`flex justify-center  absolute w-30 h-full bg-primary dark:bg-slate-600 z-30 left-0 overflow-hidden overflow-y-scroll`}>
            <div className="flex flex-col items-center my-10 px-5">
                <span className="pb-5">Sumário</span>
                <motion.div
                    className="flex flex-col gap-3 items-center h-full">
                    {pdfPagesUrls.map((url, index) => (
                        <motion.div
                            key={index}
                            onClick={() => (handlePageChange({ target: { value: index + 1 } } as any))}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                        ><Image width={300} height={300} alt="preview" className="p-10" key={index} src={url} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    )
}