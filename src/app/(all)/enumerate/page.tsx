import { PageContentComponent } from "@/components/PageContent";
import { EnumerateComponent } from "@/components/PageContent/components/Enumerate";

export default function GroupPDF() {
    return (
        <div className="flex items-center justify-center">
            <PageContentComponent func={<EnumerateComponent />} />
        </div>
    )
}