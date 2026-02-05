import { getTutors } from "@/features/admin/queries";
import { PageHeader } from "../../components/page-header";
import { TutorsTable } from "./components/tutors-table";

type SearchParams = Promise<{
    search?: string;
    verified?: string;
    subject?: string;
    filter?: string;
    page?: string;
}>;

export default async function TutorsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const search = params.search;
    const subject = params.subject;
    const page = params.page ? Number.parseInt(params.page) : 1;

    // Handle filter shortcuts (e.g., from dashboard "View Pending")
    const filter = params.filter;
    const verified =
        filter === "pending" ? false : params.verified === "true" ? true : undefined;

    const data = await getTutors({
        search,
        verified,
        subject,
        page,
    });

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Tutors Management"
                description="View and verify tutor accounts"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "User Management" },
                    { label: "Tutors" },
                ]}
            />

            <TutorsTable data={data.tutors} pagination={data.pagination} />
        </div>
    );
}
