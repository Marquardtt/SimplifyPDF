import { PageContentComponent } from "@/components/PageContent";
import { GroupComponent } from "@/components/PageContent/components/Group";

export default function GroupPDF() {
    return (
        <div className="flex w-full h-full items-center justify-center">
            <PageContentComponent func={<GroupComponent />} />
        </div>
    )
}