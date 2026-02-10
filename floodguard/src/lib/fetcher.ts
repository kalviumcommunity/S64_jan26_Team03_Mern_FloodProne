export const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("floodguard_token") : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    try {
      (error as any).info = await res.json();
    } catch {
      (error as any).info = { message: res.statusText };
    }
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};
