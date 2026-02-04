import { createHmac } from "crypto";
import { format } from "date-fns";
import qs from "querystring";

export interface SEPayConfig {
    merchantId: string;
    secretKey: string;
    apiUrl: string;
    returnUrl: string;
}

export interface PaymentParams {
    amount: number;
    orderId: string;
    orderInfo: string;
    ipAddr: string;
    locale?: "vi" | "en";
    bankCode?: string;
}

export class SEPay {
    private config: SEPayConfig;

    constructor(config?: Partial<SEPayConfig>) {
        this.config = {
            merchantId: config?.merchantId || process.env.SEPAY_MERCHANT_ID || "",
            secretKey: config?.secretKey || process.env.SEPAY_SECRET_KEY || "",
            apiUrl:
                config?.apiUrl ||
                process.env.SEPAY_API_URL ||
                "http://localhost:3000/api/subscription/mock-payment", // Mock payment for testing
            returnUrl:
                config?.returnUrl ||
                process.env.SEPAY_RETURN_URL ||
                "http://localhost:3000/api/subscription/return",
        };

        if (!this.config.merchantId || !this.config.secretKey) {
            console.warn("SEPay config missing merchantId or secretKey - using test mode");
        }
    }

    /**
     * Build the payment URL to redirect the user to SEPay
     */
    buildPaymentUrl(params: PaymentParams): string {
        const date = new Date();
        const createDate = format(date, "yyyyMMddHHmmss");

        const paymentData: Record<string, string | number> = {
            merchant_id: this.config.merchantId,
            order_id: params.orderId,
            amount: params.amount,
            order_info: params.orderInfo,
            return_url: this.config.returnUrl,
            create_date: createDate,
            locale: params.locale || "vi",
            ip_addr: params.ipAddr,
        };

        // Add bank code if provided
        if (params.bankCode) {
            paymentData.bank_code = params.bankCode;
        }

        // Generate signature
        const signature = this.generateSignature(paymentData);
        paymentData.signature = signature;

        // Build URL
        const queryString = qs.stringify(paymentData);
        return `${this.config.apiUrl}?${queryString}`;
    }

    /**
     * Generate HMAC SHA256 signature
     */
    private generateSignature(data: Record<string, string | number>): string {
        // Sort keys alphabetically
        const sortedKeys = Object.keys(data).sort();

        // Create sign string
        const signString = sortedKeys
            .filter((key) => data[key] !== undefined && data[key] !== null && data[key] !== "")
            .map((key) => `${key}=${data[key]}`)
            .join("&");

        // Create HMAC SHA256
        const hmac = createHmac("sha256", this.config.secretKey);
        return hmac.update(signString).digest("hex");
    }

    /**
     * Verify return URL signature
     */
    verifyReturnUrl(params: Record<string, string>): boolean {
        const receivedSignature = params.signature;
        if (!receivedSignature) {
            return false;
        }

        // Remove signature from params
        const verifyParams = { ...params };
        delete verifyParams.signature;

        // Generate signature to compare
        const expectedSignature = this.generateSignature(verifyParams);

        return receivedSignature === expectedSignature;
    }

    /**
     * Verify and parse return URL
     */
    verifyAndParseReturnUrl(params: Record<string, string>): {
        isSuccess: boolean;
        isVerified: boolean;
        orderId: string;
        amount: number;
        message: string;
        responseCode: string;
        transactionNo?: string;
    } {
        const isVerified = this.verifyReturnUrl(params);
        const responseCode = params.response_code || params.status || "99";
        const isSuccess = responseCode === "00" || responseCode === "success";

        return {
            isSuccess,
            isVerified,
            orderId: params.order_id || "",
            amount: Number.parseInt(params.amount || "0"),
            message: this.getResponseCodeMessage(responseCode),
            responseCode,
            transactionNo: params.transaction_no || params.trans_id,
        };
    }

    /**
     * Get response code message in Vietnamese
     */
    private getResponseCodeMessage(code: string): string {
        switch (code) {
            case "00":
            case "success":
                return "Giao dịch thành công";
            case "01":
                return "Giao dịch đang xử lý";
            case "02":
                return "Giao dịch bị từ chối";
            case "03":
                return "Giao dịch không hợp lệ";
            case "04":
                return "Số dư không đủ";
            case "05":
                return "Thẻ/Tài khoản không tồn tại";
            case "06":
                return "Thẻ/Tài khoản bị khóa";
            case "07":
                return "Thẻ hết hạn";
            case "08":
                return "Sai mã OTP";
            case "09":
                return "Vượt quá hạn mức giao dịch";
            case "10":
                return "Hết thời gian thanh toán";
            case "11":
                return "Khách hàng hủy giao dịch";
            case "12":
                return "Ngân hàng đang bảo trì";
            case "99":
                return "Lỗi hệ thống";
            default:
                return "Lỗi không xác định";
        }
    }

    /**
     * Sort object keys alphabetically
     */
    private sortObject(obj: Record<string, any>): Record<string, any> {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();
        for (const key of keys) {
            sorted[key] = obj[key];
        }
        return sorted;
    }
}

export const sepay = new SEPay();
