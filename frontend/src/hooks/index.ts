import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  login,
  logout,
  register,
  getMe,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectIsAdmin,
} from "../features/auth/authSlice";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  selectCart,
  selectCartItemCount,
  selectCartMutating,
} from "../features/cart/cartSlice";
import { toggleCart } from "../features/ui/uiSlice";
import type {
  LoginCredentials,
  RegisterCredentials,
  ProductFilters,
} from "../types";
import api from "@/services/app";
// import api from '../services/api';

// ─── useAuth ──────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAdmin = useAppSelector(selectIsAdmin);

  const signIn = useCallback(
    (credentials: LoginCredentials) => dispatch(login(credentials)),
    [dispatch],
  );

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  const signUp = useCallback(
    (credentials: RegisterCredentials) => dispatch(register(credentials)),
    [dispatch],
  );

  return { user, isAuthenticated, isLoading, isAdmin, signIn, signOut, signUp };
};

// ─── useCart ──────────────────────────────────────────────────────────────────
export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const itemCount = useAppSelector(selectCartItemCount);
  const isMutating = useAppSelector(selectCartMutating);

  const loadCart = useCallback(() => dispatch(fetchCart()), [dispatch]);

  const addItem = useCallback(
    (productId: string, quantity = 1, variantId?: string) =>
      dispatch(addToCart({ productId, quantity, variantId })),
    [dispatch],
  );

  const updateItem = useCallback(
    (itemId: string, quantity: number) =>
      dispatch(updateCartItem({ itemId, quantity })),
    [dispatch],
  );

  const removeItem = useCallback(
    (itemId: string) => dispatch(removeCartItem(itemId)),
    [dispatch],
  );

  const openCart = useCallback(() => dispatch(toggleCart()), [dispatch]);

  return {
    cart,
    itemCount,
    isMutating,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    openCart,
  };
};

// ─── useDebounce ──────────────────────────────────────────────────────────────
export const useDebounce = <T>(value: T, delay = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// ─── useProducts ──────────────────────────────────────────────────────────────
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

// ─── useWishlist ──────────────────────────────────────────────────────────────
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

// ─── useOnClickOutside ────────────────────────────────────────────────────────
export const useOnClickOutside = <T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
) => {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// ─── useLocalStorage ─────────────────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}

// ─── useIntersectionObserver ──────────────────────────────────────────────────
// Used for infinite scroll and lazy loading animations
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
};
