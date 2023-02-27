import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { AppState } from '../store' // AppThunk
// import { fetchUserInfo } from 'api'

export interface GlobalState {
}

const initialState: GlobalState = {
}

export const initUser = createAsyncThunk(
  'global/fetchUserInfo',
  async () => {
    // const response = await fetchCartList()
    // return response.data
  }
)

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(initUser.pending, (state) => {
      })
      .addCase(initUser.fulfilled, (state, action) => {
        // state.list = action.payload
      })
  }
})

// export const { } = globalSlice.actions

// export const dispatchThunk = (commodity: Commodity): AppThunk => (dispatch, getState) => {}

export default globalSlice.reducer