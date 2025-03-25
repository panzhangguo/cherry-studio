import { ProviderType } from '@renderer/types'

// mcp服务器
export const isMcpShow = false

// 关于
export const isAboutShow = false

// 帮助文档
export const isDocsShow = false

// 小程序
export const isMinAppShow = false

// 自定义css
export const isCustomCssShow = false

// 测试使用默认的模型
export const winloadProvider = {
  id: 'winload',
  name: 'Winload',
  type: 'openai' as ProviderType,
  apiKey: 'sk-oHnHSkKqc42Oot8uGahqrlpma20yhynu90vLcQV6qEy1xBW9',
  apiHost: 'http://47.96.16.65:3000',
  models: [],
  isSystem: true,
  enabled: true
}
