import api from "@/services/app";
import { ProductFilters } from "@/types/typeFilter";
import { useEffect, useState } from "react";

// useProducts
export const useProducts = (filters: ProductFilters) => {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchProducts>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (f: ProductFilters) => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    const { data } = await api.get(`/products?${params}`);
    return data;
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchProducts(filters)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? "Failed to load products");
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error };
};
