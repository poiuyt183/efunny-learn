import { NextRequest, NextResponse } from "next/server";

/**
 * Mock payment page for testing subscription flow
 * This simulates SEPay payment gateway
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    return new Response(
        `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mock Payment Gateway</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .payment-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1a73e8;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        .label {
          color: #666;
        }
        .value {
          font-weight: 600;
          color: #333;
        }
        .button-group {
          margin-top: 30px;
          display: flex;
          gap: 12px;
        }
        button {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-success {
          background: #34a853;
          color: white;
        }
        .btn-success:hover {
          background: #2d9348;
        }
        .btn-cancel {
          background: #ea4335;
          color: white;
        }
        .btn-cancel:hover {
          background: #d33426;
        }
        .alert {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="payment-card">
        <h1>🏦 Mock Payment Gateway</h1>
        <div class="alert">
          ⚠️ Đây là trang thanh toán giả lập để test. Click "Thanh toán thành công" để test flow.
        </div>
        
        <div class="info-row">
          <span class="label">Mã đơn hàng:</span>
          <span class="value">${searchParams.get("order_id")}</span>
        </div>
        <div class="info-row">
          <span class="label">Số tiền:</span>
          <span class="value">${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(searchParams.get("amount")) || 0)}</span>
        </div>
        <div class="info-row">
          <span class="label">Nội dung:</span>
          <span class="value">${searchParams.get("order_info")}</span>
        </div>
        
        <div class="button-group">
          <button class="btn-success" onclick="handlePayment('success')">
            ✓ Thanh toán thành công
          </button>
          <button class="btn-cancel" onclick="handlePayment('cancel')">
            ✗ Hủy giao dịch
          </button>
        </div>
      </div>
      
      <script>
        function handlePayment(status) {
          const params = new URLSearchParams(window.location.search);
          const returnUrl = params.get('return_url');
          const orderId = params.get('order_id');
          const amount = params.get('amount');
          const merchantId = params.get('merchant_id');
          
          // Simulate payment callback
          const callbackParams = new URLSearchParams({
            order_id: orderId,
            amount: amount,
            merchant_id: merchantId,
            response_code: status === 'success' ? '00' : '11',
            status: status === 'success' ? 'success' : 'cancelled',
            transaction_no: 'MOCK_' + Date.now(),
            bank_code: 'MOCKBANK',
            signature: 'mock_signature_' + Date.now(), // In real app, this is HMAC SHA256
          });
          
          window.location.href = returnUrl + '?' + callbackParams.toString();
        }
      </script>
    </body>
    </html>
    `,
        {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        }
    );
}
