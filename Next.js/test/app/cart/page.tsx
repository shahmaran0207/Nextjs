"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import "../Shopping/shopping.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { PageHeader } from "@/component/PageHeader";

interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_image: string | null;
  product_stock: number;
  is_active: boolean;
  option_name?: string | null;
}

export default function CartPage() {
  const { email, name } = useAuthGuard();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = async () => {
    if (!email) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/cart/items?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "장바구니를 불러올 수 없습니다.");
      const fetchedItems = data.items || [];
      setItems(fetchedItems);
      setSelectedItemIds(fetchedItems.map((item: CartItem) => item.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchCartItems();
    }
  }, [email]);

  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(item => item.id));
    }
  };

  const handleToggleSelect = (itemId: number) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    if (!email) return;

    try {
      const res = await fetch(`/api/cart/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQty, email })
      });

      if (res.ok) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
      } else {
        const data = await res.json();
        alert(data.error || "수량 변경에 실패했습니다.");
      }
    } catch (err) {
      alert("수량 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm("장바구니에서 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/cart/items?itemId=${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        setSelectedItemIds(prev => prev.filter(id => id !== itemId));
      } else {
        const data = await res.json();
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItemIds.length === 0) return alert("삭제할 상품을 선택해주세요.");
    if (!confirm(`선택한 ${selectedItemIds.length}개의 상품을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/cart/items?itemIds=${selectedItemIds.join(",")}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(item => !selectedItemIds.includes(item.id)));
        setSelectedItemIds([]);
      } else {
        const data = await res.json();
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEmptyCart = async () => {
    if (!email) return;
    if (!confirm("장바구니를 모두 비우시겠습니까?")) return;

    try {
      const res = await fetch(`/api/cart/items?empty=true&email=${encodeURIComponent(email)}`, { method: "DELETE" });
      if (res.ok) {
        setItems([]);
        setSelectedItemIds([]);
      } else {
        const data = await res.json();
        alert(data.error || "비우기에 실패했습니다.");
      }
    } catch (err) {
      alert("비우기 중 오류가 발생했습니다.");
    }
  };

  const totalPrice = useMemo(() => {
    return items
      .filter(item => selectedItemIds.includes(item.id))
      .reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  }, [items, selectedItemIds]);

  const handlePayment = () => {
    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    if (selectedItems.length === 0) return alert("결제할 상품을 선택해주세요.");

    sessionStorage.setItem("checkout_items", JSON.stringify(
      selectedItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        unit_price: item.unit_price,
        quantity: item.quantity
      }))
    ));
    sessionStorage.setItem("checkout_from_cart", "true");
    window.location.href = "/checkout";
  };

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="🛒"
        title="장바구니"
        subtitle="담아둔 상품을 확인하세요"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/Shopping", label: "쇼핑 계속하기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          {loading && (
            <div className="loading-container h-260">
              <div className="spinner" />
              <span className="text-14">장바구니를 불러오는 중..</span>
            </div>
          )}

          {error && <div className="error-container">⚠ {error}</div>}

          {!loading && !error && (
            <>
              <div className="title-banner">
                <div className="flex-row-center gap-12">
                  <span className="category-badge">내 장바구니</span>
                  <h2 className="margin-0 text-primary text-18 text-bold">
                    총 {items.length}개의 상품
                  </h2>
                </div>
                <div className="flex-row-center gap-8">
                  <button onClick={handleDeleteSelected} className="btn-outline-secondary">선택 삭제</button>
                  <button onClick={handleEmptyCart} className="btn-outline-danger">장바구니 비우기</button>
                  <button 
                    onClick={() => {
                      const newRoomId = Math.random().toString(36).substring(2, 8);
                      window.location.href = `/cart/shared/${newRoomId}`;
                    }} 
                    className="btn-outline-primary"
                    style={{ borderColor: "#8b5cf6", color: "#8b5cf6", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    🤝 1/N 공유 장바구니 만들기
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="card-container empty-table-cell border-default">
                  <div className="empty-state-icon">🛒</div>
                  <p>장바구니가 비어 있습니다.</p>
                  <Link href="/Shopping" className="nav-link empty-state-link">
                    쇼핑하러 가기
                  </Link>
                </div>
              ) : (
                <div className="product-detail-layout">
                  <div className="card-container shop-surface border-default">
                    <table className="shopping-table">
                      <thead>
                        <tr>
                          <th className="shopping-th th-center-40">
                            <input
                              type="checkbox"
                              checked={items.length > 0 && selectedItemIds.length === items.length}
                              onChange={handleToggleSelectAll}
                              className="cursor-pointer"
                            />
                          </th>
                          <th className="shopping-th">상품정보</th>
                          <th className="shopping-th text-center">수량</th>
                          <th className="shopping-th text-right">상품금액</th>
                          <th className="shopping-th text-center">삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={item.id} className={`product-row ${index % 2 === 0 ? "td-cell-even" : "td-cell-odd"}`}>
                            <td className="td-cell td-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedItemIds.includes(item.id)}
                                onChange={() => handleToggleSelect(item.id)}
                                className="cursor-pointer"
                              />
                            </td>
                            <td className="td-cell">
                              <div className="flex-row-center gap-12">
                                {item.product_image ? (
                                  <img src={`/api/images/products/${item.product_id}`} alt={item.product_name} className="product-img-small" />
                                ) : (
                                  <div className="img-placeholder bg-dim">📷</div>
                                )}
                                <div>
                                  <div className="text-14-bold text-primary">
                                    {item.product_name}
                                    {item.option_name && <span className="text-13 text-accent ml-xs">({item.option_name})</span>}
                                  </div>
                                  {!item.is_active && <div className="text-11 text-red mt-2px">판매 중단된 상품</div>}
                                </div>
                              </div>
                            </td>
                            <td className="td-cell text-center">
                              <div className="flex-row-center gap-6 justify-center">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="btn-outline-secondary btn-sm px-8px py-4px"
                                >
                                  -
                                </button>
                                <span className="text-14 font-mono text-primary w-40 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="btn-outline-secondary btn-sm px-8px py-4px"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="td-cell text-right">
                              <div className="text-14-money text-green">
                                ₩{(item.unit_price * item.quantity).toLocaleString()}
                              </div>
                            </td>
                            <td className="td-cell text-center">
                              <button onClick={() => handleDelete(item.id)} className="btn-delete-small">
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-container shop-surface border-default checkout-summary">
                    <div className="text-right">
                      <div className="text-12 text-muted uppercase">총 결제금액</div>
                      <div className="text-28-money text-green">₩{totalPrice.toLocaleString()}</div>
                    </div>
                    <button className="pay-btn flex-none w-200" onClick={handlePayment}>
                      선택 상품 결제하기 ({selectedItemIds.length}개)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
