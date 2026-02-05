import { getParents } from "@/features/admin/queries";
import { PageHeader } from "../../components/page-header";
import { ParentsTable } from "./components/parents-table";

type SearchParams = Promise<{
    search?: string;
    tier?: string;
    page?: string;
}>;

export default async function ParentsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const search = params.search;
    const tier = params.tier;
    const page = params.page ? Number.parseInt(params.page) : 1;

    const data = await getParents({
        search,
        tier,
        page,
    });

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Parents Management"
                description="View and manage parent accounts"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "User Management" },
                    { label: "Parents" },
                ]}
            />

            <ParentsTable data={data.parents} pagination={data.pagination} />
        </div>
    );
}
