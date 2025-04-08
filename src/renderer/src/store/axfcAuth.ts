import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AcfxUserInfo {
  id: number
  username: string
  password: string
  display_name: string
  mobile_phone: string
  role: number
  status: number
  email: string
  github_id: string
  oidc_id: string
  wechat_id: string
  telegram_id: string
  verification_code: string
  access_token: string | null
  quota: number
  used_quota: number
  request_count: number
  group: string
  aff_code: string
  aff_count: number
  aff_quota: number
  aff_history_quota: number
  inviter_id: number
  DeletedAt: Date | null
  linux_do_id: string
  setting: string
}

export interface ExpandAuthState {
  user: AcfxUserInfo | null
  isSessionTimeOut: boolean
}

const initialState: ExpandAuthState = {
  user: null,
  isSessionTimeOut: true
}

const authSlice = createSlice({
  name: 'acfxAuth',
  initialState,
  reducers: {
    setAcfxUser(state, action: PayloadAction<AcfxUserInfo | null>) {
      const user = action.payload
      state.user = user
    },
    setAcfxSessionTimeOut(state, action: PayloadAction<boolean>) {
      state.isSessionTimeOut = action.payload ?? true
    }
  }
})

export const { setAcfxUser, setAcfxSessionTimeOut } = authSlice.actions

export default authSlice.reducer
