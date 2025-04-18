import WebSearchEngineProvider from '@renderer/providers/WebSearchProvider'
import store from '@renderer/store'
import { setDefaultProvider, WebSearchState } from '@renderer/store/websearch'
import { WebSearchProvider, WebSearchResponse, WebSearchResult } from '@renderer/types'
import { hasObjectKey } from '@renderer/utils'
import { ExtractResults } from '@renderer/utils/extract'
import { fetchWebContents } from '@renderer/utils/fetch'
import dayjs from 'dayjs'

/**
 * 提供网络搜索相关功能的服务类
 */
class WebSearchService {
  /**
   * 获取当前存储的网络搜索状态
   * @private
   * @returns 网络搜索状态
   */
  private getWebSearchState(): WebSearchState {
    return store.getState().websearch
  }

  /**
   * 检查网络搜索功能是否启用
   * @public
   * @returns 如果默认搜索提供商已启用则返回true，否则返回false
   */
  public isWebSearchEnabled(): boolean {
    const { defaultProvider, providers } = this.getWebSearchState()
    const provider = providers.find((provider) => provider.id === defaultProvider)

    if (!provider) {
      return false
    }

    if (provider.id.startsWith('local-')) {
      return true
    }

    if (hasObjectKey(provider, 'apiKey')) {
      return provider.apiKey !== ''
    }

    if (hasObjectKey(provider, 'apiHost')) {
      return provider.apiHost !== ''
    }

    return false
  }

  /**
   * 检查是否启用搜索增强模式
   * @public
   * @returns 如果启用搜索增强模式则返回true，否则返回false
   */
  public isEnhanceModeEnabled(): boolean {
    const { enhanceMode } = this.getWebSearchState()
    return enhanceMode
  }

  /**
   * 检查是否启用覆盖搜索
   * @public
   * @returns 如果启用覆盖搜索则返回true，否则返回false
   */
  public isOverwriteEnabled(): boolean {
    const { overwrite } = this.getWebSearchState()
    return overwrite
  }

  /**
   * 获取当前默认的网络搜索提供商
   * @public
   * @returns 网络搜索提供商
   * @throws 如果找不到默认提供商则抛出错误
   */
  public getWebSearchProvider(): WebSearchProvider {
    const { defaultProvider, providers } = this.getWebSearchState()
    let provider = providers.find((provider) => provider.id === defaultProvider)

    if (!provider) {
      provider = providers[0]
      if (provider) {
        // 可选：自动更新默认提供商
        store.dispatch(setDefaultProvider(provider.id))
      } else {
        throw new Error(`No web search providers available`)
      }
    }

    return provider
  }

  /**
   * 使用指定的提供商执行网络搜索
   * @public
   * @param provider 搜索提供商
   * @param query 搜索查询
   * @returns 搜索响应
   */
  public async search(provider: WebSearchProvider, query: string): Promise<WebSearchResponse> {
    const websearch = this.getWebSearchState()
    const webSearchEngine = new WebSearchEngineProvider(provider)

    let formattedQuery = query
    // 有待商榷，效果一般
    if (websearch.searchWithTime) {
      formattedQuery = `today is ${dayjs().format('YYYY-MM-DD')} \r\n ${query}`
    }

    try {
      return await webSearchEngine.search(formattedQuery, websearch)
    } catch (error) {
      console.error('Search failed:', error)
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 检查搜索提供商是否正常工作
   * @public
   * @param provider 要检查的搜索提供商
   * @returns 如果提供商可用返回true，否则返回false
   */
  public async checkSearch(provider: WebSearchProvider): Promise<{ valid: boolean; error?: any }> {
    try {
      const response = await this.search(provider, 'test query')
      console.log('Search response:', response)
      // 优化的判断条件：检查结果是否有效且没有错误
      return { valid: response.results !== undefined, error: undefined }
    } catch (error) {
      return { valid: false, error }
    }
  }

  public async processWebsearch(
    webSearchProvider: WebSearchProvider,
    extractResults: ExtractResults
  ): Promise<WebSearchResponse> {
    try {
      // 检查 websearch 和 question 是否有效
      if (!extractResults.websearch?.question || extractResults.websearch.question.length === 0) {
        console.log('No valid question found in extractResults.websearch')
        return { results: [] }
      }

      const questions = extractResults.websearch.question
      const links = extractResults.websearch.links
      const firstQuestion = questions[0]

      if (firstQuestion === 'summarize' && links && links.length > 0) {
        const contents = await fetchWebContents(links)
        return {
          query: 'summaries',
          results: contents
        }
      }
      const searchPromises = questions.map((q) => this.search(webSearchProvider, q))
      const searchResults = await Promise.allSettled(searchPromises)
      const aggregatedResults: WebSearchResult[] = []

      searchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.results) {
            aggregatedResults.push(...result.value.results)
          }
        }
      })
      return {
        query: questions.join(' | '),
        results: aggregatedResults
      }
    } catch (error) {
      console.error('Failed to process enhanced search:', error)
      return { results: [] }
    }
  }
}

export default new WebSearchService()
