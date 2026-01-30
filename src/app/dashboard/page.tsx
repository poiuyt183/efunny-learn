import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { authClient } from "@/lib/auth-client";
import { SignoutButton } from "@/features/auth/components/signout-button";

export default async function ParentDashboard() {
  const session = await requireAuth();

  // Check if user is parent
  if (session.user.role !== "PARENT") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Xin chào, {session.user.name}!
            </h1>
            <SignoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Children Management */}
          <Link
            href="/children"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">👶</span>
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">
                Quản lý con
              </h2>
            </div>
            <p className="text-gray-600">Tạo và quản lý profiles cho các bé</p>
          </Link>

          {/* Subscription */}
          <Link
            href="/subscription"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-2xl">💳</span>
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">
                Gói đăng ký
              </h2>
            </div>
            <p className="text-gray-600">Quản lý gói subscription của bạn</p>
          </Link>

          {/* Find Tutors */}
          <Link
            href="/tutors"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">
                Tìm gia sư
              </h2>
            </div>
            <p className="text-gray-600">Kết nối với gia sư phù hợp</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê nhanh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-gray-600 mt-1">Profiles trẻ</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">FREE</p>
              <p className="text-gray-600 mt-1">Gói hiện tại</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-gray-600 mt-1">Buổi học đã đặt</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
