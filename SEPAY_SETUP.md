# Hướng dẫn thiết lập thanh toán SEPay

## 1. Tổng quan hệ thống thanh toán

Hệ thống thanh toán gồm các thành phần:
- **Trang Checkout**: Hiển thị thông tin gói đăng ký và nút thanh toán
- **SEPay Payment Gateway**: Xử lý thanh toán và hiển thị QR code
- **Return URL**: Nhận kết quả sau khi user thanh toán
- **Webhook**: Nhận thông báo realtime từ SEPay khi thanh toán thành công

## 2. Luồng thanh toán

```
User → Chọn gói subscription
     → Nhấn "Thanh toán"
     → Chuyển đến trang checkout (/dashboard/subscription/checkout?tier=BASIC)
     → Nhấn nút "Thanh toán"
     → API tạo payment URL
     → Redirect đến SEPay
     → SEPay hiển thị QR code
     → User quét mã và thanh toán
     → SEPay gửi webhook đến server
     → Server cập nhật subscription
     → User được redirect về return URL
     → Hiển thị thông báo thành công
```

## 3. Cấu hình SEPay Dashboard

### Bước 1: Đăng nhập SEPay Dashboard
1. Truy cập https://sepay.vn/dashboard
2. Đăng nhập với tài khoản merchant

### Bước 2: Cấu hình Webhook URL
1. Vào **Settings** → **Webhook**
2. Nhập Webhook URL:
   - Development: `http://localhost:3000/api/webhook/sepay` (sử dụng ngrok)
   - Production: `https://yourdomain.com/api/webhook/sepay`
3. Chọn các events:
   - [x] Payment Success
   - [x] Payment Failed
4. Lưu cấu hình

### Bước 3: Cấu hình Return URL
1. Vào **Settings** → **Return URL**
2. Nhập Return URL:
   - Development: `http://localhost:3000/api/subscription/return`
   - Production: `https://yourdomain.com/api/subscription/return`
3. Lưu cấu hình

### Bước 4: Lấy API Credentials
1. Vào **Settings** → **API Keys**
2. Copy các thông tin:
   - Merchant ID: `SP-LIVE-XXXXXXXX`
   - Secret Key: `spsk_live_XXXXXXXXXXXXXXXX`

## 4. Cấu hình môi trường (.env)

```env
# SEPay Configuration
SEPAY_MERCHANT_ID=SP-LIVE-TV87B899
SEPAY_SECRET_KEY=spsk_live_vPHLF1LnrZY9Duu8XKmPGNpNmJm228UT
SEPAY_API_URL=https://pgapi.sepay.vn/
SEPAY_RETURN_URL=http://localhost:3000/api/subscription/return
SEPAY_WEBHOOK_URL=http://localhost:3000/api/webhook/sepay
```

## 5. Testing với Ngrok (Development)

Vì webhook cần public URL, bạn cần dùng ngrok cho local development:

```bash
# Cài đặt ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Copy URL từ ngrok, ví dụ: https://abc123.ngrok.io
# Cập nhật webhook URL trong SEPay dashboard:
# https://abc123.ngrok.io/api/webhook/sepay
```

## 6. API Endpoints

### 6.1. Checkout (Tạo payment URL)
```
POST /api/subscription/checkout
Content-Type: application/x-www-form-urlencoded

tier=BASIC
```

Response: Redirect đến SEPay payment page

### 6.2. Webhook (Nhận thông báo từ SEPay)
```
POST /api/webhook/sepay
Content-Type: application/json

{
  "merchant_id": "SP-LIVE-XXXXXXXX",
  "order_id": "SUBS_abc12345_1234567890",
  "amount": 200000,
  "response_code": "00",
  "transaction_no": "TXN123456789",
  "signature": "abc123..."
}
```

Response:
```json
{
  "success": true,
  "message": "Subscription activated"
}
```

### 6.3. Return URL (User quay lại sau thanh toán)
```
GET /api/subscription/return?order_id=...&response_code=00&signature=...
```

Redirect đến: `/dashboard/subscription?success=true`

## 7. Testing Flow

### Test thanh toán thành công:
1. Truy cập http://localhost:3000/dashboard/subscription
2. Chọn gói BASIC hoặc PREMIUM
3. Nhấn "Nâng cấp"
4. Nhấn "Thanh toán"
5. Tại trang SEPay, quét QR code và thanh toán
6. Kiểm tra webhook log trong terminal
7. Kiểm tra subscription đã được cập nhật trong database

### Test webhook riêng:
```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhook/sepay \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "SP-LIVE-TV87B899",
    "order_id": "SUBS_test1234_1234567890",
    "amount": 200000,
    "response_code": "00",
    "transaction_no": "TXN123456789",
    "signature": "valid_signature_here"
  }'
```

## 8. Troubleshooting

### Webhook không nhận được:
1. Kiểm tra ngrok đang chạy: `ngrok http 3000`
2. Kiểm tra webhook URL trong SEPay dashboard
3. Xem logs trong terminal: `console.log("📨 SEPay webhook received:", body)`

### Signature không hợp lệ:
1. Kiểm tra `SEPAY_SECRET_KEY` trong .env
2. Kiểm tra signature algorithm trong `sepay.ts`
3. Xem SEPay documentation để đảm bảo format đúng

### Return URL không hoạt động:
1. Kiểm tra `SEPAY_RETURN_URL` trong .env
2. Kiểm tra route handler tại `/api/subscription/return/route.ts`
3. Xem logs để debug

## 9. Production Deployment

Khi deploy lên production:

1. **Cập nhật .env**:
```env
SEPAY_API_URL=https://pgapi.sepay.vn/
SEPAY_RETURN_URL=https://yourdomain.com/api/subscription/return
SEPAY_WEBHOOK_URL=https://yourdomain.com/api/webhook/sepay
```

2. **Cập nhật SEPay Dashboard**:
   - Webhook URL: `https://yourdomain.com/api/webhook/sepay`
   - Return URL: `https://yourdomain.com/api/subscription/return`

3. **Enable SSL**: SEPay yêu cầu HTTPS cho production

## 10. Security Checklist

- [x] Verify signature từ SEPay trong webhook
- [x] Validate order_id format
- [x] Check amount matching với tier
- [x] Rate limiting cho webhook endpoint
- [x] Log tất cả webhook requests
- [x] Use HTTPS trong production
- [x] Không expose SECRET_KEY trong client code

## 11. Files Structure

```
src/
├── app/
│   ├── api/
│   │   ├── subscription/
│   │   │   ├── checkout/route.ts    # Tạo payment URL
│   │   │   └── return/route.ts      # Xử lý return từ SEPay
│   │   └── webhook/
│   │       └── sepay/route.ts       # Nhận webhook từ SEPay
│   └── dashboard/
│       └── subscription/
│           ├── page.tsx             # Danh sách gói
│           └── checkout/
│               └── page.tsx         # Trang checkout
└── lib/
    └── sepay.ts                     # SEPay utility functions
```
