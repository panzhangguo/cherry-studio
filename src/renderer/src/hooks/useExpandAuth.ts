import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setAcfxSessionTimeOut, setAcfxUser } from '@renderer/store/axfcAuth'
import type { AcfxUserInfo } from '@renderer/store/axfcAuth'
export function useExpandAuth() {
  const user = useAppSelector((state) => state.axfcAuth.user)
  const isLogin = useAppSelector((state) => state.axfcAuth.isSessionTimeOut === false)
  const dispatch = useAppDispatch()

  /**
   * 登录后台账户
   *
   * @param data
   */
  const login = (user: AcfxUserInfo) => {
    dispatch(setAcfxUser(user))
    dispatch(setAcfxSessionTimeOut(false))
  }

  /**
   * 退出登录
   */
  const logout = () => {
    dispatch(setAcfxUser(null))
    dispatch(setAcfxSessionTimeOut(true))
  }

  return {
    user,
    isLogin,
    logout,
    login
  }
}
