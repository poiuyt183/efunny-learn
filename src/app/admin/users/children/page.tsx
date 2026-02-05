import { getChildren } from "@/features/admin/queries";
import { PageHeader } from "../../components/page-header";
import { ChildrenTable } from "./components/children-table";

type SearchParams = Promise<{
    search?: string;
    grade?: string;
    spiritAnimal?: string;
    page?: string;
}>;

export default async function ChildrenPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const search = params.search;
    const grade = params.grade ? Number.parseInt(params.grade) : undefined;
    const spiritAnimal = params.spiritAnimal;
    const page = params.page ? Number.parseInt(params.page) : 1;

    const data = await getChildren({
        search,
        grade,
        spiritAnimal,
        page,
    });

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Children Management"
                description="View and manage student profiles"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "User Management" },
                    { label: "Children" },
                ]}
            />

            <ChildrenTable data={data.children} pagination={data.pagination} />
        </div>
    );
}
