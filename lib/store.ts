import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import cartReducer from './reducer/cartSlice'
import globalReducer from './reducer/globalSlice'

export function makeStore() {
  return configureStore({
    reducer: {
      cart: cartReducer,
      global: globalReducer
    }
  })
}

const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>

export default store