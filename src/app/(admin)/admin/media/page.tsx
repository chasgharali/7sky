"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  _id: string;
  type: string;
  category: string;
  url: string;
  filename: string;
  createdAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadMedia = () => {
    fetch("/api/admin/media", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMedia(Array.isArray(data) ? data : []))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "pdf";
    const category =
      file.name.toLowerCase().includes("floor") ||
      file.name.toLowerCase().includes("plan")
        ? "floorplan"
        : file.name.toLowerCase().includes("payment")
          ? "paymentplan"
          : "gallery";
    formData.append("type", type);
    formData.append("category", category);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        loadMedia();
      } else {
        alert((await res.json()).error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/admin/media/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) loadMedia();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Media</h1>
        <label className="px-4 py-2 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-sm font-medium rounded-lg cursor-pointer">
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            className="hidden"
            accept="image/*,video/mp4,application/pdf"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((m) => (
            <div
              key={m._id}
              className="bg-[#111] border border-white/10 rounded-xl p-4"
            >
              {m.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.filename}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm text-white truncate">{m.filename}</p>
              <p className="text-xs text-gray-500">{m.category}</p>
              <button
                onClick={() => handleDelete(m._id)}
                className="mt-2 text-xs text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
