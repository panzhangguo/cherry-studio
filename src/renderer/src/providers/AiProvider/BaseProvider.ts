import { REFERENCE_PROMPT } from '@renderer/config/prompts'
import { getLMStudioKeepAliveTime } from '@renderer/hooks/useLMStudio'
import { getOllamaKeepAliveTime } from '@renderer/hooks/useOllama'
import type {
  Assistant,
  GenerateImageParams,
  KnowledgeReference,
  Message,
  Model,
  Provider,
  Suggestion,
  WebSearchResponse
} from '@renderer/types'
import { delay, isJSON, parseJSON } from '@renderer/utils'
import { addAbortController, removeAbortController } from '@renderer/utils/abortController'
import { formatApiHost } from '@renderer/utils/api'
import { isEmpty } from 'lodash'
import type OpenAI from 'openai'

import type { CompletionsParams } from '.'

export default abstract class BaseProvider {
  protected provider: Provider
  protected host: string
  protected apiKey: string

  constructor(provider: Provider) {
    this.provider = provider
    this.host = this.getBaseURL()
    this.apiKey = this.getApiKey()
  }

  abstract completions({ messages, assistant, onChunk, onFilterMessages }: CompletionsParams): Promise<void>
  abstract translate(message: Message, assistant: Assistant, onResponse?: (text: string) => void): Promise<string>
  abstract summaries(messages: Message[], assistant: Assistant): Promise<string>
  abstract summaryForSearch(messages: Message[], assistant: Assistant): Promise<string | null>
  abstract suggestions(messages: Message[], assistant: Assistant): Promise<Suggestion[]>
  abstract generateText({ prompt, content }: { prompt: string; content: string }): Promise<string>
  abstract check(model: Model): Promise<{ valid: boolean; error: Error | null }>
  abstract models(): Promise<OpenAI.Models.Model[]>
  abstract generateImage(params: GenerateImageParams): Promise<string[]>
  abstract getEmbeddingDimensions(model: Model): Promise<number>

  public getBaseURL(): string {
    const host = this.provider.apiHost
    return formatApiHost(host)
  }

  public getApiKey() {
    const keys = this.provider.apiKey.split(',').map((key) => key.trim())
    const keyName = `provider:${this.provider.id}:last_used_key`

    if (keys.length === 1) {
      return keys[0]
    }

    const lastUsedKey = window.keyv.get(keyName)
    if (!lastUsedKey) {
      window.keyv.set(keyName, keys[0])
      return keys[0]
    }

    const currentIndex = keys.indexOf(lastUsedKey)
    const nextIndex = (currentIndex + 1) % keys.length
    const nextKey = keys[nextIndex]
    window.keyv.set(keyName, nextKey)

    return nextKey
  }

  public defaultHeaders() {
    return {
      // 'HTTP-Referer': 'https://cherry-ai.com', // pfee 注释cherry
      'X-Title': 'ACFX', // pfee 修改x-title
      'X-Api-Key': this.apiKey
    }
  }

  public get keepAliveTime() {
    return this.provider.id === 'ollama'
      ? getOllamaKeepAliveTime()
      : this.provider.id === 'lmstudio'
        ? getLMStudioKeepAliveTime()
        : undefined
  }

  public async fakeCompletions({ onChunk }: CompletionsParams) {
    for (let i = 0; i < 100; i++) {
      await delay(0.01)
      onChunk({ text: i + '\n', usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 } })
    }
  }

  public async getMessageContent(message: Message) {
    if (isEmpty(message.content)) {
      return message.content
    }

    const webSearchReferences = await this.getWebSearchReferencesFromCache(message)
    const knowledgeReferences = await this.getKnowledgeBaseReferencesFromCache(message)

    // 添加偏移量以避免ID冲突
    const reindexedKnowledgeReferences = knowledgeReferences.map((ref) => ({
      ...ref,
      id: ref.id + webSearchReferences.length // 为知识库引用的ID添加网络搜索引用的数量作为偏移量
    }))

    const allReferences = [...webSearchReferences, ...reindexedKnowledgeReferences]

    console.log(`Found ${allReferences.length} references for ID: ${message.id}`, allReferences)

    if (!isEmpty(allReferences)) {
      const referenceContent = `\`\`\`json\n${JSON.stringify(allReferences, null, 2)}\n\`\`\``
      return REFERENCE_PROMPT.replace('{question}', message.content).replace('{references}', referenceContent)
    }

    return message.content
  }

  private async getWebSearchReferencesFromCache(message: Message) {
    if (isEmpty(message.content)) {
      return []
    }
    const webSearch: WebSearchResponse = window.keyv.get(`web-search-${message.id}`)

    if (webSearch) {
      return webSearch.results.map(
        (result, index) =>
          ({
            id: index + 1,
            content: result.content,
            sourceUrl: result.url,
            type: 'url'
          }) as KnowledgeReference
      )
    }

    return []
  }

  /**
   * 从缓存中获取知识库引用
   */
  private async getKnowledgeBaseReferencesFromCache(message: Message): Promise<KnowledgeReference[]> {
    if (isEmpty(message.content)) {
      return []
    }
    const knowledgeReferences: KnowledgeReference[] = window.keyv.get(`knowledge-search-${message.id}`)

    if (!isEmpty(knowledgeReferences)) {
      console.log(`Found ${knowledgeReferences.length} knowledge base references in cache for ID: ${message.id}`)
      return knowledgeReferences
    }
    console.log(`No knowledge base references found in cache for ID: ${message.id}`)
    return []
  }

  protected getCustomParameters(assistant: Assistant) {
    return (
      assistant?.settings?.customParameters?.reduce((acc, param) => {
        if (!param.name?.trim()) {
          return acc
        }
        if (param.type === 'json') {
          const value = param.value as string
          if (value === 'undefined') {
            return { ...acc, [param.name]: undefined }
          }
          return { ...acc, [param.name]: isJSON(value) ? parseJSON(value) : value }
        }
        return {
          ...acc,
          [param.name]: param.value
        }
      }, {}) || {}
    )
  }

  protected createAbortController(messageId?: string, isAddEventListener?: boolean) {
    const abortController = new AbortController()
    const abortFn = () => abortController.abort()

    if (messageId) {
      addAbortController(messageId, abortFn)
    }

    const cleanup = () => {
      if (messageId) {
        signalPromise.resolve?.(undefined)
        removeAbortController(messageId, abortFn)
      }
    }
    const signalPromise: {
      resolve: (value: unknown) => void
      promise: Promise<unknown>
    } = {
      resolve: () => {},
      promise: Promise.resolve()
    }

    if (isAddEventListener) {
      signalPromise.promise = new Promise((resolve, reject) => {
        signalPromise.resolve = resolve
        if (abortController.signal.aborted) {
          reject(new Error('Request was aborted.'))
        }
        // 捕获abort事件,有些abort事件必须
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('Request was aborted.'))
        })
      })
      return {
        abortController,
        cleanup,
        signalPromise
      }
    }
    return {
      abortController,
      cleanup
    }
  }
}
