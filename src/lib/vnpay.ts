import { createHmac } from "crypto";
import { format } from "date-fns";
import qs from "querystring";

export interface VNPayConfig {
    tmnCode: string;
    hashSecret: string;
    url: string;
    returnUrl: string;
}

export interface PaymentParams {
    amount: number;
    orderId: string;
    orderInfo: string;
    ipAddr: string;
    locale?: "vn" | "en";
    bankCode?: string;
}

export class VNPay {
    private config: VNPayConfig;

    constructor(config?: Partial<VNPayConfig>) {
        this.config = {
            tmnCode: config?.tmnCode || process.env.VNP_TMN_CODE || "",
            hashSecret: config?.hashSecret || process.env.VNP_HASH_SECRET || "",
            url:
                config?.url ||
                process.env.VNP_URL ||
                "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
            returnUrl:
                config?.returnUrl ||
                process.env.VNP_RETURN_URL ||
                "http://localhost:3000/api/subscription/return",
        };

        if (!this.config.tmnCode || !this.config.hashSecret) {
            console.warn("VNPay config missing tmnCode or hashSecret");
        }
    }

    /**
     * Build the payment URL to redirect the user to VNPay
     */
    buildPaymentUrl(params: PaymentParams): string {
        const date = new Date();
        const createDate = format(date, "yyyyMMddHHmmss");
        const expireDate = format(
            new Date(date.getTime() + 15 * 60 * 1000),
            "yyyyMMddHHmmss",
        ); // 15 mins expiry

        const vnpParams: Record<string, string | number> = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: this.config.tmnCode,
            vnp_Locale: params.locale || "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: params.orderId,
            vnp_OrderInfo: params.orderInfo,
            vnp_OrderType: "other",
            vnp_Amount: params.amount * 100, // VNPay requires amount in smallest unit (VND * 100)
            vnp_ReturnUrl: this.config.returnUrl,
            vnp_IpAddr: params.ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
        };

        if (params.bankCode) {
            vnpParams["vnp_BankCode"] = params.bankCode;
        }

        // Sort params by key to generate signature
        const sortedParams = this.sortObject(vnpParams);

        const signData = qs.stringify(sortedParams);
        const hmac = createHmac("sha512", this.config.hashSecret);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        vnpParams["vnp_SecureHash"] = signed;

        const query = qs.stringify(vnpParams); // URL encode for the final link
        return `${this.config.url}?${query}`;
    }

    /**
     * Verify the signature returned from VNPay (IPN or Return URL)
     */
    verifyReturnUrl(query: Record<string, string | string[]>): {
        isSuccess: boolean;
        isVerified: boolean;
        orderId: string;
        message: string;
        vnp_ResponseCode: string;
    } {
        const vnpParams = { ...query };
        const secureHash = vnpParams["vnp_SecureHash"];

        // Remove hash params to rebuild signature
        delete vnpParams["vnp_SecureHash"];
        delete vnpParams["vnp_SecureHashType"];

        // Sort to rebuild signature
        const sortedParams = this.sortObject(vnpParams);

        const signData = qs.stringify(sortedParams);
        const hmac = createHmac("sha512", this.config.hashSecret);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        const isVerified = secureHash === signed;
        const isSuccess = vnpParams["vnp_ResponseCode"] === "00";

        return {
            isSuccess,
            isVerified,
            orderId: vnpParams["vnp_TxnRef"] as string,
            message: this.getResponseCodeMessage(
                vnpParams["vnp_ResponseCode"] as string,
            ),
            vnp_ResponseCode: vnpParams["vnp_ResponseCode"] as string,
        };
    }

    private sortObject(obj: Record<string, any>) {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();
        for (const key of keys) {
            sorted[key] = obj[key];
        }
        return sorted;
    }

    private getResponseCodeMessage(code: string): string {
        switch (code) {
            case "00":
                return "Giao dịch thành công";
            case "07":
                return "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).";
            case "09":
                return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
            case "10":
                return "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11":
                return "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.";
            case "12":
                return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.";
            case "13":
                return "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.";
            case "24":
                return "Giao dịch không thành công do: Khách hàng hủy giao dịch";
            case "51":
                return "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
            case "65":
                return "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.";
            case "75":
                return "Ngân hàng thanh toán đang bảo trì.";
            case "79":
                return "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch";
            case "99":
                return "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)";
            default:
                return "Lỗi không xác định";
        }
    }
}

export const vnpay = new VNPay();
