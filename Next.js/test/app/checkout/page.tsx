"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../Shopping/shopping.css";
import axios from "axios";
import DaumPostcodeEmbed from "react-daum-postcode";
import { RequestPayParams, RequestPayResponse } from "@/types/paymentType";
import { PageHeader } from "@/component/PageHeader";

interface CheckoutItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  option_name?: string | null;
  seller_id?: number | null;  // 암호화폐 결제 라우팅용
}

export default function CheckoutPage() {
  const { email, name } = useAuthGuard();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [fromCart, setFromCart] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [usePoints, setUsePoints] = useState<number>(0);
  const [sharedMembersCount, setSharedMembersCount] = useState<number>(1);

  // 결제 수단: "card" | "crypto"
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");

  const [coupons, setCoupons] = useState<any[]>([]);
  const [mapCoupons, setMapCoupons] = useState<any[]>([]); // 지도에서 획득한 쿠폰
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null); // "db-{id}" | "map-{id}"
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [addressSuccessMessage, setAddressSuccessMessage] = useState<string>("");

  // 배송지 폼 상태
  const [receiverName, setReceiverName] = useState(name || "");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [message, setMessage] = useState("");

  // 우편번호 모달 상태
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [isPostcodeLoading, setIsPostcodeLoading] = useState(false);
  const [postcodeKey, setPostcodeKey] = useState(0); // 컴포넌트 강제 재렌더링용

  useEffect(() => {
    const storedItems = sessionStorage.getItem("checkout_items");
    const storedFromCart = sessionStorage.getItem("checkout_from_cart");
    const storedIsGift = sessionStorage.getItem("checkout_is_gift");
    const storedSharedMembersCount = sessionStorage.getItem("shared_members_count");

    if (storedItems) {
      const parsed: CheckoutItem[] = JSON.parse(storedItems);

      // seller_id가 없는 아이템이 있으면 product API로 보완 조회
      const missingSellerIds = parsed.some(i => !i.seller_id);
      if (missingSellerIds) {
        Promise.all(
          parsed.map(async (item) => {
            if (item.seller_id) return item;
            try {
              const res = await fetch(`/api/Shopping/Products/${item.product_id}`);
              if (!res.ok) return item;
              const data = await res.json();
              return { ...item, seller_id: data.seller_id ?? null };
            } catch {
              return item;
            }
          })
        ).then(filled => setItems(filled));
      } else {
        setItems(parsed);
      }
    }
    if (storedFromCart === "true") {
      setFromCart(true);
    }
    if (storedIsGift === "true") {
      setIsGift(true);
    }
    if (storedSharedMembersCount) {
      setSharedMembersCount(Number(storedSharedMembersCount));
    }

    // 사용자 포인트 조회 (실패 시 0으로 처리)
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(`/api/auth/Me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setAvailablePoints(Number(res.data.points) || 0))
        .catch(() => { /* 401 등 인증 오류 시 포인트 0으로 처리 */ });
    }

    // 사용자 쿠폰 조회
    if (email) {
      axios.get(`/api/coupons?email=${encodeURIComponent(email)}`)
        .then(res => setCoupons(res.data.coupons || []))
        .catch(err => console.error(err));
    }

    // localStorage 지도 쿠폰 로드
    try {
      const stored = JSON.parse(localStorage.getItem('mapCoupons') || '[]');
      setMapCoupons(stored);
    } catch (_) { }

    setLoading(false);
  }, [email]);

  const totalPrice = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const shippingFee = totalPrice >= 50000 ? 0 : 3000;

  // 쿠폰 할인 계산 (DB 쿠폰 + 지도 쿠폰 통합)
  useEffect(() => {
    if (!selectedCouponId) { setCouponDiscount(0); return; }

    // 지도 쿠폰 ("map-" prefix)
    if (selectedCouponId.startsWith('map-')) {
      const mapCoupon = mapCoupons.find(c => `map-${c.id}` === selectedCouponId);
      if (mapCoupon) {
        setCouponDiscount(Math.floor(totalPrice * (mapCoupon.discount / 100)));
      }
      return;
    }

    // DB 쿠폰 ("db-" prefix)
    const coupon = coupons.find(c => `db-${c.user_coupon_id}` === selectedCouponId);
    if (!coupon) return;
    if (totalPrice < coupon.min_order_amount) {
      alert(`해당 쿠폰은 상품 금액 ${coupon.min_order_amount.toLocaleString()}원 이상부터 사용 가능합니다.`);
      setSelectedCouponId(null);
      setCouponDiscount(0);
      return;
    }
    if (coupon.discount_type === "PERCENT") {
      setCouponDiscount(Math.floor(totalPrice * (coupon.discount_value / 100)));
    } else {
      setCouponDiscount(coupon.discount_value);
    }
  }, [selectedCouponId, totalPrice, coupons, mapCoupons]);

  const finalAmount = Math.max(totalPrice + shippingFee - usePoints - couponDiscount, 0);

  const handleUseAllPoints = () => {
    // 최대 사용 가능 포인트는 총액 + 배송비 - 쿠폰 할인
    setUsePoints(Math.min(availablePoints, totalPrice + shippingFee - couponDiscount));
  };

  const handleCompletePostcode = useCallback((data: any) => {
    try {
      console.log("DaumPostcode 완료 이벤트:", data);
      
      // 데이터 유효성 검사 - 더 엄격하게
      if (!data) {
        console.error("데이터가 없습니다");
        return;
      }

      // 주소 데이터가 완전한지 확인
      const hasValidAddress = data.address || data.roadAddress || data.jibunAddress;
      const hasZonecode = data.zonecode;
      
      if (!hasValidAddress || !hasZonecode) {
        console.log("불완전한 데이터, 계속 진행:", data);
        return; // 불완전한 데이터면 아무것도 하지 않음 (사용자가 계속 선택할 수 있도록)
      }

      // 완전한 주소 데이터가 있을 때만 처리
      console.log("완전한 주소 데이터 감지, 처리 시작");

      // 도로명 주소 우선, 없으면 지번 주소 사용
      let fullAddress = data.roadAddress || data.jibunAddress || data.address || "";
      let extraAddress = '';

      // 도로명 주소인 경우 추가 정보 처리
      if (data.addressType === 'R') {
        if (data.bname && data.bname !== '') {
          extraAddress += data.bname;
        }
        if (data.buildingName && data.buildingName !== '') {
          extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
        }
        if (extraAddress !== '') {
          fullAddress += ` (${extraAddress})`;
        }
      }

      console.log("처리된 주소 정보:", {
        zonecode: data.zonecode,
        address: fullAddress,
        addressType: data.addressType
      });

      // 즉시 상태 업데이트
      setZipcode(data.zonecode || "");
      setAddress(fullAddress);
      
      // 성공 메시지 표시
      setAddressSuccessMessage("✅ 주소가 성공적으로 입력되었습니다!");
      
      // 강제로 모달 닫기 - 즉시 실행
      setIsPostcodeOpen(false);
      setIsPostcodeLoading(false);
      setPostcodeKey(prev => prev + 1); // 컴포넌트 강제 재렌더링
      
      // DOM에서 완전히 제거하기 위한 추가 처리
      setTimeout(() => {
        const postcodeWrapper = document.querySelector('.postcode-wrapper');
        if (postcodeWrapper) {
          postcodeWrapper.remove();
        }
      }, 50);
      
      // 성공 메시지 자동 제거
      setTimeout(() => setAddressSuccessMessage(""), 3000);
      
      // 상세주소 입력 필드에 포커스
      setTimeout(() => {
        const detailInput = document.querySelector('input[placeholder="상세 주소를 입력해주세요"]') as HTMLInputElement;
        if (detailInput) {
          detailInput.focus();
          detailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
    } catch (err) {
      console.error("주소 처리 중 오류:", err);
      alert("주소 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsPostcodeOpen(false);
      setIsPostcodeLoading(false);
    }
  }, []);

  const handleOpenPostcode = useCallback(() => {
    setIsPostcodeLoading(true);
    setPostcodeKey(prev => prev + 1); // 새로운 컴포넌트 인스턴스 생성
    setIsPostcodeOpen(true);
    // 로딩 상태를 잠시 후 해제 (Daum 우편번호 서비스 로딩 시간 고려)
    setTimeout(() => {
      setIsPostcodeLoading(false);
    }, 1000);
  }, []);

  const handleClosePostcode = useCallback(() => {
    setIsPostcodeOpen(false);
    setIsPostcodeLoading(false);
    setPostcodeKey(prev => prev + 1); // 컴포넌트 완전 초기화
  }, []);

  // 암호화폐 결제 처리
  const handleCryptoPayment = () => {
    if (items.length === 0) return alert("결제할 상품이 없습니다.");
    if (!receiverName || !receiverPhone || !address || !addressDetail) {
      return alert("배송지 정보를 모두 입력해주세요.");
    }

    // 판매자 단일여부 확인
    const sellerIds = [...new Set(items.map(i => i.seller_id).filter(Boolean))];
    if (sellerIds.length === 0) {
      return alert("판매자 정보가 없는 상품입니다. 일반 결제를 이용해주세요.");
    }
    if (sellerIds.length > 1) {
      return alert("암호화폐 결제는 단일 판매자의 상품만 지원합니다.\n여러 판매자 상품이 담겨 있는 경우 각각 따로 주문하거나 일반 결제를 이용해주세요.");
    }

    const sellerId = sellerIds[0];
    const productId = items[0].product_id;  // 대표 상품 ID

    // 배송 정보 임시 저장
    sessionStorage.setItem("crypto_shipping_info", JSON.stringify({
      receiverName,
      receiverPhone,
      shippingAddress: `[${zipcode}] ${address} ${addressDetail}`,
      shippingMessage: message
    }));

    // 링크 생성 후 이동
    window.location.href = `/multi-payment?sellerId=${sellerId}&productId=${productId}`;
  };

  // 일반 결제 (PortOne 카드)
  const handlePayment = () => {
    if (!window.IMP) return;
    if (items.length === 0) return alert("결제할 상품이 없습니다.");
    if (!receiverName || !receiverPhone || !address || !addressDetail) {
      return alert("배송지 정보를 모두 입력해주세요.");
    }

    const { IMP } = window;
    IMP.init("imp08348266");

    const orderName = items.length > 1 ? `${items[0].product_name} 외 ${items.length - 1}건` : items[0].product_name;

    const data: RequestPayParams = {
      pg: "html5_inicis",
      channel_key: "channel-key-a430aad8-4b56-4c03-a96a-af05565eec6e",
      pay_method: "card",
      merchant_uid: `mid_${new Date().getTime()}`,
      amount: finalAmount,
      name: orderName,
      buyer_name: name || email,
      buyer_tel: receiverPhone,
      buyer_email: email,
      buyer_addr: `${address} ${addressDetail}`,
      buyer_postcode: zipcode,
      app_scheme: "digitalTwin",
    };

    // DB 쿠폰 ID 추출 (db- prefix 제거)
    const dbCouponId = selectedCouponId?.startsWith('db-')
      ? Number(selectedCouponId.replace('db-', ''))
      : null;

    IMP.request_pay(data, async (response: RequestPayResponse) => {
      const { success, error_msg, imp_uid, merchant_uid } = response;
      if (success) {
        try {
          await axios.post('/api/orders', {
            email,
            imp_uid,
            merchant_uid,
            total_product_amount: totalPrice,
            shipping_fee: shippingFee,
            discount_amount: usePoints + couponDiscount,
            used_points: usePoints,
            used_coupon_id: dbCouponId,
            coupon_discount: couponDiscount,
            amount: finalAmount,
            items: items,
            fromCart: fromCart,
            receiver_name: receiverName,
            receiver_phone: receiverPhone,
            shipping_address: `[${zipcode}] ${address} ${addressDetail}`,
            shipping_message: message,
            is_gift: isGift
          });

          // 지도 쿠폰 사용 시 localStorage에서 제거
          if (selectedCouponId?.startsWith('map-')) {
            const usedMapId = selectedCouponId.replace('map-', '');
            try {
              const stored = JSON.parse(localStorage.getItem('mapCoupons') || '[]');
              localStorage.setItem('mapCoupons', JSON.stringify(stored.filter((c: any) => c.id !== usedMapId)));
            } catch (_) { }
          }

          sessionStorage.removeItem("checkout_items");
          sessionStorage.removeItem("checkout_from_cart");
          sessionStorage.removeItem("checkout_is_gift");
          alert("결제 성공!");
          window.location.href = "/orders";
        } catch (err) {
          alert("주문 처리 중 오류가 발생했습니다.");
        }
      } else {
        alert(`결제 실패: ${error_msg}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="page-container shop-bg">
        <div className="loading-container h-260">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="💳"
        title="주문서 작성"
        subtitle="배송지 정보 입력 및 결제"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/cart", label: "장바구니로 돌아가기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-900 flex-col gap-2rem">

          {/* 상품 정보 영역 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary text-16-bold">주문 상품 정보 ({items.length}개)</h2>
            </div>
            <table className="shopping-table">
              <thead>
                <tr>
                  <th className="shopping-th">상품명</th>
                  <th className="shopping-th text-center">수량</th>
                  <th className="shopping-th text-right">금액</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className={`product-row ${idx % 2 === 0 ? "td-cell-even" : "td-cell-odd"}`}>
                    <td className="td-cell text-14-bold text-primary">
                      {item.product_name}
                      {item.option_name && <span className="text-13 text-accent ml-xs">({item.option_name})</span>}
                    </td>
                    <td className="td-cell text-center">
                      <span className="text-14 font-mono text-primary">{item.quantity}</span>
                    </td>
                    <td className="td-cell text-right">
                      <div className="text-14-money text-green">₩{(item.unit_price * item.quantity).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="order-summary-footer">
              <span className="text-12 text-muted uppercase">총 상품금액</span>
              <span className="text-20-money text-green ml-8px">₩{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* 배송지/선물 정보 입력 영역 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary text-16-bold">
                {isGift ? "받는 사람 정보" : "배송지 정보"}
              </h2>
            </div>
            <div className="p-1-5rem flex-col gap-1rem">
              <div className="flex-col gap-6px">
                <label className="text-13 text-muted">성명 <span className="text-red">*</span></label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="search-input"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="flex-col gap-6px">
                <label className="text-13 text-muted">연락처 <span className="text-red">*</span></label>
                <input
                  type="text"
                  value={receiverPhone}
                  onChange={e => setReceiverPhone(e.target.value)}
                  className="search-input"
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="flex-col gap-6px">
                <label className="text-13 text-muted">주소 <span className="text-red">*</span></label>
                <div style={{ fontSize: '12px', color: '#545874', marginBottom: '8px' }}>
                  💡 <strong>주소 검색 방법:</strong> 
                  <br />1. "우편번호 찾기" 버튼 클릭
                  <br />2. 검색창에 "부산 해운대구" 등 <span style={{ color: '#38bdf8' }}>구체적인 지역명</span> 입력 
                  <br />3. <span style={{ color: '#ef4444', fontWeight: 'bold' }}>엔터를 누르지 말고</span> 나타나는 주소 목록에서 <span style={{ color: '#10b981', fontWeight: 'bold' }}>정확한 주소를 클릭</span>하세요
                  <br />4. 주소가 자동으로 입력되면 상세주소를 추가로 입력하세요
                </div>
                <div className="flex-row gap-8px">
                  <input
                    type="text"
                    value={zipcode}
                    readOnly
                    className="search-input w-120"
                    placeholder="우편번호"
                  />
                  <button
                    type="button"
                    onClick={handleOpenPostcode}
                    className="btn-outline-secondary"
                    disabled={isPostcodeLoading}
                  >
                    {isPostcodeLoading ? "로딩중..." : "우편번호 찾기"}
                  </button>
                </div>
                {isPostcodeOpen && (
                  <div className="postcode-wrapper">
                    <button
                      type="button"
                      onClick={handleClosePostcode}
                      className="postcode-close-btn"
                    >
                      닫기 ✕
                    </button>
                    {isPostcodeLoading ? (
                      <div style={{ 
                        height: '400px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: '#1a1d27'
                      }}>
                        <div style={{ textAlign: 'center', color: '#8b90a7' }}>
                          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                          <div>주소 검색 서비스를 불러오는 중...</div>
                        </div>
                      </div>
                    ) : (
                      <DaumPostcodeEmbed 
                        key={`postcode-${postcodeKey}`}
                        onComplete={handleCompletePostcode}
                        onClose={handleClosePostcode}
                        autoClose={true}
                        defaultQuery=""
                        animation={false}
                        useBannerLink={false}
                        hideMapBtn={true}
                        hideEngBtn={true}
                        alwaysShowEngAddr={false}
                        style={{ 
                          width: '100%', 
                          height: '400px',
                          border: 'none'
                        }}
                      />
                    )}
                  </div>
                )}
                {addressSuccessMessage && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '6px',
                    color: '#10b981',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {addressSuccessMessage}
                  </div>
                )}
                <input
                  type="text"
                  value={address}
                  readOnly
                  className="search-input mt-4px"
                  placeholder="기본 주소"
                  style={{
                    borderColor: address ? '#10b981' : '#2e3247',
                    background: address ? 'rgba(16,185,129,0.05)' : 'rgba(10, 14, 26, 0.6)'
                  }}
                />
                <input
                  type="text"
                  value={addressDetail}
                  onChange={e => setAddressDetail(e.target.value)}
                  className="search-input mt-4px"
                  placeholder="상세 주소를 입력해주세요"
                  style={{
                    borderColor: addressDetail ? '#10b981' : '#2e3247'
                  }}
                />
              </div>

              {isGift ? (
                <div className="flex-col gap-6px">
                  <label className="text-13 text-muted">선물 메시지</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="search-input"
                    placeholder="선물과 함께 보낼 메시지를 작성해보세요 (선택)"
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                </div>
              ) : (
                <div className="flex-col gap-6px">
                  <label className="text-13 text-muted">배송 요청사항</label>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="search-input"
                    placeholder="문 앞에 놓아주세요"
                  />
                </div>
              )}
            </div>

            <div className="p-1-5rem border-top-default flex-col gap-1rem">
              <div className="title-banner p-0">
                <h2 className="margin-0 text-primary text-16-bold">할인 및 적립</h2>
              </div>

              <div className="flex-col gap-6px">
                <label className="text-13 text-muted">쿠폰 할인</label>
                {mapCoupons.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '8px 12px', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🗺️</span>
                    <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>지도에서 획득한 쿠폰 {mapCoupons.length}개 있음!</span>
                  </div>
                )}
                <select
                  className="search-input"
                  value={selectedCouponId || ""}
                  onChange={e => setSelectedCouponId(e.target.value || null)}
                >
                  <option value="">사용 안함</option>
                  {mapCoupons.length > 0 && (
                    <optgroup label="🗺️ 지도 쿠폰">
                      {mapCoupons.map(c => (
                        <option key={`map-${c.id}`} value={`map-${c.id}`}>
                          {c.name} — {c.discount}% 할인
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {coupons.length > 0 && (
                    <optgroup label="🎟️ 보유 쿠폰">
                      {coupons.map(c => (
                        <option key={`db-${c.user_coupon_id}`} value={`db-${c.user_coupon_id}`}>
                          {c.name} ({c.discount_type === "PERCENT" ? `${c.discount_value}%` : `${c.discount_value.toLocaleString()}원`} 할인) - {c.min_order_amount > 0 ? `${c.min_order_amount.toLocaleString()}원 이상` : "조건 없음"}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="flex-col gap-6px">
                <label className="text-13 text-muted">포인트 사용 (보유: {availablePoints.toLocaleString()} P)</label>
                <div className="flex-row gap-8px">
                  <input
                    type="number"
                    value={usePoints}
                    onChange={e => {
                      const val = Math.max(0, Math.min(Number(e.target.value), availablePoints, totalPrice + shippingFee));
                      setUsePoints(val);
                    }}
                    className="search-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleUseAllPoints}
                    className="btn-outline-secondary"
                  >
                    전액 사용
                  </button>
                </div>
              </div>
            </div>

            <div className="p-1-5rem border-top-default flex-col gap-1rem">
              <div className="title-banner p-0">
                <h2 className="margin-0 text-primary text-16-bold">결제 수단 선택</h2>
              </div>

              {/* 결제 수단 토글 */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  style={{
                    flex: 1, padding: "14px", borderRadius: "10px", border: "2px solid",
                    borderColor: paymentMethod === "card" ? "#6366f1" : "rgba(255,255,255,0.1)",
                    background: paymentMethod === "card" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                    color: paymentMethod === "card" ? "#fff" : "#94a3b8",
                    cursor: "pointer", fontWeight: 700, fontSize: "14px", transition: "all 0.18s",
                  }}
                >
                  💳 일반 결제 (카드)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  style={{
                    flex: 1, padding: "14px", borderRadius: "10px", border: "2px solid",
                    borderColor: paymentMethod === "crypto" ? "#10b981" : "rgba(255,255,255,0.1)",
                    background: paymentMethod === "crypto" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                    color: paymentMethod === "crypto" ? "#fff" : "#94a3b8",
                    cursor: "pointer", fontWeight: 700, fontSize: "14px", transition: "all 0.18s",
                  }}
                >
                  ⛓️ 암호화폐 결제
                </button>
              </div>

              {paymentMethod === "crypto" && (
                <div style={{ padding: "12px 14px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", fontSize: "13px", color: "#6ee7b7" }}>
                  ⚠️ ETH / USDC / DAI 중 선택해서 결제합니다. MetaMask가 필요합니다.
                  {(() => {
                    const sellerIds = [...new Set(items.map(i => i.seller_id).filter(Boolean))];
                    if (sellerIds.length > 1) {
                      return <div style={{ marginTop: "8px", color: "#f87171" }}>⛔ 여러 판매자 상품이 혼재되어 암호화폐 결제가 불가합니다. 판매자별로 따로 주문해주세요.</div>;
                    }
                    if (sellerIds.length === 0) {
                      return <div style={{ marginTop: "8px", color: "#f87171" }}>⛔ 판매자 정보가 없어 암호화폐 결제를 사용할 수 없습니다.</div>;
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            <div className="checkout-summary border-top-default flex-row-between items-center">
              <div className="flex-col gap-sm flex-1 pr-2rem">
                <div className="flex-row-between">
                  <span className="text-14 text-muted">총 상품금액</span>
                  <span className="text-14-bold text-primary">₩{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex-row-between">
                  <span className="text-14 text-muted">배송비</span>
                  <span className="text-14 text-primary">+{shippingFee.toLocaleString()}원</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex-row-between">
                    <span className="text-14 text-muted">쿠폰 할인</span>
                    <span className="text-14-bold text-accent">-{couponDiscount.toLocaleString()}원</span>
                  </div>
                )}
                {usePoints > 0 && (
                  <div className="flex-row-between">
                    <span className="text-14 text-muted">포인트 사용</span>
                    <span className="text-14-bold text-accent">-{usePoints.toLocaleString()} P</span>
                  </div>
                )}
                <div className="flex-row-between items-end">
                  <div>
                    <div className="text-12 text-muted uppercase">최종 결제금액</div>
                    <div className="text-28-money text-green">₩{finalAmount.toLocaleString()}</div>
                  </div>
                  {sharedMembersCount > 1 && (
                    <div className="p-xs px-sm bg-surface-inner rounded-md border-default border-left-accent text-right">
                      <div className="text-11 text-muted">👫 1/N 정산 시 (1인당)</div>
                      <div className="text-14-bold text-accent">약 {Math.floor(finalAmount / sharedMembersCount).toLocaleString()}원</div>
                    </div>
                  )}
                </div>
              </div>
              {paymentMethod === "card" ? (
                <button className="pay-btn flex-none w-200" onClick={handlePayment}>
                  💳 카드로 결제하기
                </button>
              ) : (
                <button
                  className="pay-btn flex-none w-200"
                  onClick={handleCryptoPayment}
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  disabled={(() => {
                    const sellerIds = [...new Set(items.map(i => i.seller_id).filter(Boolean))];
                    return sellerIds.length !== 1;
                  })()}
                >
                  ⛓️ 암호화폐 결제하기
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}