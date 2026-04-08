import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    orderMeta: {
      customerName:  '',
      customerPhone: '',
      guestCount:    1,
      tableId:       null,
      tableName:     null,
      type:          'Dine In',
    },
  },
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      const maxQty = Number(action.payload.stock ?? existing?.stock ?? Infinity);
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, maxQty);
      } else {
        state.items.push({ ...action.payload, qty: Math.min(1, maxQty) });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      if (qty <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) {
          const maxQty = Number(item.stock ?? Infinity);
          item.qty = Math.min(qty, maxQty);
        }
      }
    },
    clearCart: (state) => {
      state.items     = [];
      state.orderMeta = {
        customerName:  '',
        customerPhone: '',
        guestCount:    1,
        tableId:       null,
        tableName:     null,
        type:          'Dine In',
      };
    },
    setOrderMeta: (state, action) => {
      state.orderMeta = { ...state.orderMeta, ...action.payload };
    },
  },
});

export const { addItem, removeItem, updateQty, clearCart, setOrderMeta } = cartSlice.actions;
export default cartSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCartItems    = (state) => state.cart.items;
export const selectOrderMeta    = (state) => state.cart.orderMeta;
export const selectCartCount    = (state) => state.cart.items.reduce((s, i) => s + i.qty, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((s, i) => s + i.price * i.qty, 0);
export const selectCartTotal    = (state) => {
  const sub = state.cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  return parseFloat((sub * 1.1).toFixed(2));
};

