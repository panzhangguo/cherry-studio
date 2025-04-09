import { ProviderType } from '@renderer/types'

import { ACFX_CONFIG } from './env'

// mcp服务器
export const isMcpShow = false

// 关于
export const isAboutShow = false

// 帮助文档
export const isDocsShow = false

// 小程序
export const isAcfxMinAppShow = false

// 自定义css
export const isCustomCssShow = false

// 头部更新按钮
export const isShowUpdateAvailable = false

// 模型默认列表 添加
export const isProviderListAndAddShow = true

// 使用默认的模型
export const ACFX_MODELS = [
  {
    id: 'deepseek-v3',
    name: 'deepseek-v3',
    provider: 'acfx',
    group: 'deepseek-ai'
  },
  {
    id: 'Doubao-embedding',
    name: 'Doubao-embedding',
    provider: 'acfx',
    group: 'Doubao-embedding'
  }
]

export const AXFC_PROVIDER = {
  id: 'acfx',
  name: 'axfc',
  type: 'openai' as ProviderType,
  isExtendShow: true,
  apiKey: '',
  apiHost: ACFX_CONFIG.REMOTE_URL,
  // 默认模型
  models: ACFX_MODELS,
  isSystem: true,
  enabled: true
}
