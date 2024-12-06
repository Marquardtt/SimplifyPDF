"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import 'primeicons/primeicons.css';

export function HeaderComponent() {
    const [theme, setTheme] = useState<string>('light');
    const [hover, setHover] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const router = useRouter();
    const sideBarRef = useRef<HTMLDivElement>(null);

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
    };

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setTheme('light');
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sideBarRef.current && !sideBarRef.current.contains(e.target as Node)) {
                setHover(false);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div ref={sideBarRef}>
            <div style={{ color: "white" }} className={`font-montserrat flex items-center justify-between text-xl px-5 w-full dark:bg-black bg-primary h-[6%] fixed left-0 top-0 z-20`}>
                <span style={{ fontSize: 25 }} onClick={() => setHover(!hover)} className="cursor-pointer"><i className="pi pi-bars"></i></span>
                <div className="w-fit">
                    <motion.span
                        onClick={() => {router.push('/'), setHover(false)}}
                        className="flex justify-center font-bold text-center cursor-pointer">SimplifyPDF</motion.span>
                </div>
                <span style={{ fontSize: 25 }} onClick={() => handleTheme()} className=" cursor-pointer"><i className={` ${theme == 'dark' ? "pi pi-moon" : "pi pi-sun"}`}></i></span>
            </div>
            <motion.div
                transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.5 }}
                animate={{ width: hover ? "220px" : "" }}
                className="font-montserrat overflow-hidden text-white fixed h-full bg-primary dark:bg-black z-10"
            >
                <div className="px-5 flex gap-4 justify-around absolute top-20">
                    <div>
                        <i className="pi pi-wrench" style={{ color: "white", fontSize: 20 }}></i>
                    </div>
                    <motion.div
                        animate={{ opacity: hover ? "100%" : "0%", display: hover ? "" : "none" }}
                        className="flex flex-col justify-center gap-4 pb-2">
                        <div onClick={() => setShow(!show)} className="flex  gap-5 items-center  cursor-pointer">
                            <span className="w-fit h-fit ">Ferramentas</span>
                            <motion.i
                                className="w-fit h-fit pi pi-angle-up"
                                animate={{ rotate: show ? 0 : -180 }}>
                            </motion.i>
                        </div>
                        <motion.div className={`flex flex-col gap-3 w-full  ${hover && show ? "block" : "none"}`} animate={{ opacity: show ? "100%" : "0%", display: show ? "" : "none" }}>
                            <motion.div
                                animate={{}}
                                onClick={() => (router.push('/merge'), setHover(false))} className="gap-2 flex items-center text-sm cursor-pointer"><i className=" pi pi-th-large" style={{ fontSize: 15 }}></i><span className="">Agrupar PDFs</span></motion.div>
                            <motion.div onClick={() => (router.push('/enumerate'), setHover(false))} className="gap-2  flex items-center text-sm cursor-pointer"><i className="pi pi-sort-numeric-up" style={{ fontSize: 15 }}></i><span className="">Enumerar PDFs</span></motion.div>
                            <motion.div onClick={() => (router.push('/edit'), setHover(false))} className="gap-2 flex items-center text-sm cursor-pointer"><i className="pi pi-file-edit" style={{ fontSize: 15 }}></i><span className="">Editar PDFs</span></motion.div>
                        </motion.div>
                    </motion.div>
                </div>
                <div className="px-5 flex gap-4 justify-around absolute bottom-5"
                    onClick={() => { }} >
                    <div>
                        <i className="pi pi-cog" style={{ color: "white", fontSize: 20 }}></i>
                    </div>
                    <motion.div
                        animate={{ opacity: hover ? "100%" : "0%" }}
                        className="flex flex-col justify-center gap-4 ">
                        <div onClick={() => (alert("Página ainda em desenvolvimento"))} className="flex items-center gap-6 cursor-pointer">
                            <span>Configurações</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
