// Placeholder — these hooks will live in the main theTube repo.
// Defined here so the reference client type-checks.

import { useState, useEffect, useRef, useCallback } from "react";

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

export function useQuery<T>(url: string): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [url]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface MutateOptions {
  ns: string;
  page?: string;
  [key: string]: string | undefined;
}

interface MutateResult {
  mutate: (data: Record<string, string>) => Promise<void>;
  status: "idle" | "loading" | "success" | "error";
  trust: string | null;
}

export function useMutate(endpoint: string, openParams: MutateOptions): MutateResult {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [trust, setTrust] = useState<string | null>(null);
  const fdRef = useRef<{ token: string; trust: string } | null>(null);

  const open = async () => {
    if (fdRef.current) return fdRef.current;
    const params = new URLSearchParams(
      Object.entries(openParams).filter((e): e is [string, string] => e[1] != null),
    );
    const res = await fetch(`/tube/${openParams.ns}/open?${params}`, { method: "POST" });
    if (!res.ok) throw new Error("open failed");
    const fd = await res.json();
    fdRef.current = fd;
    setTrust(fd.trust);
    return fd;
  };

  const mutate = async (data: Record<string, string>) => {
    setStatus("loading");
    try {
      const fd = await open();
      const params = new URLSearchParams({ ...data, token: fd.token });
      const res = await fetch(`${endpoint}?${params}`, { method: "POST" });
      if (res.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return { mutate, status, trust };
}
