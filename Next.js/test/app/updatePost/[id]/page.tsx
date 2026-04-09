"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<any>(null);
  const [postId, setPostId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      const { id } = await params;
      setPostId(id);
      const res = await fetch(`/api/posts/getPostList/${id}`);
      const data = await res.json();
      setPost(data[0]);
    };
    fetchPost();
  }, []);

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    </div>
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const id = postId;
    const formData = new FormData();
    formData.append("title", title || post.TITLE);
    formData.append("content", content || post.CONTENT);
    if (imageFile) formData.append("image", imageFile);

    const submit = await fetch(`/api/posts/updatePost/${id}`, {
      method: "POST",
      body: formData,
    });

    if(submit.status === 200){
      alert("수정되었습니다.");
      router.push("/list")
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">게시글 수정</h1>
          <p className="text-sm text-gray-400 mt-1">내용을 수정한 후 저장 버튼을 눌러주세요.</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">

          {/* 제목 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">제목</label>
            <input
              type="text"
              placeholder={post.TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* 내용 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">내용</label>
            <textarea
              placeholder={post.CONTENT}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
            />
          </div>

          {/* 이미지 */}
          <div className="w-full h-60 rounded-xl overflow-hidden border border-gray-200 relative bg-gray-50">
            {previewImage || post.IMAGE ? (
              <Image
                src={previewImage ?? `data:image/jpeg;base64,${post.IMAGE}`}
                alt="preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <p className="text-sm">사진 없음</p>
              </div>
            )}
            {/* 오버레이 */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition cursor-pointer">
              <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                사진 변경
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => history.back()}
              className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              저장
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}