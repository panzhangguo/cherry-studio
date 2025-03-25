import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ExpandAuthState {
  username?: string
  token?: string
  tenant?: string | number
  isSessionTimeOut: boolean
}

const initialState: ExpandAuthState = {
  username: '',
  token: '',
  tenant: '',
  isSessionTimeOut: true
}

const authSlice = createSlice({
  name: 'expandAuth',
  initialState,
  reducers: {
    setUserName(state, action: PayloadAction<string | undefined>) {
      const username = action.payload
      state.username = username ? username : ''
    },
    setToken(state, action: PayloadAction<string | undefined>) {
      const token = action.payload
      state.token = token ? token : ''
    },
    setTenant(state, action: PayloadAction<string | number | undefined>) {
      state.tenant = action.payload
    },
    setSessionStatus(state, action: PayloadAction<boolean>) {
      state.isSessionTimeOut = action.payload ?? false
    }
  }
})

export const { setToken, setTenant, setUserName, setSessionStatus } = authSlice.actions

export default authSlice.reducer
