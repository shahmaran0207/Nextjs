"use client"

import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

export default function useNoramlPost () {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [posts, setPosts] = useState<any[]>([]);

    const [image, setImage] = useState<File | null>(null);

    const getList = async () => {
      try {
        const res = await fetch('/api/posts/getPostList');
        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        console.log("error::::::::::::", err);
      }
    };

    const handleWrite = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!confirm("저장하시겠습니까?")) return;
        try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (image) formData.append("image", image);
        await fetch("/api/posts/addPost", { method: "POST", body: formData });
        setTitle(""); setContent(""); setImage(null);
        router.push("/");
        router.refresh();
        } catch (error) {
        console.log(error);
        }
    };

    const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImage(e.target.files[0]);
    };

    return {
        getList, posts, setPosts, handlePostImageChange, image, setImage,
        handleWrite, title, setTitle, content, setContent, router
    };
}