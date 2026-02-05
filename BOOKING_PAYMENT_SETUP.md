# Hướng Dẫn Thanh Toán Booking

## Tổng Quan

Hệ thống yêu cầu phụ huynh thanh toán trước khi đặt lịch học. Flow thanh toán:

```
Phụ huynh đặt lịch → Thanh toán qua SEPay → Webhook xác nhận → PENDING (chờ gia sư) → CONFIRMED → COMPLETED
```

## Các Trạng Thái Booking

1. **PENDING_PAYMENT** - Chờ thanh toán (booking vừa tạo)
2. **PENDING** - Đã thanh toán, chờ gia sư xác nhận
3. **CONFIRMED** - Gia sư đã xác nhận
4. **COMPLETED** - Đã hoàn thành buổi học
5. **CANCELLED** - Đã hủy
6. **REFUNDED** - Đã hoàn tiền

## Files Đã Thêm/Sửa

### 1. Payment Actions
**File:** `/src/features/bookings/actions/payment-actions.ts`
- `createBookingPayment()` - Tạo bookings và redirect đến payment gateway
- `confirmBookingPayment()` - Xác nhận thanh toán thành công (gọi từ webhook)
- `cancelBookingPayment()` - Hủy bookings nếu thanh toán thất bại

### 2. Webhook API
**File:** `/src/app/api/webhook/sepay-booking/route.ts`
- POST endpoint nhận webhook từ SEPay
- Xác nhận thanh toán và activate bookings

### 3. Payment Return Page
**File:** `/src/app/bookings/payment/return/page.tsx`
- Trang return sau khi thanh toán
- Hiển thị trạng thái success/failed
- Auto redirect về dashboard sau 3s

### 4. Database Schema
**File:** `/prisma/schema.prisma`
- Thêm model `BookingPayment`
- Thêm enum `BookingPaymentStatus`
- Thêm status `PENDING_PAYMENT` vào `BookingStatus`

### 5. Form Updates
**File:** `/src/features/bookings/components/MultiDateBookingForm.tsx`
- Thay đổi từ `createMultipleBookings` sang `createBookingPayment`
- Redirect đến payment gateway thay vì trực tiếp tạo booking

## Cấu Hình

### Environment Variables
```env
# SEPay Configuration (trong .env.local hoặc Vercel)
SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_SECRET_KEY=your_secret_key
SEPAY_API_URL=https://sepay-api-url
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Webhook URL
Cấu hình trong SEPay dashboard:
```
https://your-domain.com/api/webhook/sepay-booking
```

## Flow Chi Tiết

### 1. Phụ Huynh Đặt Lịch
```typescript
// User chọn ngày, giờ, con → Click "Thanh toán và đặt"
createBookingPayment({
  childId, tutorId, scheduledDates, timeSlot, durationMinutes, notes
})
```

### 2. Tạo Bookings & Payment Record
```typescript
// Tạo bookings với status PENDING_PAYMENT
const bookings = await prisma.booking.createMany({ status: "PENDING_PAYMENT" })

// Lưu payment record
await prisma.bookingPayment.create({
  orderId: "BOOKuserid123456789",
  bookingIds: [...],
  totalAmount: 500000,
  status: "PENDING"
})

// Redirect đến SEPay
window.location.href = paymentUrl
```

### 3. SEPay Callback
```typescript
// SEPay gọi webhook khi thanh toán thành công
POST /api/webhook/sepay-booking
{
  content: "xxx-xxx-BOOKuserid123456789",
  transferAmount: 500000,
  transactionId: "663ITC126035AP1V"
}

// Update payment status
await prisma.bookingPayment.update({ status: "COMPLETED" })

// Activate bookings
await prisma.booking.updateMany({ status: "PENDING" })
```

### 4. Return Page
```typescript
// User được redirect về return page
/bookings/payment/return?status=success&orderId=BOOK...

// Hiển thị success message
// Auto redirect về /dashboard/bookings sau 3s
```

### 5. Gia Sư Xác Nhận
```typescript
// Gia sư vào dashboard, thấy booking PENDING
// Click "Xác nhận" → status = CONFIRMED
updateBookingStatus(bookingId, "CONFIRMED")
```

## Testing

### Test Payment Flow (Development)
```bash
# 1. Start dev server
npm run dev

# 2. Đặt lịch học qua UI
# URL: http://localhost:3000/dashboard/tutors/[tutorId]

# 3. Mock payment success (nếu dùng test mode)
curl -X POST http://localhost:3000/api/webhook/sepay-booking \
  -H "Content-Type: application/json" \
  -d '{
    "content": "xxx-xxx-BOOKuserid123456789",
    "transferAmount": 500000,
    "transactionId": "TEST123",
    "gateway": "TPBank"
  }'
```

### Test Webhook Locally
```bash
# Sử dụng ngrok để expose local webhook
ngrok http 3000

# Update SEPAY_API_URL trong env
SEPAY_API_URL=https://your-ngrok-url.ngrok.io
```

## Lưu Ý Quan Trọng

### 1. Security
- ✅ Webhook verify signature từ SEPay
- ✅ Check amount match với database
- ✅ Prevent double processing

### 2. Edge Cases
- Thanh toán thành công nhưng webhook fail → Cần manual check
- User hủy giữa chừng → Bookings vẫn ở PENDING_PAYMENT, sẽ expire
- Insufficient balance → SEPay return failed status

### 3. Production Checklist
- [ ] Update SEPAY_MERCHANT_ID với merchant ID thực
- [ ] Update SEPAY_SECRET_KEY với secret key thực
- [ ] Cấu hình webhook URL trong SEPay dashboard
- [ ] Test với real payment gateway
- [ ] Setup monitoring cho webhook failures
- [ ] Add refund logic nếu gia sư từ chối

## Troubleshooting

### Webhook không nhận được
```bash
# Check webhook logs
tail -f logs/webhook.log

# Verify URL accessible
curl https://your-domain.com/api/webhook/sepay-booking

# Check SEPay dashboard webhook configuration
```

### Payment không được activate
```sql
-- Check payment record
SELECT * FROM "BookingPayment" WHERE "orderId" = 'BOOKxxx';

-- Check bookings
SELECT * FROM "Booking" WHERE id IN (...);

-- Manual activate nếu cần
UPDATE "BookingPayment" SET status = 'COMPLETED' WHERE "orderId" = 'BOOKxxx';
UPDATE "Booking" SET status = 'PENDING' WHERE id IN (...);
```

## Future Enhancements

- [ ] Add refund API khi gia sư từ chối
- [ ] Email notification khi payment success
- [ ] Payment history page
- [ ] Recurring booking subscription
- [ ] Discount codes
- [ ] Split payment (đặt cọc trước)
