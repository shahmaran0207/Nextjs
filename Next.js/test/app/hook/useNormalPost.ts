"use client"

import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export default function useNoramlPost() {
  const { email } = useAuthGuard();

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState<any[]>([]);

  const [image, setImage] = useState<File | null>(null);

  const getList = async () => {
    try {
      const res = await fetch('/api/posts/getPostList', {
        credentials: 'include' // 쿠키 포함
      });
      const data = await res.json();
      // 배열인지 확인 후 설정
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("API response is not an array:", data);
        setPosts([]);
      }
    } catch (err: any) {
      console.error("error::::::::::::", err);
      setPosts([]);
    }
  };

  const handleWrite = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!confirm("저장하시겠습니까?")) return;
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("email", email);
      if (image) formData.append("image", image);
      await fetch("/api/posts/addPost", {
        method: "POST",
        credentials: 'include', // 쿠키 포함
        body: formData
      });
      setTitle(""); setContent(""); setImage(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  return {
    getList, posts, setPosts, handlePostImageChange, image, setImage,
    handleWrite, title, setTitle, content, setContent, router, useAuthGuard
  };
}