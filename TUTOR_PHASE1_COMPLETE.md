# Tutor Onboarding & Profile - Documentation

## ✅ Đã hoàn thành

### 1. Server Actions (`src/features/tutor/actions/tutor-actions.ts`)

#### Functions:
- **`createTutorProfile(input)`** - Đăng ký hồ sơ gia sư mới
  - Validate dữ liệu đầu vào
  - Kiểm tra user đã có hồ sơ chưa
  - Cập nhật role user thành TUTOR
  - Tạo profile với trạng thái chờ xác minh
  
- **`updateTutorProfile(input)`** - Cập nhật hồ sơ gia sư
  - Validate dữ liệu
  - Cập nhật thông tin profile
  
- **`getTutorProfile()`** - Lấy thông tin hồ sơ hiện tại
  - Include thông tin user
  
- **`checkIsTutor()`** - Kiểm tra user có phải gia sư không
  - Trả về: isTutor, hasProfile, isVerified
  
- **`getTutorStats()`** - Lấy thống kê gia sư
  - Tổng số buổi dạy
  - Tổng thu nhập
  - Thu nhập tháng này
  - Số buổi dạy tháng này
  - Đánh giá

#### Validation Schema:
```typescript
- subjects: min 1 môn học
- grades: min 1 khối lớp  
- hourlyRate: 50,000 - 1,000,000 VND
- bio: 100-1000 ký tự
- bankAccount: optional
```

---

### 2. Setup Page (`src/app/tutor/setup/page.tsx`)

#### Features:
- Kiểm tra authentication
- Redirect nếu đã có profile
- Hiển thị lợi ích khi tham gia
- Form đăng ký gia sư

#### Benefits Display:
- Tự chủ thời gian
- Báo cáo AI chi tiết
- Match thông minh
- Thanh toán minh bạch
- Hỗ trợ 24/7
- Xây dựng danh tiếng

---

### 3. Dashboard Page (`src/app/tutor/dashboard/page.tsx`)

#### Sections:
1. **Header**
   - Avatar, tên, email
   - Badge xác minh/chờ xác minh

2. **Stats Overview (4 Cards)**
   - Tổng buổi dạy
   - Tổng thu nhập
   - Thu nhập tháng này
   - Đánh giá

3. **Tabs**
   - **Profile**: Form cập nhật hồ sơ
   - **Schedule**: Lịch dạy (coming soon)
   - **Students**: Học sinh (coming soon)
   - **Earnings**: Thu nhập & rút tiền (coming soon)

---

### 4. UI Components

#### `TutorSetupForm.tsx`
- Form đăng ký gia sư hoàn chỉnh
- Multi-select môn học (9 môn)
- Multi-select khối lớp (12 khối)
- Input học phí với preview thu nhập thực (sau trừ 20%)
- Textarea giới thiệu (100-1000 ký tự counter)
- Optional bank account input
- Loading state khi submit

#### `TutorProfileForm.tsx`
- Form cập nhật profile (tương tự setup form)
- Hiển thị trạng thái xác minh
- Support pre-fill dữ liệu từ profile hiện tại

#### `TutorCard.tsx`
- Display tutor info trong list
- Avatar, tên, verified badge
- Rating & số buổi dạy
- Subjects badges
- Grades range
- Bio preview (2 lines)
- Hourly rate highlight
- Actions: Xem chi tiết, Đặt lịch

#### `TutorStatsDisplay.tsx`
- Grid 4 cột hiển thị stats
- Format số tiền (compact notation)
- Rating với star icon

#### `TutorFiltersPanel.tsx`
- Filter by môn học
- Filter by khối lớp
- Filter by price range (min-max)
- Toggle verified only
- Active filters display với badges
- Clear all filters button

---

### 5. tRPC Routes (`src/trpc/routers/tutor.ts`)

#### Queries:

**`tutor.getAll(filters)`**
- Pagination với cursor
- Filter: subject, grade, minRate, maxRate, verifiedOnly
- Sort by rating & totalSessions
- Include user info

**`tutor.getById(id)`**
- Chi tiết tutor
- Include user & recent completed bookings

**`tutor.getStats(tutorId)`**
- Thống kê chi tiết
- Calculate earnings (total & this month)
- Session counts

**`tutor.search(query)`**
- Search by name hoặc subjects
- Case insensitive
- Limit results

**`tutor.getRecommended(childId)`**
- Gợi ý gia sư cho trẻ
- Match by grade
- Prioritize favorite subjects từ AI analysis
- Chỉ verified tutors

**`tutor.getAvailability(tutorId, dateRange)`**
- Lấy lịch đã booking
- Filter by pending/confirmed status

---

## 🎯 User Flow

### Onboarding Flow:
1. User login/register
2. Navigate to `/tutor/setup`
3. Fill form (subjects, grades, rate, bio, bank)
4. Submit → Create profile với `verified: false`
5. Update user role to TUTOR
6. Redirect to `/tutor/dashboard`
7. Chờ admin xác minh (1-2 ngày)

### Profile Management Flow:
1. Tutor login
2. Navigate to `/tutor/dashboard`
3. View stats overview
4. Tab "Hồ sơ" → Update profile
5. Changes saved immediately
6. Page auto-refresh

---

## 💰 Platform Economics

- **Commission**: 20% phí nền tảng
- **Min Rate**: 50,000 VND/giờ
- **Max Rate**: 1,000,000 VND/giờ
- **Tutor nhận**: 80% của hourly rate
- **Platform nhận**: 20% của hourly rate

**Example:**
```
Học phí: 100,000đ/giờ
→ Tutor nhận: 80,000đ
→ Platform: 20,000đ
```

---

## 🔐 Authorization

- `/tutor/setup`: Requires authentication
- `/tutor/dashboard`: Requires tutor profile
- Auto-redirect if:
  - Not logged in → `/login`
  - No profile → `/tutor/setup`
  - Has profile → `/tutor/dashboard`

---

## 📊 Database Models Used

```prisma
model Tutor {
  id              String
  userId          String @unique
  subjects        String[]
  grades          Int[]
  hourlyRate      Int
  bio             String
  rating          Float
  totalSessions   Int
  bankAccount     String?
  verified        Boolean
  createdAt       DateTime
  updatedAt       DateTime
  
  user            user
  bookings        Booking[]
}
```

---

## 🚀 Next Steps (Not Implemented Yet)

### Phase 2 - Student Management:
- [ ] View assigned students
- [ ] View AI reports for each student
- [ ] Student learning history
- [ ] Student analytics dashboard

### Phase 3 - Booking & Schedule:
- [ ] Accept/Reject booking requests
- [ ] View calendar with bookings
- [ ] Reschedule bookings
- [ ] Mark sessions as completed
- [ ] Add session notes

### Phase 4 - Earnings & Payout:
- [ ] Detailed earnings breakdown
- [ ] Transaction history
- [ ] Request payout
- [ ] VNPay integration for payouts
- [ ] Tax reports

### Phase 5 - Reviews & Rating:
- [ ] View student reviews
- [ ] Respond to reviews
- [ ] Rating breakdown

---

## 🔧 Technical Notes

### Form Validation:
- Using **Zod** schema
- React Hook Form with zodResolver
- Server-side validation trong actions

### State Management:
- Server Actions for mutations
- tRPC for queries
- No client-side state management needed

### UI Library:
- Shadcn/ui components
- Tailwind CSS
- Sonner for toasts

### Error Handling:
- Try-catch in all actions
- User-friendly error messages in Vietnamese
- Toast notifications for feedback

---

## 📝 API Usage Examples

### Server Actions:
```typescript
// Create tutor profile
const result = await createTutorProfile({
  subjects: ["Toán", "Vật lý"],
  grades: [10, 11, 12],
  hourlyRate: 150000,
  bio: "5 năm kinh nghiệm...",
  bankAccount: "Vietcombank - 123456789"
});

// Update profile
await updateTutorProfile({
  hourlyRate: 180000
});

// Get profile
const { data: tutor } = await getTutorProfile();

// Get stats
const { data: stats } = await getTutorStats();
```

### tRPC:
```typescript
// Get all tutors
const { data } = trpc.tutor.getAll.useQuery({
  subject: "Toán",
  grade: 10,
  verifiedOnly: true,
  limit: 20
});

// Get recommended tutors
const { data } = trpc.tutor.getRecommended.useQuery({
  childId: "child_123",
  limit: 5
});

// Search tutors
const { data } = trpc.tutor.search.useQuery({
  query: "Toán",
  limit: 10
});
```

---

## ✅ Completed Checklist

- [x] Server actions cho CRUD operations
- [x] Setup page với onboarding form
- [x] Dashboard page với stats & tabs
- [x] Profile form components
- [x] Tutor card component
- [x] Stats display component
- [x] Filters panel component
- [x] tRPC router với 6 queries
- [x] Validation schemas
- [x] Authorization checks
- [x] Error handling
- [x] Vietnamese localization
- [x] Responsive design
- [x] Loading states

---

**Status**: ✅ Phase 1 - Tutor Onboarding & Profile hoàn thành 100%
