"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, ShoppingBag, MapPin, Loader2, DollarSign } from "lucide-react";
import styles from "./Dashboard.module.css";
import { PageHeader } from "@/component/PageHeader";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

interface StatsData {
  kpis: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    mapCouponsUsed: number;
  };
  revenueData: any[];
  topProducts: any[];
  couponStats: any[];
}

const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];

export default function AdminDashboard() {
  const { role } = useAuthGuard();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", {
      credentials: "include",
    })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok || d.error) {
          throw new Error(d.error || "Failed to fetch stats");
        }
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (role && role !== "ADMIN") {
    return (
      <div className={styles.loadingContainer}>
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>접근 권한 없음</h2>
        <p>최고 관리자(ADMIN)만 접근 가능한 대시보드입니다.</p>
        <button
          onClick={() => window.location.href = "/"}
          style={{ marginTop: "2rem", padding: "0.5rem 1rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  if (loading || role === "") {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.loadingContainer}>
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>데이터 로드 실패</h2>
        <p>대시보드 통계를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        icon="📝"
        title="TwinMap Analytics"
        subtitle="이커머스 & 디지털 트윈 종합 관제 대시보드"
        navLinks={[
          { href: "/", label: "메인 페이지" },
        ]}
      />

      <div className={styles.dashboardContainer}>
        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <h3>총 매출</h3>
              <DollarSign className={styles.kpiIcon} style={{ color: "#10b981" }} />
            </div>
            <p className={styles.kpiValue}>{data.kpis.totalRevenue.toLocaleString()}원</p>
            <p className={styles.kpiTrend}>+12.5% from last week</p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <h3>총 주문수</h3>
              <ShoppingBag className={styles.kpiIcon} style={{ color: "#3b82f6" }} />
            </div>
            <p className={styles.kpiValue}>{data.kpis.totalOrders.toLocaleString()} 건</p>
            <p className={styles.kpiTrend}>+5.2% from last week</p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <h3>활성 유저</h3>
              <Users className={styles.kpiIcon} style={{ color: "#8b5cf6" }} />
            </div>
            <p className={styles.kpiValue}>{data.kpis.totalUsers.toLocaleString()} 명</p>
            <p className={styles.kpiTrend}>+18.1% from last month</p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <h3>지도 쿠폰 사용량</h3>
              <MapPin className={styles.kpiIcon} style={{ color: "#ec4899" }} />
            </div>
            <p className={styles.kpiValue}>{data.kpis.mapCouponsUsed.toLocaleString()} 건</p>
            <p className={styles.kpiTrend}>트윈맵 게이미피케이션 지표</p>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          {/* Revenue Line Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>주간 매출 추이 <TrendingUp size={18} /></h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(val) => val >= 10000 ? `${(val / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}만원` : `${val.toLocaleString()}원`} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()}원`, "매출"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Bar Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>인기 상품 TOP 5 (수량 기준)</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(value: any) => [`${value} 개`, "판매량"]}
                  />
                  <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {data.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coupon Usage Pie Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>쿠폰 획득 경로 분석</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.couponStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.couponStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#64748b" : "#ec4899"} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
