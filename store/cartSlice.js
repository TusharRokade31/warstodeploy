import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const saveIDToLocalStorage = (ID) => {
  if (ID) {
    localStorage.setItem("guestID", ID);
  }
};

const getIDFromLocalStorage = () => {
  return localStorage.getItem("guestID");
};

// Get Cart
export const getCart = createAsyncThunk(
  "getCart",
  async (_, { dispatch }) => {
    try {
      
      const ID = getIDFromLocalStorage();
      const config = {
        ...(ID && { headers: { "X-Guest-ID": ID } }), 
      };
      const response = await api.get("/cart", config);
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  }
);

// Add to Cart
export const addToCart = createAsyncThunk(
  "addToCart",
  async ({ Cartvalue, ID }, { dispatch }) => {
    try {
      
      const storedID = getIDFromLocalStorage();
      
      const config = {
        ...(storedID && { headers: { "X-Guest-ID": storedID } }), 
      };

      const response = await api.post("/cart/add", Cartvalue, config);
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }
);

// Update Cart
export const updateCart = createAsyncThunk(
  "updateCart",
  async ({ product, ID }, { dispatch }) => {
    try {
      saveIDToLocalStorage(ID);
      const storedID = getIDFromLocalStorage();

      const config = {
        ...(storedID && { headers: { "X-Guest-ID": storedID } }), 
      };

      const response = await api.put("/cart/update", product, config);
      return {
        product,
        responseData: response.data,
      };
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  }
);

export const removeItem = createAsyncThunk(
  "removeItem",
  async (id, { dispatch }) => {
    try {
      saveIDToLocalStorage(id);
      const storedID = getIDFromLocalStorage();

      const config = {
        ...(storedID && { headers: { "X-Guest-ID": storedID } }), 
      };

      const response = await api.post("/cart/remove", { productId: id },config,);
      return {
        id,
        responseData: response.data,
      };
    } catch (error) {
      console.error("Error setting user:", error);
      throw error;
    }
  }
);

export const clearItem = createAsyncThunk(
  "clearItem",
  async (id, { dispatch }) => {
    try {
      const response = await api.post("/cart/clear",{
        headers: { "X-Guest-ID": `44680918-f99a-4a9f-97f2-ca5710d20519` },
      });
      return response.data;
    } catch (error) {
      console.error("Error setting user:", error);
      throw error;
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartitems: {},
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartitems = action.payload;
        state.error = null;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartitems = action.payload;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(updateCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.loading = false;
        const { product } = action.payload;
        const item = state.cartitems.items.find(
          (item) => item.product._id === product.productId
        );
        if (item) {
          item.quantity = product.quantity;
        }
        state.error = null;
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // Improved error handling
      })

      .addCase(removeItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.loading = false;
        const { id } = action.payload;
        state.cartitems.items = state.cartitems.items.filter(
          (item) => item.product._id !== id
        );
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // Improved error handling
      })
      .addCase(clearItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cartitems.items = action.payload.items;
      })
      .addCase(clearItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // Improved error handling
      });
  },
});

export default cartSlice.reducer;