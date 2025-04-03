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

// 头部更新按钮
export const isShowUpdateAvailable = false

// 模型默认列表 添加
export const isProviderListAndAddShow = false

// 测试使用默认的模型
export const winloadProvider = {
  id: 'winload',
  name: 'Winload',
  type: 'openai' as ProviderType,
  isExtendShow: true,
  apiKey: '',
  apiHost: 'http://47.96.16.65:3000',
  models: [
    {
      id: 'deepseek-ai/DeepSeek-R1',
      name: 'deepseek-ai/DeepSeek-R1',
      provider: 'winload',
      group: 'deepseek-ai'
    },
    {
      id: 'deepseek-ai/DeepSeek-V3',
      name: 'deepseek-ai/DeepSeek-V3',
      provider: 'winload',
      group: 'deepseek-ai'
    },
    {
      id: 'Qwen/Qwen2.5-7B-Instruct',
      provider: 'winload',
      name: 'Qwen2.5-7B-Instruct',
      group: 'Qwen'
    },
    {
      id: 'meta-llama/Llama-3.3-70B-Instruct',
      name: 'meta-llama/Llama-3.3-70B-Instruct',
      provider: 'winload',
      group: 'meta-llama'
    },
    {
      id: 'BAAI/bge-m3',
      name: 'BAAI/bge-m3',
      provider: 'winload',
      group: 'BAAI'
    }
  ],
  isSystem: true,
  enabled: true
}
