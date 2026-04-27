"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Loader2, Plus, Calendar, Clock, Trash2, CheckCircle2, XCircle, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useRouter } from "next/navigation";

interface Todo {
  id: number;
  title: string;
  is_completed: boolean;
  deadline: string | null;
  created_at: string;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos", { credentials: "include" });
      if (res.status === 401) {
        router.push("/Login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [minDateTime, setMinDateTime] = useState("");

  useEffect(() => {
    fetchTodos();
    
    // 현재 시간을 YYYY-MM-DDThh:mm 형식(로컬 타임존 기준)으로 변환
    const updateMinDateTime = () => {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
      setMinDateTime(localISOTime);
    };
    
    updateMinDateTime();
    // 1분마다 최소 시간 갱신
    const interval = setInterval(updateMinDateTime, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (deadline) {
      const selectedDate = new Date(deadline);
      if (selectedDate <= new Date()) {
        alert("마감 시간은 현재 시간 이후로 설정해야 합니다.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, deadline: deadline || null }),
      });
      
      if (res.ok) {
        setTitle("");
        setDeadline("");
        fetchTodos();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (id: number, currentStatus: boolean, isFailed: boolean) => {
    if (isFailed && !currentStatus) {
      alert("마감 시간이 지나 완료 처리할 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_completed: !currentStatus }),
      });
      if (res.ok) {
        setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 할 일을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading Schedule...</p>
      </div>
    );
  }

  // 통계 계산
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.is_completed).length;
  
  const now = new Date();
  const failedCount = todos.filter(t => !t.is_completed && t.deadline && new Date(t.deadline) < now).length;
  const pendingCount = totalCount - completedCount - failedCount;

  const progressData = [
    { name: "완료됨", value: completedCount },
    { name: "진행중", value: pendingCount },
    { name: "마감 실패", value: failedCount },
  ];
  const COLORS = ["#10b981", "#3b82f6", "#ef4444"];

  const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Activity size={32} color="#3b82f6" />
          TwinTask Manager
        </h1>
        <p className={styles.subtitle}>디지털 트윈 통합 스케줄 관제 센터</p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.kpiInfo}>
            <h3>전체 진행률</h3>
            <p>{completionRate}%</p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.chartContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={40} color="#10b981" />
          </div>
          <div className={styles.kpiInfo}>
            <h3>완료된 작업</h3>
            <p>{completedCount} / {totalCount}</p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.chartContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={40} color="#ef4444" />
          </div>
          <div className={styles.kpiInfo}>
            <h3>마감 실패</h3>
            <p>{failedCount} 건</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>작업 목록</h2>
          
          {todos.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle2 size={48} />
              <p>현재 등록된 할 일이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.todoList}>
              {todos.map(todo => {
                const isDeadlinePassed = todo.deadline ? new Date(todo.deadline) < now : false;
                const isFailed = !todo.is_completed && isDeadlinePassed;
                
                return (
                  <div key={todo.id} className={`${styles.todoItem} ${todo.is_completed ? styles.completed : ''} ${isFailed ? styles.failed : ''}`}>
                    <div 
                      className={styles.todoCheckbox}
                      onClick={() => handleToggleComplete(todo.id, todo.is_completed, isFailed)}
                      style={{ 
                        backgroundColor: todo.is_completed ? '#3b82f6' : 'transparent',
                        borderColor: isFailed && !todo.is_completed ? '#ef4444' : (todo.is_completed ? '#3b82f6' : '#64748b'),
                        cursor: (isFailed && !todo.is_completed) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {todo.is_completed && <div style={{ width: '6px', height: '12px', border: 'solid white', borderWidth: '0 2px 2px 0', transform: 'rotate(45deg)', marginBottom: '2px' }} />}
                    </div>
                    
                    <div className={styles.todoContent}>
                      <h3 className={styles.todoTitle}>{todo.title}</h3>
                      <div className={styles.todoMeta}>
                        <div className={styles.todoMetaItem}>
                          <Calendar size={14} />
                          <span>{new Date(todo.created_at).toLocaleDateString()}</span>
                        </div>
                        {todo.deadline && (
                          <div className={styles.todoMetaItem} style={{ color: isFailed ? '#ef4444' : '' }}>
                            <Clock size={14} />
                            <span>{new Date(todo.deadline).toLocaleString()}</span>
                          </div>
                        )}
                        
                        {isFailed && <span className={`${styles.statusBadge} ${styles.failed}`}>마감됨</span>}
                        {todo.is_completed && <span className={`${styles.statusBadge} ${styles.completed}`}>완료됨</span>}
                        {!isFailed && !todo.is_completed && <span className={`${styles.statusBadge} ${styles.pending}`}>진행중</span>}
                      </div>
                    </div>

                    <button className={styles.deleteBtn} onClick={() => handleDelete(todo.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.card} style={{ height: 'fit-content' }}>
          <h2 className={styles.cardTitle}>새 작업 등록</h2>
          <form onSubmit={handleAddTodo}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>작업 내용</label>
              <input 
                type="text" 
                className={styles.formInput} 
                placeholder="예: 월간 리포트 작성"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>마감 일시 (선택)</label>
              <input 
                type="datetime-local" 
                className={styles.formInput}
                value={deadline}
                min={minDateTime}
                onChange={e => {
                  const val = e.target.value;
                  if (val) {
                    const selectedDate = new Date(val);
                    if (selectedDate <= new Date()) {
                      alert("마감 시간은 현재 시간 이후여야 합니다. (현재 시간으로 조정됩니다)");
                      // 빈칸으로 초기화하지 않고, 현재 시간(가장 이른 유효 시간)으로 값을 덮어씌움
                      setDeadline(minDateTime);
                      return;
                    }
                  }
                  setDeadline(val);
                }}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting || !title.trim()}>
              {submitting ? <Loader2 size={20} className={styles.spinner} style={{ marginBottom: 0 }} /> : <Plus size={20} />}
              작업 추가하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
