// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import { ACFX_CONFIG } from '@renderer/config/env'
import i18n from '@renderer/i18n'
import { deepMerge } from '@renderer/utils/copy'
import { getAxfxUserId } from '@renderer/utils/expand/auth'
// import { useErrorLogStoreWithOut } from '@renderer/store/modules/errorLog'
// import { useUserStoreWithOut } from '@renderer/store/modules/user'
import type { AxiosResponse } from 'axios'
import { isString } from 'lodash'

import { VAxios } from './Axios'
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform'
import { checkStatus } from './checkStatus'
import { ConfigEnum, ContentTypeEnum, RequestEnum } from './enums/httpEnum'
import { formatRequestDate, joinTimestamp } from './helper'
import { Recordable, RequestOptions, Result } from './types'
import { setObjToUrlParams } from './utils'

const urlPrefix = ACFX_CONFIG.urlPrefix

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据。如果数据不是预期格式，可直接抛出错误
   */
  transformRequestHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { t } = i18n
    const { isTransformResponse, isReturnNativeResponse } = options
    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data
    }
    // 错误的时候返回

    const { data } = res
    if (!data) {
      // return '[HTTP] Request has no return value';
      throw new Error(t('请求出错，请稍候重试'))
    }
    //  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { data: result, message, success } = data
    // 这里逻辑可以根据项目进行修改
    const hasSuccess = data && Reflect.has(data, 'success') && success === true
    if (hasSuccess) {
      if (success && message && options.successMessageMode === 'success') {
        //信息成功提示
        window.message.success({ content: message, duration: 2, key: 'sys-request-success' })
      }
      return result
    }

    // 在此处根据自己项目的实际情况对不同的code执行不同的操作
    // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
    const timeoutMsg = message

    // errorMessageMode=‘modal’的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
    // errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
    if (options.errorMessageMode === 'modal') {
      window.modal.error({ title: t('错误提示'), content: timeoutMsg })
    } else if (options.errorMessageMode === 'message') {
      window.message.error({ content: timeoutMsg })
    }

    throw new Error(timeoutMsg || t('请求出错，请稍候重试'))
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options

    //update-begin---author:scott ---date:2024-02-20  for：以http开头的请求url，不拼加前缀--
    // http开头的请求url，不加前缀
    let isStartWithHttp = false
    const requestUrl = config.url
    if (requestUrl != null && (requestUrl.startsWith('http:') || requestUrl.startsWith('https:'))) {
      isStartWithHttp = true
    }
    if (!isStartWithHttp && joinPrefix) {
      config.url = `${urlPrefix}${config.url}`
    }

    if (!isStartWithHttp && apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    //update-end---author:scott ---date::2024-02-20  for：以http开头的请求url，不拼加前缀--

    const params = config.params || {}
    const data = config.data || false
    formatDate && data && !isString(data) && formatRequestDate(data)
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params)
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data
          config.params = params
        } else {
          // 非GET请求如果没有提供data，则将params视为data
          config.data = params
          config.params = undefined
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(config.url as string, Object.assign({}, config.params, config.data))
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params
        config.params = undefined
      }
    }

    return config
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: async (config: Recordable) => {
    // 请求之前处理config
    config.headers['New-Api-User'] = await getAxfxUserId()
    // 添加一个标记，用于判断是否是AI Studio加载的
    config.headers[ConfigEnum.IS_WINLOAD_AI_STUDIO] = true
    return config
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const { t } = i18n
    // const errorLogStore = useErrorLogStoreWithOut()
    // errorLogStore.addAjaxErrorInfo(error)
    const { response, code, message, config } = error || {}
    const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none'
    //scott 20211022 token失效提示信息
    //const msg: string = response?.data?.error?.message ?? '';
    const msg: string = response?.data?.message ?? ''
    const err: string = error?.toString?.() ?? ''
    let errMessage = ''

    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        errMessage = t('接口请求超时,请刷新页面重试!')
      }
      if (err?.includes('Network Error')) {
        errMessage = t('网络异常，请检查您的网络连接是否正常!')
      }

      if (errMessage) {
        if (errorMessageMode === 'modal') {
          window.modal.error({ title: t('错误提示'), content: errMessage })
        } else if (errorMessageMode === 'message') {
          window.modal.error({ content: errMessage })
        }
        return Promise.reject(error)
      }
    } catch (error) {
      throw new Error(error as string)
    }

    checkStatus(error?.response?.status, msg, errorMessageMode)
    return Promise.reject(error)
  }
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // authentication schemes，e.g: Bearer
        // authenticationScheme: 'Bearer',
        authenticationScheme: '',
        //接口超时设置
        timeout: 10 * 1000,
        // 基础接口地址
        // baseURL: globSetting.apiUrl,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 异常消息提示类型
          errorMessageMode: 'message',
          // 成功消息提示类型
          successMessageMode: 'success',
          // 接口地址
          apiUrl: ACFX_CONFIG.API_URL,
          // 接口拼接地址
          urlPrefix: urlPrefix,
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true
        }
      },
      opt || {}
    )
  )
}
export const defHttp = createAxios()

// other api url
// export const otherHttp = createAxios({
//   requestOptions: {
//     apiUrl: 'xxx',
//   },
// });
