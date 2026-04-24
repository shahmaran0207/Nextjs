"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import Link from "next/link";
import "../Shopping/shopping.css";
import axios from "axios";
import DaumPostcodeEmbed from "react-daum-postcode";
import { RequestPayParams, RequestPayResponse } from "@/types/paymentType";

interface CheckoutItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  option_name?: string | null;
}

export default function CheckoutPage() {
  const { email, name } = useAuthGuard();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [fromCart, setFromCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [usePoints, setUsePoints] = useState<number>(0);

  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
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
    
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
    if (storedFromCart === "true") {
      setFromCart(true);
    }
    
    // Fetch user points from existing Auth API
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(`/api/auth/Me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setAvailablePoints(Number(res.data.points) || 0))
        .catch(err => console.error(err));
    }

    // Fetch user coupons
    if (email) {
      axios.get(`/api/coupons?email=${encodeURIComponent(email)}`)
        .then(res => setCoupons(res.data.coupons || []))
        .catch(err => console.error(err));
    }

    setLoading(false);
  }, [email]);

  const totalPrice = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const shippingFee = totalPrice >= 50000 ? 0 : 3000;

  // 쿠폰 할인 계산
  useEffect(() => {
    if (!selectedCouponId) {
      setCouponDiscount(0);
      return;
    }
    const coupon = coupons.find(c => c.user_coupon_id === selectedCouponId);
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
  }, [selectedCouponId, totalPrice, coupons]);

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
            discount_amount: usePoints + couponDiscount, // 총 할인
            used_points: usePoints,
            used_coupon_id: selectedCouponId,
            coupon_discount: couponDiscount,
            amount: finalAmount,
            items: items,
            fromCart: fromCart,
            receiver_name: receiverName,
            receiver_phone: receiverPhone,
            shipping_address: `[${zipcode}] ${address} ${addressDetail}`,
            shipping_message: message
          });
          
          // 결제 성공 후 세션스토리지 초기화
          sessionStorage.removeItem("checkout_items");
          sessionStorage.removeItem("checkout_from_cart");
          
          alert("결제 성공!!!");
          window.location.href = "/orders";
        } catch (err) {
          alert("주문 처리 중 오류가 발생했습니다.");
        }
      } else {
        alert(`결제 실패: ${error_msg}`);
      }
    });
  };

  if (loading) return <div className="page-container shop-bg"><div className="loading-container h-260"><div className="spinner" /></div></div>;

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div className="flex-row-center gap-12">
          <div className="logo-icon">💳</div>
          <div>
            <h1 className="header-title text-primary">주문서 작성</h1>
            <p className="header-subtitle text-accent">배송지 정보 입력 및 결제</p>
          </div>
        </div>
        <nav className="flex-row-center gap-2">
          <Link href="/cart" className="nav-link">장바구니로 돌아가기</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900" style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
          
          {/* 상품 정보 영역 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary" style={{ fontSize: "16px" }}>주문 상품 정보 ({items.length}개)</h2>
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
                    <td className="td-cell text-center"><span className="text-14 font-mono text-primary">{item.quantity}</span></td>
                    <td className="td-cell text-right">
                      <div className="text-14-money text-green">₩{(item.unit_price * item.quantity).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="order-summary-footer">
              <span className="text-12 text-muted uppercase">총 상품금액</span>
              <span className="text-20-money text-green" style={{ marginLeft: "8px" }}>₩{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* 배송지 정보 입력 영역 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary" style={{ fontSize: "16px" }}>배송지 정보</h2>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="text-13 text-muted">수령인 <span className="text-red">*</span></label>
                <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="search-input" placeholder="이름을 입력하세요" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="text-13 text-muted">연락처 <span className="text-red">*</span></label>
                <input type="text" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} className="search-input" placeholder="010-0000-0000" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="text-13 text-muted">주소 <span className="text-red">*</span></label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" value={zipcode} readOnly className="search-input" placeholder="우편번호" style={{ width: "120px" }} />
                  <button type="button" onClick={() => setIsPostcodeOpen(true)} className="btn-outline-secondary">우편번호 찾기</button>
                </div>
                {isPostcodeOpen && (
                  <div style={{ border: "1px solid #3a3f5c", marginTop: "8px", position: "relative" }}>
                    <button type="button" onClick={() => setIsPostcodeOpen(false)} style={{ position: "absolute", right: "0", top: "0", zIndex: 1, padding: "4px 8px", background: "none", border: "none", color: "white", cursor: "pointer" }}>닫기 ✕</button>
                    <DaumPostcodeEmbed onComplete={handleCompletePostcode} style={{ height: "400px" }} />
                  </div>
                )}
                <input type="text" value={address} readOnly className="search-input" placeholder="기본 주소" style={{ marginTop: "4px" }} />
                <input type="text" value={addressDetail} onChange={e => setAddressDetail(e.target.value)} className="search-input" placeholder="상세 주소를 입력해주세요" style={{ marginTop: "4px" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="text-13 text-muted">배송 요청사항</label>
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} className="search-input" placeholder="문 앞에 놓아주세요." />
              </div>
            </div>
            
            <div style={{ padding: "1.5rem", borderTop: "1px solid #2e3247", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="title-banner" style={{ padding: "0" }}>
                <h2 className="margin-0 text-primary" style={{ fontSize: "16px" }}>할인 및 적립</h2>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="text-13 text-muted">쿠폰 할인</label>
                <select 
                  className="search-input" 
                  value={selectedCouponId || ""} 
                  onChange={e => setSelectedCouponId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">사용 안 함</option>
                  {coupons.map(c => (
                    <option key={c.user_coupon_id} value={c.user_coupon_id}>
                      {c.name} ({c.discount_type === "PERCENT" ? `${c.discount_value}%` : `${c.discount_value.toLocaleString()}원`} 할인) - {c.min_order_amount > 0 ? `${c.min_order_amount.toLocaleString()}원 이상 구매시` : "조건 없음"}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="text-13 text-muted">포인트 사용 (보유: {availablePoints.toLocaleString()} P)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="number" 
                    value={usePoints} 
                    onChange={e => {
                      const val = Math.max(0, Math.min(Number(e.target.value), availablePoints, totalPrice + shippingFee));
                      setUsePoints(val);
                    }} 
                    className="search-input" 
                    style={{ flex: 1 }} 
                  />
                  <button type="button" onClick={handleUseAllPoints} className="btn-outline-secondary">전액 사용</button>
                </div>
              </div>
            </div>

            <div className="checkout-summary" style={{ borderTop: "1px solid #2e3247", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, paddingRight: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="text-14 text-muted">총 상품금액</span>
                    <span className="text-14-bold text-primary">₩{totalPrice.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="text-14 text-muted">배송비</span>
                    <span className="text-14 text-primary">+{shippingFee.toLocaleString()}원</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="text-14 text-muted">쿠폰 할인</span>
                      <span className="text-14-bold text-accent">-{couponDiscount.toLocaleString()}원</span>
                    </div>
                  )}
                  {usePoints > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="text-14 text-muted">포인트 사용</span>
                      <span className="text-14-bold text-accent">-{usePoints.toLocaleString()} P</span>
                    </div>
                  )}
                <div>
                  <div className="text-12 text-muted uppercase">최종 결제금액</div>
                  <div className="text-28-money text-green">₩{finalAmount.toLocaleString()}</div>
                </div>
              </div>
              <button className="pay-btn flex-none w-200" onClick={handlePayment}>
                ⚡ 결제하기
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
