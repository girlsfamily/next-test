import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { AppState } from '../store' // AppThunk
import { fetchCartList } from 'api'

export interface Commodity {
  id: string
  code: string
  quantity: number
  name: string
  price: number
}

export interface CartState {
  list: Commodity[]
}


const initialState: CartState = {
  list: []
}


export const initCartState = createAsyncThunk(
  'cart/fetchCartList',
  async () => {
    // const response = await fetchCartList()
    // return response.data
  }
)

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCommodity: (state, action: PayloadAction<Commodity>) => {
      state.list.push(action.payload)
    },
    removeCommodity: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(item => item.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initCartState.pending, (state) => {
      })
      .addCase(initCartState.fulfilled, (state, action) => {
        // state.list = action.payload
      })
  }
})

export const { addCommodity, removeCommodity } = cartSlice.actions

export const selectCartStatus = (state: AppState) => !!state.cart.list.length

// export const dispatchThunk = (commodity: Commodity): AppThunk => (dispatch, getState) => {}

export default cartSlice.reducer