import { useRouter } from "next/navigation"

export function HeaderComponent() {
    const router = useRouter()

    //terminar o dark mode

    return (
        <div className="bg-black w-full h-[7%] fixed grid grid-cols-2 items-center ">
            <div className="w-fit h-full flex items-center mx-10" onClick={() => router.push('')}>
                <span className="text-white text-2xl cursor-pointer">Simplify PDF</span>
            </div>
            <div className="gap-10 flex items-center h-full justify-end mx-10">
                <span className="text-white text-2xl cursor-pointer">?</span>
                <span className="text-white text-2xl cursor-pointer">?</span>
            </div>
        </div>
    )
}