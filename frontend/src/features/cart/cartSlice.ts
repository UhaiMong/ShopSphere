import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import api from "../../services/api";
import type { Cart, CartItem } from "../../types";
import api from "@/services/app";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isMutating: boolean; // for add/update/remove operations
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: Cart }>("/cart");
      return data.data;
    } catch {
      return rejectWithValue("Failed to load cart");
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async (
    payload: { productId: string; quantity?: number; variantId?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post<{ data: Cart }>("/cart/items", payload);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to add item",
      );
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async (
    payload: { itemId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch<{ data: Cart }>(
        `/cart/items/${payload.itemId}`,
        { quantity: payload.quantity },
      );
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to update cart",
      );
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete<{ data: Cart }>(
        `/cart/items/${itemId}`,
      );
      return data.data;
    } catch {
      return rejectWithValue("Failed to remove item");
    }
  },
);

export const clearCartThunk = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/cart");
      return null;
    } catch {
      return rejectWithValue("Failed to clear cart");
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.error = null;
    },
    // Optimistic quantity update (before server confirms)
    optimisticUpdateQty: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>,
    ) => {
      if (!state.cart) return;
      const item = state.cart.items.find(
        (i: CartItem) => i._id === action.payload.itemId,
      );
      if (item) item.quantity = action.payload.quantity;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state: CartState, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.isMutating = false;
      state.error = null;
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addToCart.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(addToCart.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(removeCartItem.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      });

    builder.addCase(clearCartThunk.fulfilled, (state) => {
      state.cart = null;
      state.isMutating = false;
    });
  },
});

export const { clearCartState, optimisticUpdateQty } = cartSlice.actions;
export default cartSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCart = (s: { cart: CartState }) => s.cart.cart;
export const selectCartItemCount = (s: { cart: CartState }) =>
  s.cart.cart?.itemCount ?? 0;
export const selectCartLoading = (s: { cart: CartState }) => s.cart.isLoading;
export const selectCartMutating = (s: { cart: CartState }) => s.cart.isMutating;
