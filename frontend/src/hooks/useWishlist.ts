import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import api from "@/services/app";

// useWishlist
export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get<{ data: { products: { _id: string }[] } }>(
        "/wishlist",
      );
      setWishlistIds(new Set(data.data.products.map((p) => p._id)));
    } catch {
      /* noop */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return false;
      setIsLoading(true);
      try {
        await api.post(`/wishlist/${productId}`);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (next.has(productId)) next.delete(productId);
          else next.add(productId);
          return next;
        });
        return true;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated],
  );

  const isInWishlist = useCallback(
    (id: string) => wishlistIds.has(id),
    [wishlistIds],
  );

  return { wishlistIds, isLoading, toggle, isInWishlist, reload: loadWishlist };
};
