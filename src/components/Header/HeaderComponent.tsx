"use client"

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import 'primeicons/primeicons.css';

export function HeaderComponent() {
    const [theme, setTheme] = useState<string>('light');
    const [hover, setHover] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const router = useRouter();

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
        <>
            <div style={{ color: "white" }} className={`flex items-center justify-between text-xl px-6 w-full dark:bg-black bg-primary h-[6%] fixed left-0 top-0 z-20`}>
                <motion.span
                    onClick={() => router.push('/')}
                    className="text-center cursor-pointer">SimplifyPDF</motion.span>
                <span style={{ fontSize: 25 }} onClick={() => handleTheme()} className=" cursor-pointer"><i className={` ${theme == 'dark' ? "pi pi-moon" : "pi pi-sun"}`}></i></span>
            </div>
            <div
                className="text-white font-montserrat"
                onMouseOver={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div
                    className=" w-[3%] dark:bg-black bg-primary h-full fixed left-0 top-0 grid grid-rows-2 z-10 "
                >
                    <div
                        className="w-full flex flex-col items-center gap-10 py-5">
                        <div className="flex gap-4 justify-around absolute top-20 left-5">
                            <div>
                                <i className="pi pi-wrench" style={{ color: "white", fontSize: 20 }}></i>
                            </div>
                            <motion.div
                                animate={{ opacity: hover ? "100%" : "0%", display: hover ? "" : "none" }}
                                className="flex flex-col justify-center gap-4 ">
                                <div onClick={() => setShow(!show)} className="flex  gap-5 items-center  cursor-pointer">
                                    <span className="w-fit h-fit">Ferramentas</span>
                                    <motion.i
                                        className="w-fit h-fit pi pi-angle-up"
                                        animate={{ rotate: show ? 0 : -180 }}>
                                    </motion.i>
                                </div>
                                <motion.div className={`flex flex-col gap-3 w-full ${hover && show ? "block" : "none"}`} animate={{ opacity: show ? "100%" : "0%" }}>
                                    <div onClick={() => (router.push('/merge'))} className="gap-2 flex items-center text-sm cursor-pointer"><i className=" pi pi-th-large" style={{ fontSize: 15 }}></i><span className="">Agrupar PDFs</span></div>
                                    <div onClick={() => (router.push('/enumerate'))} className="gap-2  flex items-center text-sm cursor-pointer"><i className="pi pi-sort-numeric-up" style={{ fontSize: 15 }}></i><span className="">Numerar PDFs</span></div>
                                    <div onClick={() => (router.push('/edit'))} className="gap-2 flex items-center text-sm cursor-pointer"><i className="pi pi-cog" style={{ fontSize: 15 }}></i><span className="">Editar PDFs</span></div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-around absolute bottom-5 left-5"
                        onClick={() => { }} >
                        <div>
                            <i className="pi pi-cog" style={{ color: "white", fontSize: 20 }}></i>
                        </div>
                        <motion.div
                            animate={{ opacity: hover ? "100%" : "0%" }}
                            className="flex flex-col justify-center gap-4 ">
                            <div className="flex items-center gap-6 cursor-pointer">
                                <span>Configurações</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <motion.div

                    transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.5 }}
                    animate={{ width: hover ? "11%" : "0%" }}
                    className="absolute h-full bg-primary dark:bg-black "
                >
                </motion.div>
            </div>
        </>
    )
}

{/*  */ }
