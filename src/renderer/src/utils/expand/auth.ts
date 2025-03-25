import { persistConfig, RootState } from '@renderer/store'
import { getStoredState } from 'redux-persist'

export async function getAuthCache() {
  return (await getStoredState(persistConfig)) as RootState | null
}

/**
 * 获取token
 */
export async function getToken() {
  return (await getAuthCache())?.expandAuth.token
}

/**
 * 获取租户id
 */
export async function getTenantId() {
  return (await getAuthCache())?.expandAuth.tenant
}
