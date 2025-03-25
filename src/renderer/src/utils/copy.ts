import { Topic } from '@renderer/types'
import { isObject } from 'lodash'

import { topicToMarkdown } from './export'

export const copyTopicAsMarkdown = async (topic: Topic) => {
  const markdown = await topicToMarkdown(topic)
  await navigator.clipboard.writeText(markdown)
}

/* pfee 添加深度合并 */
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) && isObject(target[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}
