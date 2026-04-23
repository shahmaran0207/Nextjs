declare global {
    interface Window {
        IMP?: Iamport;
    }
}

export interface Iamport {
    init: (accountID: string) => void;

    request_pay: (
        params: RequestPayParams,
        callback?: RequestPayResponseCallback,
    ) => void;

    loadUI: (
        type: PaypalUI,
        params: PaypalRequestPayParams,
        callback?: RequestPayResponseCallback,
    ) => void;

    updateLoadUIRequest: (type: PaypalV2LoadPaymentUIBypass, params: PaypalRequestPayParams) => void;
}

export interface ReqeustpayAdditionalParams {
    // 디지털 구분자
    digital?: boolean;

    // 가상계좌 입금기한
    vbank_due?: string;

    // 결제 완료 후 이동할 EndPoint 주소
    m_redirect_url?: string;

    // 모바일 앱 결제중 가맹점 앱 복귀를 위한 URL
    app_scheme: string;

    // 사업자 등록번호
    biz_num?: string;
}

export interface Display {
    card_quota?: number[];
}

type PG =
    | "html5_inicis"
    | "inicis"
    | "kcp"
    | "kcp_billing"
    | "uplus"
    | "nice"
    | "kicc"
    | "bluewalnut"
    | "kakaopay"
    | "danal"
    | "danal_tpay"
    | "mobilians"
    | "payco"
    | "paypal"
    | "eximbay"
    | "naverpay"
    | "naverco"
    | "smilepay"
    | "alipay"
    | "paymentwall"
    | "tosspay"
    | "smartro"
    | "settle"
    | "settle_acc"
    | "daou"
    | "tosspayments"
    | "paypal_v2"
    | "nice_v2"
    | "smartro_v2"
    | "ksnet";

type PaymentMethod =
    | "card"
    | "trans"
    | "vbank"
    | "phone"
    | "paypal"
    | "applepay"
    | "naverpay"
    | "samsung"
    | "kpay"
    | "kakaopay"
    | "payco"
    | "lpay"
    | "ssgpay"
    | "tosspay"
    | "cultureland"
    | "smartculture"
    | "happymoney"
    | "booknlife"
    | "point"
    | "wechat"
    | "alipay"
    | "unionpay"
    | "tenpay";

interface EscrowProduct {
    id: string;

    // 상품명
    name: string;

    // 상품 코드
    code: string;

    // 상품 단위 가격
    unitPrice: number;

    // 수량
    quantity: number;
}

interface Card {
    direct?: {
        // 카드사 금융결제원 표준 코드
        code: string;

        // 할부 개월 수
        quota: number;
    };

    detail?: {
        // 금융결제원 카드사 코드
        card_code: string;

        // 해당카드 활성화 여부
        enabled: boolean;
    }[];
}

export interface RequestPayParams extends ReqeustpayAdditionalParams {
    // PG사 구분코드
    pg?: string;

    //채널 키
    channel_key?: string;

    // 결제수단 구분코드
    pay_method: PaymentMethod;

    // 에스크로 결제창 활성화 여부
    escrow?: boolean;

    // 에스크로 결제정보
    escrowProducts?: EscrowProduct[];

    // 가맹점 주문번호
    merchant_uid: string;

    // 결제대상 제품명
    name?: string;

    // 결제금액
    amount: number;

    // 사용자 정의 데이터
    custom_data?: Record<any, any>;

    // 면세금액
    tax_free?: number;

    // 부가세
    vat_amount?: number | null;

    // 결제통화 구분코드
    currency?: string;

    // 결제창 언어설정
    language?: "en" | "ko";

    // 주문자명
    buyer_name?: string;

    // 주문자 연락처
    buyer_tel?: string;

    // 주문자 이메일
    buyer_email?: string;

    // 주문자 주소
    buyer_addr?: string;

    // 주문자 우편번호
    buyer_postcode?: string;

    // 결제 성공시 가맹점 endPoint url
    confirm_url?: string;

    // 웹훅 수신 주소
    notice_url?: string | string[];

    // 가맹점 정의 빌링키
    custom_uid?: string;

    display?: Display;
    card?: Card;
}

export interface ReqeustpayAdditionalResponse {
    // 신용카드 승인번호
    apply_num?: string;

    // 가상계좌 입금 계좌번호
    vbank_num?: string;

    // 가상게좌 입금은행명
    vbank_name?: string;

    // 가상계좌 예금주
    vbank_holder?: string | null;

    // 가상계좌 입금기한
    vbank_date?: string;
}

export interface RequestPayResponse extends ReqeustpayAdditionalResponse {
    // 결제 성공여부
    success?: boolean;

    // 결제 실패코드
    error_code?: string;

    // 결제 실패메세지
    error_msg?: string;

    // 포트원 고유 결제번호
    imp_uid: string | null;

    // 주문번호
    merchant_uid: string;

    // 결제수단 구분코드
    pay_method?: PaymentMethod;

    // 결제금액
    paid_amount?: number;

    // 결제상태
    status?: string;

    // 주문자명
    name?: string;

    // PG사 구분코드
    pg_provider?: PG;

    // 간편결제 구분코드
    embb_pg_provider?:
    | "naverpay"
    | "kakaopay"
    | "payco"
    | "samsungpay"
    | "sspay"
    | "lpay";

    // pg사 거래번호
    pg_tid?: string;

    // 주문자명
    buyer_name?: string;

    // 주문자 이메일
    buyer_eamil?: string;

    // 주문자 연락처
    buyer_tel?: string;

    // 주문자 주소
    buyer_addr?: string;

    // 주문자 우편번호
    buyer_postcode?: string;

    // 가맹점 임의 지정 데이터
    custom_data?: string;

    // 결제 승인시각
    paid_at?: string;

    // 거래 매출전표 URL
    receipt_url?: string;
}

export type RequestPayResponseCallback = (response: RequestPayResponse) => void;

type PaypalUI = "paypal-spb" | "paypal-rt";

export interface PaypalRequestPayParams extends RequestPayParams {
    pg: string;
    pay_method: "paypal";

    // 국가코드
    country?: string;

    // 구매자 이름
    buyer_first_name?: string;
    buyer_last_name?: string;

    // 결제 상품 정보
    products?: {
        id?: string;
        name?: string;
        code?: string;
        unitPrice?: number;
        quantity?: number;
        tag?: string;
    }[];

    // 결제 통화
    currency?: string;
}