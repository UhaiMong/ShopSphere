import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
}

const initialState: UiState = {
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    closeSearch: (state) => {
      state.isSearchOpen = false;
    },
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  setMobileMenu,
  toggleSearch,
  closeSearch,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectIsCartOpen = (s: { ui: UiState }) => s.ui.isCartOpen;
export const selectIsMobileMenuOpen = (s: { ui: UiState }) =>
  s.ui.isMobileMenuOpen;
export const selectIsSearchOpen = (s: { ui: UiState }) => s.ui.isSearchOpen;
