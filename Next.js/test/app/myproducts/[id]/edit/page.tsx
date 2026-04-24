"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import Link from "next/link";
import "../../../Shopping/shopping.css";

export default function EditProductPage() {
  const { role } = useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "etc"
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (role && role !== "SELLER") {
      return;
    }
    
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/Shopping/Products/${id}`);
        if (!res.ok) throw new Error("상품 정보를 불러오지 못했습니다.");
        const data = await res.json();
        
        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price ? String(data.price) : "",
          stock: data.stock ? String(data.stock) : "",
          category: data.category || "etc"
        });
        
        if (data.has_image) {
          setPreviewUrl(`/api/images/products/${id}?t=${Date.now()}`); // Cache busting
        }
        if (data.options && data.options.length > 0) {
          setUseOptions(true);
          setOptions(data.options);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    
    if (role === "SELLER") {
      fetchProduct();
    }
  }, [id, role]);

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

      const res = await fetch(`/api/Shopping/Products/${id}`, {
        method: "PUT",
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "상품 수정에 실패했습니다.");

      alert("상품이 성공적으로 수정되었습니다!");
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
        <div className="p-xl text-center text-primary">
          <h2 className="text-22-bold">접근 권한이 없습니다.</h2>
          <Link href="/mypage" className="nav-link mt-1rem inline-block">마이페이지로 돌아가기</Link>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="page-container shop-bg">
        <div className="loading-container h-200 text-secondary">
          <div className="spinner" />
          <span className="text-14">상품 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="page-container shop-bg">
        <div className="error-container">⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div className="flex-row gap-sm">
          <div className="logo-icon">✏️</div>
          <div>
            <h1 className="header-title text-primary">상품 수정</h1>
            <p className="header-subtitle text-accent">등록한 상품의 정보를 수정하세요</p>
          </div>
        </div>
        <nav className="flex-row gap-xs">
          <Link href="/myproducts" className="nav-link">취소</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          <div className="card-container shop-surface border-default p-2rem">
            <h2 className="text-22-bold text-primary mb-1rem border-bottom-default pb-1rem">수정할 정보 입력</h2>
            
            <form onSubmit={handleSubmit} className="flex-col gap-lg">
              
              <div className="flex-row gap-xl items-start">
                {/* 이미지 업로드 */}
                <div className="shrink-0 max-w-250">
                  <label className="text-14-bold text-secondary mb-6px block">상품 이미지 (변경 시에만 업로드)</label>
                  <div 
                    className="border-default badge-accent-dim flex-col-center rounded-lg overflow-hidden cursor-pointer w-full" 
                    style={{ height: "250px", position: "relative" }}
                    onClick={() => document.getElementById("imageUpload")?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full" style={{ objectFit: "cover" }} />
                    ) : (
                      <div className="text-muted text-center">
                        <div className="mb-xs" style={{ fontSize: "32px" }}>📸</div>
                        <div>클릭하여 업로드</div>
                      </div>
                    )}
                    <input 
                      id="imageUpload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden"
                    />
                  </div>
                </div>

                {/* 텍스트 정보 */}
                <div className="flex-1 flex-col gap-md">
                  <div>
                    <label className="text-14-bold text-secondary mb-6px block">상품명 *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="상품명을 입력하세요"
                      required
                    />
                  </div>

                  <div className="flex-row gap-md">
                    <div className="flex-1">
                      <label className="text-14-bold text-secondary mb-6px block">가격 (원) *</label>
                      <input 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="예: 15000"
                        required
                      />
                    </div>
                    {!useOptions && (
                      <div className="flex-1">
                        <label className="text-14-bold text-secondary mb-6px block">재고 수량 *</label>
                        <input 
                          type="number" 
                          name="stock" 
                          value={formData.stock} 
                          onChange={handleInputChange}
                          className="input-field w-full"
                          placeholder="예: 100"
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
                      className="input-field w-full"
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
                            className="input-field w-full" 
                            placeholder="옵션명 (예: 블랙 / L)" 
                            value={opt.option_name}
                            onChange={(e) => handleOptionChange(idx, "option_name", e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            className="input-field w-full" 
                            placeholder="추가 금액" 
                            value={opt.add_price}
                            onChange={(e) => handleOptionChange(idx, "add_price", Number(e.target.value))}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            className="input-field w-full" 
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
                  className="input-field w-full h-150 resize-y"
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                />
              </div>

              <div className="flex-row items-center justify-end mt-md">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-accent"
                  style={{ 
                    padding: "12px 32px", 
                    fontSize: "16px", 
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "수정 중..." : "상품 수정하기"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
