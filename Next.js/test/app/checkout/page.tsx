"use client";

import { useEffect, useState } from "react";
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

  // 배송지 폼 상태
  const [receiverName, setReceiverName] = useState(name || "");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [message, setMessage] = useState("");

  // 우편번호 모달 상태
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

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

  const handleCompletePostcode = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    setZipcode(data.zonecode);
    setAddress(fullAddress);
    setIsPostcodeOpen(false);
  };

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
                    onClick={() => setIsPostcodeOpen(true)}
                    className="btn-outline-secondary"
                  >
                    우편번호 찾기
                  </button>
                </div>
                {isPostcodeOpen && (
                  <div className="postcode-wrapper">
                    <button
                      type="button"
                      onClick={() => setIsPostcodeOpen(false)}
                      className="postcode-close-btn"
                    >
                      닫기 ✕
                    </button>
                    <DaumPostcodeEmbed onComplete={handleCompletePostcode} className="h-400" />
                  </div>
                )}
                <input
                  type="text"
                  value={address}
                  readOnly
                  className="search-input mt-4px"
                  placeholder="기본 주소"
                />
                <input
                  type="text"
                  value={addressDetail}
                  onChange={e => setAddressDetail(e.target.value)}
                  className="search-input mt-4px"
                  placeholder="상세 주소를 입력해주세요"
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