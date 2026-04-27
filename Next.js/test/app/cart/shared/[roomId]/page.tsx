"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { PageHeader } from "@/component/PageHeader";
import "../../shopping.css";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  qty: number;
  option_id?: number | null;
  option_name?: string | null;
  add_price?: number;
  image_url?: string | null;
}

export default function SharedCartPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { email } = useAuthGuard();
  const roomId = params.roomId;

  const [items, setItems] = useState<CartItem[]>([]);
  const [participants, setParticipants] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Join the shared cart room
      ws.send(JSON.stringify({ type: "join_cart", roomId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "cart_sync") {
          setItems(data.items);
        } else if (data.type === "cart_participants") {
          setParticipants(data.count);
        }
      } catch (err) {
        console.error("Failed to parse message", err);
      }
    };

    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, [roomId]);

  // Handle syncing to server
  const broadcastCart = (newItems: CartItem[]) => {
    setItems(newItems);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "update_cart", roomId, items: newItems }));
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const newItems = items.filter((_, idx) => idx !== indexToRemove);
    broadcastCart(newItems);
  };

  const handleQtyChange = (index: number, delta: number) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item.qty + delta > 0) {
      item.qty += delta;
      broadcastCart(newItems);
    }
  };

  // Import my local cart into shared cart
  const importLocalCart = async () => {
    try {
      const res = await fetch("/api/Shopping/Cart");
      if (res.ok) {
        const localCart = await res.json();
        // Append local cart to shared cart, avoiding exact duplicates could be complex, 
        // so we just append for now as it's a shared session
        const newItems = [...items, ...localCart];
        broadcastCart(newItems);
        alert("내 장바구니의 상품을 공유 장바구니에 추가했습니다!");
      } else {
        alert("로컬 장바구니를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate totals
  const totalAmount = items.reduce((sum, item) => sum + ((item.price + (item.add_price || 0)) * item.qty), 0);
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  const handleSharedCheckout = () => {
    if (items.length === 0) return alert("장바구니가 비어있습니다.");
    // Save to checkout session
    const checkoutItems = items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      option_id: item.option_id,
      option_name: item.option_name,
      price: item.price,
      add_price: item.add_price || 0,
      qty: item.qty
    }));

    sessionStorage.setItem("checkout_items", JSON.stringify(checkoutItems));
    sessionStorage.setItem("checkout_from_cart", "true");
    // Save participant count for 1/N UI
    sessionStorage.setItem("shared_members_count", String(participants));

    router.push("/checkout");
  };

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="🤝"
        title="1/N 공유 장바구니"
        subtitle={`현재 ${participants}명이 함께 쇼핑 중입니다`}
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/Shopping", label: "쇼핑 계속하기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-1100 flex-row gap-lg">

          {/* 장바구니 목록 영역 */}
          <div className="flex-1 flex-col gap-1rem">
            <div className="flex-justify-between items-center bg-surface-inner p-md rounded-lg border-default mb-2">
              <div className="flex-row items-center gap-xs">
                <span className={`status-badge ${isConnected ? 'active' : 'inactive'}`}>
                  {isConnected ? "실시간 동기화 중" : "연결 끊김"}
                </span>
                <span className="text-13 text-muted">방 코드: {roomId}</span>
              </div>
              <button onClick={importLocalCart} className="btn-outline-primary btn-sm">
                + 내 장바구니 상품 합치기
              </button>
            </div>

            {items.length === 0 ? (
              <div className="card-container shop-surface border-default p-2rem text-center">
                <div className="text-48 mb-1rem">🛒</div>
                <h3 className="text-18 text-primary mb-xs">장바구니가 비어있습니다</h3>
                <p className="text-14 text-muted mb-1rem">친구들과 함께 결제할 상품을 담아보세요!</p>
                <button className="btn-accent" onClick={() => router.push("/Shopping")}>상품 보러가기</button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="card-container shop-surface border-default p-md flex-row gap-md">
                  <div className="product-image-placeholder w-100 h-100">
                    <span className="text-32">🛍️</span>
                  </div>
                  <div className="flex-1 flex-col justify-between">
                    <div>
                      <div className="flex-justify-between mb-xs">
                        <h3 className="text-16-bold text-primary margin-0">{item.product_name}</h3>
                        <button
                          className="btn-danger btn-sm p-xs"
                          onClick={() => handleRemove(index)}
                        >
                          ✕
                        </button>
                      </div>
                      {item.option_name && (
                        <div className="text-13 text-secondary mb-xs">
                          옵션: {item.option_name} (+{item.add_price?.toLocaleString()}원)
                        </div>
                      )}
                    </div>
                    <div className="flex-justify-between items-end mt-sm pt-sm border-top-default">
                      <div className="flex-row items-center gap-xs">
                        <button className="qty-btn" onClick={() => handleQtyChange(index, -1)}>-</button>
                        <span className="text-14-bold text-primary w-24 text-center">{item.qty}</span>
                        <button className="qty-btn" onClick={() => handleQtyChange(index, 1)}>+</button>
                      </div>
                      <div className="text-18-bold text-primary">
                        {((item.price + (item.add_price || 0)) * item.qty).toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 결제 요약 패널 */}
          <div className="w-320">
            <div className="card-container shop-surface border-default p-lg sticky top-100">
              <h3 className="text-18-bold text-primary mb-md border-bottom-default pb-sm">함께 결제하기</h3>

              <div className="flex-col gap-sm mb-lg">
                <div className="flex-justify-between text-14 text-secondary">
                  <span>총 상품 개수</span>
                  <span>{totalQty}개</span>
                </div>
                <div className="flex-justify-between text-14 text-secondary">
                  <span>참여 인원</span>
                  <span className="text-accent font-bold">{participants}명</span>
                </div>
                <div className="flex-justify-between text-18-bold text-primary mt-sm pt-sm border-top-default">
                  <span>총 결제 금액</span>
                  <span className="text-24-money text-green">{totalAmount.toLocaleString()}원</span>
                </div>

                {/* 1/N 정산 미리보기 */}
                {participants > 1 && totalAmount > 0 && (
                  <div className="mt-sm p-md bg-surface-inner rounded-lg border-default border-left-accent">
                    <div className="text-12 text-muted mb-xs">👫 1인당 예상 부담금 (1/N)</div>
                    <div className="text-16-bold text-accent">
                      약 {Math.floor(totalAmount / participants).toLocaleString()}원
                    </div>
                  </div>
                )}
              </div>

              <button
                className="btn-success btn-lg w-full"
                onClick={handleSharedCheckout}
                disabled={items.length === 0}
              >
                대표로 결제하기 (N빵 정산)
              </button>

              <p className="text-12 text-muted mt-sm text-center">
                대표 1인이 전액 결제 후,<br />나머지 인원에게 1/N 청구를 안내해 드립니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
