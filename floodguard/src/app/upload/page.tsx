"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    alert("File uploaded successfully ✅");
    console.log(data);
  };

  return (
    <div className="p-6 space-y-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
