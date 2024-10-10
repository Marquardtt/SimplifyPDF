import 'primeicons/primeicons.css';

export function FooterComponent() {

    return (
        <div className="text-white dark:bg-black bg-[#0d6efd] flex flex-col items-center justify-center w-full gap-1 min-h-20">
            <i onClick={() => window.open('https://github.com/Marquardtt')} className="pi pi-github cursor-pointer"><span className="font-sans"> @Marquardtt</span></i>
            <div className="w-36 h-[1px] bg-white"></div>
            <span className="font-sans text-[12px]">© 08/10/2024</span>
        </div>
    )
}