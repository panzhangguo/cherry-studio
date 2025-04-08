import { persistConfig, RootState } from '@renderer/store'
import { getStoredState } from 'redux-persist'

export async function getAuthCache() {
  return (await getStoredState(persistConfig)) as RootState | null
}

/**
 * 获取userid
 */
export async function getAxfxUserId() {
  return (await getAuthCache())?.axfcAuth.user?.id
}
