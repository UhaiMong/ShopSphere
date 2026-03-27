import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";

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

// useCart
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
