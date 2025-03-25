import { useAppDispatch, useAppSelector } from '@renderer/store'
import { ExpandAuthState, setSessionStatus, setTenant, setToken, setUserName } from '@renderer/store/expandAuth'

export function useExpandAuth() {
  const token = useAppSelector((state) => state.expandAuth.token)
  const isLogin = useAppSelector((state) => state.expandAuth.isSessionTimeOut === true)
  const username = useAppSelector((state) => state.expandAuth.username)
  const tenant = useAppSelector((state) => state.expandAuth.tenant)
  const dispatch = useAppDispatch()

  /**
   * 登录后台账户
   *
   * @param data
   */
  const login = (data: ExpandAuthState) => {
    const { token, username, tenant } = data
    dispatch(setToken(token))
    dispatch(setUserName(username))
    dispatch(setTenant(tenant))
    dispatch(setSessionStatus(true))
  }

  /**
   * 退出登录
   */
  const logout = () => {
    dispatch(setToken(''))
    dispatch(setUserName(''))
    dispatch(setTenant(''))
    dispatch(setSessionStatus(false))
  }

  return {
    username,
    tenant,
    token,
    isLogin,
    logout,
    login
  }
}
