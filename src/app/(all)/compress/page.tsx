'use client'

import { PageContentComponent } from "@/components/PageContent";
import { CompressComponent } from "@/components/PageContent/components/Compress";

export default function CompressPDF() {
    return (
        <div className="flex w-full h-full items-center justify-center">
            <PageContentComponent func={<CompressComponent />} />
        </div>
    )
}
