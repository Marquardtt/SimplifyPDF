'use client'

import { useRouter } from "next/navigation"

export default function Homepage() {
    const router = useRouter();


    return (
        <>
            <div className="w-[70%] h-fit">
                <div className="flex justify-center items-center flex-col gap-32 ">
                    <div className="gap-10 flex flex-col items-center justify-center pt-32 dark:text-white w-[50%]">
                        <h1 className="text-4xl font-bold">Seja bem-vindo(a) ao SimplifyPDF!</h1>
                        <div className="flex justify-between rounded-md px-4 py-4 dark:bg-gray-500" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
                            <p className="text-center dark:text-white">SimplifyPDF é uma ferramenta desenvolvida para simplificar a maneira como você manipula seus arquivos PDFs na WEG.</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-[60%] flex flex-col gap-4">
                            <h1 className="text-center text-xl font-bold dark:text-white">Como utilizar nossas ferramentas?</h1>
                            <div className="flex flex-col justify-between gap-3 rounded-md px-4 py-4 dark:bg-gray-500" style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
                                <p className="text-center dark:text-white">Clique no botão localizado no canto superior esquerdo para expandir a barra lateral e acessar todas as funcionalidades disponíveis.</p>
                                <p className="text-center dark:text-white">Em breve, teremos mais novidades para você!</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center items-center w-full flex-col gap-4">
                        <h1 className="truncate text-xl font-bold dark:text-white ">Todas ferramentas disponíveis</h1>
                        <div className="flex gap-10">


                            <div onClick={() => (router.push('/merge'))} className="dark:bg-gray-500 dark:hover:bg-gray-600 hover:bg-gray-200 rounded-md duration-300 cursor-pointer flex flex-col gap-4 w-[6vw] h-[6vw]">
                                <div className="flex flex-col justify-around w-full h-full gap-3 rounded-md px-2 py-2 " style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
                                    <div className=" flex justify-center">
                                        <i className="pi pi-th-large dark:text-white" style={{ fontSize: 35 }}></i>
                                    </div>
                                    <p className="text-center dark:text-white">Agrupar PDFs</p>
                                </div>
                            </div>
                            <div onClick={() => (router.push('/enumerate'))} className="dark:bg-gray-500 dark:hover:bg-gray-600 hover:bg-gray-200 rounded-md duration-300 cursor-pointer flex flex-col gap-4 w-[6vw] h-[6vw]">
                                <div className="flex flex-col justify-around w-full h-full gap-3 rounded-md px-2 py-2 " style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
                                    <div className=" flex justify-center">
                                        <i className="pi pi-sort-numeric-up dark:text-white" style={{ fontSize: 35 }}></i>
                                    </div>
                                    <p className="text-center dark:text-white">Enumerar PDFs</p>
                                </div>
                            </div>
                            <div onClick={() => (alert("Página ainda em desenvolvimento\n\nUilize o editor da página de agrupar/enumerar PDFs."))} className="dark:bg-gray-500 dark:hover:bg-gray-600 hover:bg-gray-200 rounded-md duration-300 cursor-pointer flex flex-col gap-4 w-[6vw] h-[6vw]">
                                <div className="flex flex-col justify-around w-full h-full gap-3 rounded-md px-2 py-2 " style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}>
                                    <div className=" flex justify-center">
                                        <i className="pi pi-file-edit dark:text-white" style={{ fontSize: 35 }}></i>
                                    </div>
                                    <div>
                                        <p className="text-center dark:text-white">Editar PDFs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}