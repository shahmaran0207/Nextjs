"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../Shopping/shopping.css";
import { PageHeader } from "@/component/PageHeader";
import axios from "axios";

export default function DashboardPage() {
  const { email, name } = useAuthGuard();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"count" | "amount">("amount");

  useEffect(() => {
    if (!email) return;
    axios.get(`/api/dashboard?email=${encodeURIComponent(email)}`)
      .then(res => {
        setData(res.data.chartData || []);
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
        icon="📊"
        title="나의 쇼핑 통계"
        subtitle="최근 6개월간의 구매 현황입니다"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/orders", label: "주문 내역" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          <div className="card-container shop-surface border-default p-md">
            <div className="flex-row-between mb-md">
              <h2 className="text-16-bold text-primary margin-0">월별 구매 추이</h2>
              <div className="flex-row gap-xs">
                <button
                  className={`btn-sm ${viewType === "amount" ? "btn-accent" : "btn-outline-secondary"}`}
                  onClick={() => setViewType("amount")}
                >
                  구매 금액 보기
                </button>
                <button
                  className={`btn-sm ${viewType === "count" ? "btn-accent" : "btn-outline-secondary"}`}
                  onClick={() => setViewType("count")}
                >
                  구매 건수 보기
                </button>
              </div>
            </div>

            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3247" />
                  <XAxis dataKey="month" stroke="#8b90a7" tick={{ fill: '#8b90a7' }} />
                  <YAxis stroke="#8b90a7" tick={{ fill: '#8b90a7' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#2e3247', color: '#e8eaf0' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Legend />
                  {viewType === "amount" ? (
                    <Line type="monotone" dataKey="amount" name="구매 금액 (원)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} activeDot={{ r: 8 }} />
                  ) : (
                    <Line type="monotone" dataKey="count" name="구매 건수 (건)" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 8 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
