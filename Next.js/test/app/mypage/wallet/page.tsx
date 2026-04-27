"use client";

import React, { useEffect, useState } from "react";
import styles from "./Wallet.module.css";
import { Package, Heart, Star, Award, Map, Truck, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MapCoupon {
  id: number;
  discount: number;
  timestamp: string;
}

export default function GamificationWallet() {
  const [mapCoupons, setMapCoupons] = useState<MapCoupon[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    // 1. 지도 쿠폰 로드 (localStorage)
    const stored = localStorage.getItem("mapCoupons");
    if (stored) {
      try {
        setMapCoupons(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse map coupons", e);
      }
    }

    // 2. 통계 데이터 패치
    fetch("/api/mypage/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .catch(console.error);
  }, []);

  if (!stats) {
    return <div className={styles.loading}>Loading your wallet...</div>;
  }

  // 업적 달성 여부 계산
  const achievements = [
    { 
      id: 1, 
      title: "디지털 트윈 입문자", 
      desc: "지도에서 1개 이상의 쿠폰을 획득했습니다.", 
      icon: <Map size={24} />,
      unlocked: mapCoupons.length >= 1 
    },
    { 
      id: 2, 
      title: "트럭 관제사", 
      desc: "주문 내역이 1건 이상 존재합니다.", 
      icon: <Truck size={24} />,
      unlocked: stats.orderCount >= 1 
    },
    { 
      id: 3, 
      title: "쿠폰 헌터 마스터", 
      desc: "지도에서 3개 이상의 쿠폰을 획득했습니다.", 
      icon: <Award size={24} />,
      unlocked: mapCoupons.length >= 3 
    },
    { 
      id: 4, 
      title: "플래티넘 쇼퍼", 
      desc: "누적 50만원 이상 구매하셨습니다.", 
      icon: <Star size={24} />,
      unlocked: stats.totalSpent >= 500000 
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/mypage" className={styles.backButton}>
          <ArrowLeft size={20} /> 돌아가기
        </Link>
        <h1>My Gamification Wallet</h1>
        <p>나만의 쇼핑 & 트윈맵 활동 내역을 확인하세요.</p>
      </header>

      {/* 요약 통계 영역 */}
      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Package /></div>
          <div>
            <h3>{stats.orderCount}</h3>
            <p>총 주문 건수</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Heart /></div>
          <div>
            <h3>{stats.wishlistCount}</h3>
            <p>위시리스트</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Star /></div>
          <div>
            <h3>{stats.reviewCount}</h3>
            <p>작성한 리뷰</p>
          </div>
        </div>
      </section>

      {/* 홀로그램 쿠폰 지갑 영역 */}
      <section className={styles.walletSection}>
        <div className={styles.sectionHeader}>
          <h2>🎫 맵 획득 쿠폰 지갑</h2>
          <span className={styles.badge}>{mapCoupons.length}개 보유</span>
        </div>
        
        {mapCoupons.length === 0 ? (
          <div className={styles.emptyState}>
            디지털 트윈 맵에서 배송 트럭을 관제하고 숨겨진 쿠폰을 찾아보세요!
          </div>
        ) : (
          <div className={styles.couponGrid}>
            {mapCoupons.map((coupon, idx) => (
              <div key={coupon.id} className={styles.couponCard} style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={styles.couponHologram}></div>
                <div className={styles.couponContent}>
                  <h4>Special Map Coupon</h4>
                  <div className={styles.discountText}>{coupon.discount}% OFF</div>
                  <div className={styles.couponDate}>
                    획득일: {new Date(coupon.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 업적 (Achievements) 시스템 */}
      <section className={styles.achievementsSection}>
        <h2>🏆 나의 업적 뱃지</h2>
        <div className={styles.achievementGrid}>
          {achievements.map(ach => (
            <div key={ach.id} className={`${styles.achievementCard} ${ach.unlocked ? styles.unlocked : styles.locked}`}>
              <div className={styles.achievementIcon}>
                {ach.unlocked ? ach.icon : <Lock size={24} />}
              </div>
              <div className={styles.achievementInfo}>
                <h4>{ach.title}</h4>
                <p>{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 최근 주문 내역 */}
      <section className={styles.recentOrders}>
        <h2>📦 최근 주문 내역</h2>
        {recentOrders.length === 0 ? (
          <p className={styles.emptyText}>아직 주문 내역이 없습니다.</p>
        ) : (
          <div className={styles.orderList}>
            {recentOrders.map(order => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderNo}>{order.order_number}</span>
                  <span className={`${styles.statusBadge} ${styles[order.order_status.toLowerCase()]}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className={styles.orderBody}>
                  결제 금액: <strong>₩{Number(order.final_amount).toLocaleString()}</strong>
                  <br />
                  <span className={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
