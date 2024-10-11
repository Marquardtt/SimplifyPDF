"use client"

import { useRouter } from "next/navigation"
import 'primeicons/primeicons.css';
import { useEffect, useState } from "react";

export function HeaderComponent() {
    const [theme, setTheme] = useState<string>('light');

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
    },[])

    return (
        <div className="dark:bg-black bg-[#0d6efd] w-full h-[7%] fixed grid grid-cols-2 items-center z-10">
            <div className="flex">
                <div className="w-fit h-full flex items-center mx-10">
                    <span className="text-white text-2xl cursor-pointer">Simplify PDF</span>
                </div>
                <div className="w-fit h-full flex items-center mx-10">

                </div>
            </div>
            <div className="gap-10 flex items-center h-full justify-end mx-10">
                <span onClick={() => handleTheme()} className="text-white text-2xl cursor-pointer"><i className={` ${theme == 'dark' ? "pi pi-moon" : "pi pi-sun"}`}></i></span>
            </div>
        </div>
    )
}