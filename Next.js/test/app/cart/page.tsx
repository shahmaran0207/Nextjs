"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import "../Shopping/shopping.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

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
      if (!res.ok) throw new Error(data.error || "장바구니를 불러오지 못했습니다.");
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
      <header className="shopping-header">
        <div className="flex-row-center gap-12">
          <div className="logo-icon">🛒</div>
          <div>
            <h1 className="header-title text-primary">장바구니</h1>
            <p className="header-subtitle text-accent">담아둔 상품을 확인하세요</p>
          </div>
        </div>
        <nav className="flex-row-center gap-2">
          <Link href="/Shopping" className="nav-link">쇼핑 계속하기</Link>
          <Link href="/" className="nav-link">홈으로</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          {loading && (
            <div className="loading-container h-260">
              <div className="spinner" />
              <span className="text-14">장바구니를 불러오는 중...</span>
            </div>
          )}

          {error && <div className="error-container">⚠️ {error}</div>}

          {!loading && !error && (
            <>
              <div className="title-banner">
                <div className="flex-row-center gap-12">
                  <span className="category-badge">내 장바구니</span>
                  <h2 className="margin-0 text-primary" style={{ fontSize: "18px", fontWeight: 700 }}>
                    총 {items.length}개의 상품
                  </h2>
                </div>
                <div className="flex-row-center gap-8">
                  <button onClick={handleDeleteSelected} className="btn-outline-secondary">선택 삭제</button>
                  <button onClick={handleEmptyCart} className="btn-outline-danger">장바구니 비우기</button>
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
                                  <img src={item.product_image} alt={item.product_name} className="product-img-small" />
                                ) : (
                                  <div className="img-placeholder bg-grid" style={{ background: "rgba(56,189,248,0.05)" }}>📦</div>
                                )}
                                <div>
                                  <div className="text-14-bold text-primary">{item.product_name}</div>
                                  {!item.is_active && <div className="text-11 text-red mt-2px">판매 중지된 상품</div>}
                                </div>
                              </div>
                            </td>
                            <td className="td-cell text-center">
                              <span className="text-14 font-mono text-primary">{item.quantity}</span>
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
                      ⚡ 선택 상품 결제하기 ({selectedItemIds.length}개)
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
