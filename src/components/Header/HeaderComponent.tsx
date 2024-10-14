"use client"

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import 'primeicons/primeicons.css';
import { useOption } from "@/contexts/PageContentContext";

export function HeaderComponent() {
    const [theme, setTheme] = useState<string>('light');
    const [hover, setHover] = useState<boolean>(false);
    const router = useRouter();
    const { setOption } = useOption();

    const handleTheme = () => {
        const htmlElement = document.documentElement;
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            setTheme('light');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.classList.add('dark');
            setTheme('dark');
            localStorage.setItem('theme', 'dark');
        }
    }

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setTheme('light');
        }
    }, [])

    return (
        <div className="dark:bg-black bg-[#0d6efd] w-full h-[7%] fixed grid grid-cols-2 items-center z-10">
            <div className="flex items-center">
                <div 
                onClick={() => router.push('/')}
                className="w-fit h-full flex items-center mx-10">
                    <span className="text-white text-2xl cursor-pointer">Simplify PDF</span>
                </div>
                <div

                    className="flex flex-col justify-center relative h-full w-fit"
                >
                    <div className=" h-full w-full">
                        <motion.div
                            onMouseOver={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            className="w-full h-full items-center mx-8">
                            <span className=" text-white text-md cursor-pointer flex items-center gap-2">
                                Ferramentas
                                <motion.i
                                    animate={{ rotate: hover ? 180 : 0 }}
                                    className="pi pi-angle-up">
                                </motion.i></span>
                        </motion.div>
                        <motion.div
                            onMouseOver={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            animate={{ height: hover ? "13rem" : "0rem" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ transformOrigin: "left" }}
                            className="bg-primary dark:bg-black w-full h-full rounded-md absolute flex flex-col justify-around items-center">
                            <motion.span
                                onClick={() => { if (setOption) (setOption('enum'), (router.push('/enumerate'))) }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                animate={{ opacity: hover ? 1 : 0, transition: { duration: 0.3 } }}
                                className="overflow-hidden text-nowrap text-white text-sm  cursor-pointer"
                            >Enumerar PDFs
                            </motion.span>
                            <motion.span
                                onClick={() => { if (setOption) (setOption('merge'), (router.push('/merge'))) }}
                                animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : -10, transition: { duration: 0.3 } }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="overflow-hidden text-nowrap text-white text-sm  cursor-pointer"
                            >Agrupar PDFs
                            </motion.span>
                            <motion.span
                                animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : -10, transition: { duration: 0.3 } }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="overflow-hidden text-nowrap text-white text-sm  cursor-pointer"
                            >Editar PDFs
                            </motion.span>
                        </motion.div>
                    </div>
                </div>
            </div>
            <div className="gap-10 flex items-center h-full justify-end mx-10">
                <span onClick={() => handleTheme()} className="text-white text-2xl cursor-pointer"><i className={` ${theme == 'dark' ? "pi pi-moon" : "pi pi-sun"}`}></i></span>
            </div>
        </div>
    )

}