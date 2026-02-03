"use client";

import { useState, useEffect } from "react";
import { searchTutors } from "@/features/tutor/actions/tutor-actions";
import { TutorFilters } from "@/features/tutor/components/TutorFilters";
import { TutorCard } from "@/features/tutor/components/TutorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search } from "lucide-react";

type Tutor = {
    id: string;
    subjects: string[];
    grades: number[];
    hourlyRate: number;
    bio: string;
    rating: number;
    totalSessions: number;
    verified: boolean;
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
};

export default function TutorsPage() {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    const loadTutors = async (filters?: any) => {
        setLoading(true);
        setError(undefined);

        const result = await searchTutors(filters);

        if (result.success && result.data) {
            setTutors(result.data as Tutor[]);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadTutors();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Tìm gia sư</h1>
                <p className="text-muted-foreground">
                    Khám phá và kết nối với gia sư phù hợp cho con bạn
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <TutorFilters onFilterChange={loadTutors} />
                </div>

                {/* Tutors List */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-48 w-full" />
                            ))}
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : tutors.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Không tìm thấy gia sư
                            </h3>
                            <p className="text-muted-foreground">
                                Thử điều chỉnh bộ lọc để xem thêm kết quả
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground mb-4">
                                Tìm thấy {tutors.length} gia sư
                            </div>
                            {tutors.map((tutor) => (
                                <TutorCard key={tutor.id} tutor={tutor} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
