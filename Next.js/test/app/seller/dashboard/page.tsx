"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../../Shopping/shopping.css";
import axios from "axios";
import { PageHeader } from "@/component/PageHeader";

export default function SellerDashboardPage() {
  const { email } = useAuthGuard();
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"amount" | "count">("amount");

  // 차트 라인 색상을 자동으로 생성하기 위한 색상 배열
  const colors = ["#38bdf8", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  useEffect(() => {
    if (!email) return;
    axios.get(`/api/seller/dashboard?email=${encodeURIComponent(email)}`)
      .then(res => {
        setMonthlySales(res.data.monthlySales || []);
        setProductSales(res.data.productSales || []);
        setProductsList(res.data.productsList || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [email]);

  if (loading) return <div className="page-container shop-bg"><div className="loading-container h-260"><div className="spinner" /></div></div>;

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="📈"
        title="판매자 매출 통계"
        subtitle="최근 6개월간의 매출 및 상품 판매 추이입니다"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/seller/orders", label: "주문 관리" },
          { href: "/myproducts", label: "내 상품 관리" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-1100">

          <div className="card-container shop-surface border-default p-md">
            <div className="flex-row-between mb-md">
              <h2 className="text-16-bold text-primary margin-0">
                {viewType === "amount" ? "월별 총 판매 금액 추이" : "상품별 월별 판매 건수 추이"}
              </h2>
              <select
                value={viewType}
                onChange={e => setViewType(e.target.value as "amount" | "count")}
                className="input-field"
                style={{ width: "200px" }}
              >
                <option value="amount">월별 판매 금액 (원)</option>
                <option value="count">상품별 판매 건수 (개)</option>
              </select>
            </div>

            {viewType === "amount" ? (
              <div style={{ width: "100%", height: 450 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlySales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e3247" />
                    <XAxis dataKey="month" stroke="#8b90a7" tick={{ fill: '#8b90a7' }} />
                    <YAxis stroke="#8b90a7" tick={{ fill: '#8b90a7' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#2e3247', color: '#e8eaf0' }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="판매 금액 (원)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              productsList.length > 0 ? (
                <div style={{ width: "100%", height: 450 }}>
                  <ResponsiveContainer>
                    <LineChart data={productSales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2e3247" />
                      <XAxis dataKey="month" stroke="#8b90a7" tick={{ fill: '#8b90a7' }} />
                      <YAxis stroke="#8b90a7" tick={{ fill: '#8b90a7' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#2e3247', color: '#e8eaf0' }}
                      />
                      <Legend />
                      {productsList.map((productName, idx) => (
                        <Line
                          key={idx}
                          type="monotone"
                          dataKey={productName}
                          name={productName}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-table-cell">등록된 상품이나 판매 내역이 없습니다.</div>
              )
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
