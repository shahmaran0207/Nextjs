"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import Link from "next/link";
import "../../Shopping/shopping.css";

export default function NewProductPage() {
  const { role } = useAuthGuard();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    category: "shirt"
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useOptions, setUseOptions] = useState(false);
  const [options, setOptions] = useState<{option_name: string, stock: number, add_price: number}[]>([]);

  const handleAddOption = () => {
    setOptions([...options, { option_name: "", stock: 0, add_price: 0 }]);
  };

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...options];
    (newOptions[index] as any)[field] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      alert("상품명, 가격, 재고는 필수입니다.");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("stock", useOptions ? "0" : formData.stock);
      fd.append("category", formData.category);
      if (useOptions && options.length > 0) {
        fd.append("options", JSON.stringify(options));
      }
      if (image) {
        fd.append("image", image);
      }

      const res = await fetch("/api/Shopping/Products", {
        method: "POST",
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "상품 등록에 실패했습니다.");

      alert("상품이 성공적으로 등록되었습니다!");
      router.push("/myproducts");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (role && role !== "SELLER") {
    return (
      <div className="page-container shop-bg">
        <div style={{ padding: "50px", textAlign: "center", color: "#e8eaf0" }}>
          <h2>접근 권한이 없습니다.</h2>
          <Link href="/mypage">마이페이지로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">➕</div>
          <div>
            <h1 className="header-title text-primary">상품 등록</h1>
            <p className="header-subtitle text-accent">새로운 상품을 상점에 올리세요</p>
          </div>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/myproducts" className="nav-link">취소</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          <div className="card-container shop-surface border-default p-2rem">
            <h2 className="text-22-bold text-primary mb-1rem border-bottom-default pb-1rem">상품 정보 입력</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              <div style={{ display: "flex", gap: "2rem" }}>
                {/* 이미지 업로드 */}
                <div style={{ width: "250px", flexShrink: 0 }}>
                  <label className="text-14-bold text-secondary mb-6px block">상품 이미지</label>
                  <div
                    className="border-default badge-accent-dim flex-col-center"
                    style={{ width: "100%", height: "250px", borderRadius: "12px", overflow: "hidden", position: "relative", cursor: "pointer" }}
                    onClick={() => document.getElementById("imageUpload")?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div className="text-muted text-center">
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
                        <div>클릭하여 업로드</div>
                      </div>
                    )}
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* 텍스트 정보 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div>
                    <label className="text-14-bold text-secondary mb-6px block">상품명 *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="search-input"
                      placeholder="상품명을 입력하세요"
                      style={{ width: "100%" }}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <label className="text-14-bold text-secondary mb-6px block">가격 (원) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="search-input"
                        placeholder="예: 15000"
                        style={{ width: "100%" }}
                        required
                      />
                    </div>

                    {!useOptions && (
                      <div style={{ flex: 1 }}>
                        <label className="text-14-bold text-secondary mb-6px block">재고 수량 *</label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          className="search-input"
                          placeholder="예: 100"
                          style={{ width: "100%" }}
                          required={!useOptions}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-14-bold text-secondary mb-6px block">카테고리</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ width: "100%" }}
                    >
                      <option value="shirt">상의 (shirt)</option>
                      <option value="shoes">신발 (shoes)</option>
                      <option value="caps">모자 (caps)</option>
                      <option value="outer">겉옷 (outer)</option>
                      <option value="socks">양말 (socks)</option>
                      <option value="pants">하의 (pants)</option>
                      <option value="bag">가방 (bag)</option>
                      <option value="etc">기타 (etc)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card-container shop-surface border-default">
                <div className="title-banner flex-justify-between">
                  <h2 className="margin-0 text-primary text-16">상품 옵션 (선택)</h2>
                  <label className="flex-row gap-xs items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useOptions} 
                      onChange={(e) => {
                        setUseOptions(e.target.checked);
                        if (e.target.checked && options.length === 0) handleAddOption();
                      }} 
                    />
                    <span className="text-14 text-secondary">옵션 사용하기</span>
                  </label>
                </div>
                {useOptions && (
                  <div className="p-md flex-col gap-sm">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex-row gap-sm items-center border-bottom-default pb-sm mb-sm">
                        <div style={{ flex: 2 }}>
                          <input 
                            type="text" 
                            className="search-input" 
                            placeholder="옵션명 (예: 블랙 / L)" 
                            value={opt.option_name}
                            onChange={(e) => handleOptionChange(idx, "option_name", e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            className="search-input" 
                            placeholder="추가 금액" 
                            value={opt.add_price}
                            onChange={(e) => handleOptionChange(idx, "add_price", Number(e.target.value))}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            className="search-input" 
                            placeholder="재고" 
                            value={opt.stock}
                            onChange={(e) => handleOptionChange(idx, "stock", Number(e.target.value))}
                            required
                          />
                        </div>
                        <button type="button" onClick={() => handleRemoveOption(idx)} className="btn-danger btn-sm">삭제</button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddOption} className="btn-outline-secondary btn-sm" style={{ alignSelf: "flex-start" }}>
                      + 옵션 추가
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-14-bold text-secondary mb-6px block">상품 설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="search-input"
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                  style={{ width: "100%", height: "150px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px 32px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    background: "var(--accent)",
                    color: "#0f172a",
                    border: "none",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s",
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = "1"; }}
                >
                  {loading ? "등록 중..." : "상품 등록하기"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
