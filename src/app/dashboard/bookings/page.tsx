import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBookings } from "@/features/bookings/actions/booking-actions";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function BookingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const result = await getBookings();

    if (!result.success || !result.data) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Alert variant="destructive">
                    <AlertDescription>
                        {result.error || "Không thể tải danh sách lịch học"}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const bookings = result.data;

    const upcomingBookings = bookings.filter(
        (b) =>
            new Date(b.scheduledAt) > new Date() &&
            (b.status === "PENDING" || b.status === "CONFIRMED")
    );

    const pastBookings = bookings.filter(
        (b) =>
            new Date(b.scheduledAt) <= new Date() ||
            b.status === "COMPLETED" ||
            b.status === "CANCELLED" ||
            b.status === "REFUNDED"
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Lịch học</h1>
                <p className="text-muted-foreground">
                    Quản lý các buổi học đã đặt với gia sư
                </p>
            </div>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Chưa có lịch học nào
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Hãy tìm và đặt lịch với gia sư phù hợp
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="upcoming" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="upcoming">
                            Sắp tới ({upcomingBookings.length})
                        </TabsTrigger>
                        <TabsTrigger value="past">
                            Đã qua ({pastBookings.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4">
                        {upcomingBookings.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    Không có lịch học sắp tới
                                </CardContent>
                            </Card>
                        ) : (
                            upcomingBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-4">
                        {pastBookings.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    Chưa có lịch học nào trong quá khứ
                                </CardContent>
                            </Card>
                        ) : (
                            pastBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
