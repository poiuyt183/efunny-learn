import crypto from 'crypto';

if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET) {
    throw new Error('Missing VNPay configuration. Please set VNPAY_TMN_CODE and VNPAY_HASH_SECRET');
}

export const VNPAY_CONFIG = {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    apiUrl: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    returnUrl: process.env.VNPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/vnpay/callback`,
    paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
} as const;

export const SUBSCRIPTION_PLANS = {
    FREE: {
        tier: 'FREE' as const,
        name: 'Miễn phí',
        price: 0,
        maxChildren: 1,
        dailyQuestions: 10,
        features: [
            '1 profile trẻ',
            '10 câu hỏi/ngày',
            '1 linh thú cơ bản',
            'Không tiến hóa',
            'Không truy cập gia sư',
        ],
    },
    BASIC: {
        tier: 'BASIC' as const,
        name: 'Cơ bản',
        price: 99000, // VND
        recurringInterval: 'MONTHLY' as const,
        maxChildren: 2,
        dailyQuestions: 50,
        features: [
            '2 profiles trẻ',
            '50 câu hỏi/ngày mỗi trẻ',
            'Tất cả linh thú',
            'Tiến hóa cấp 1',
            'Báo cáo phân tích cơ bản',
            'Tìm kiếm gia sư',
        ],
    },
    PREMIUM: {
        tier: 'PREMIUM' as const,
        name: 'Cao cấp',
        price: 199000, // VND
        recurringInterval: 'MONTHLY' as const,
        maxChildren: 5,
        dailyQuestions: Infinity,
        features: [
            'Tối đa 5 profiles',
            'Không giới hạn câu hỏi',
            'Linh thú tiến hóa đầy đủ (3 cấp)',
            'Báo cáo AI nâng cao',
            'Ưu tiên matching gia sư',
            'Giảm 10% phí booking',
        ],
    },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;

export const MARKETPLACE_FEE_PERCENT = 20; // Platform takes 20% from tutor bookings

export function calculatePlatformFee(totalAmount: number): number {
    return Math.floor(totalAmount * (MARKETPLACE_FEE_PERCENT / 100));
}

export function calculateTutorPayout(totalAmount: number): number {
    return totalAmount - calculatePlatformFee(totalAmount);
}

/**
 * Generate HMAC SHA512 signature for VNPay request
 */
export function generateVNPaySignature(data: Record<string, string | number>): string {
    // Sort keys alphabetically and create query string
    const sortedData = Object.keys(data)
        .sort()
        .filter(key => data[key] !== undefined && data[key] !== null && data[key] !== '')
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');

    return crypto
        .createHmac('sha512', VNPAY_CONFIG.hashSecret)
        .update(sortedData)
        .digest('hex');
}

/**
 * Verify VNPay callback signature
 */
export function verifyVNPaySignature(
    data: Record<string, string | number>,
    receivedSignature: string
): boolean {
    const { vnp_SecureHash, ...dataWithoutHash } = data;
    const calculatedSignature = generateVNPaySignature(dataWithoutHash);
    return calculatedSignature === receivedSignature;
}

/**
 * Format date for VNPay (yyyyMMddHHmmss)
 */
export function formatVNPayDate(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
