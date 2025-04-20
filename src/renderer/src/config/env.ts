export { default as UserAvatar } from '@renderer/assets/images/avatar.png'
export { default as AppLogo } from '@renderer/assets/images/logo.png'

export const APP_NAME = '奥晨分享 ACFX'
export const isLocalAi = false

export const ACFX_CONFIG = {
  REMOTE_URL: 'http://47.96.16.65:3000',
  API_URL: import.meta.env.DEV ? 'http://127.0.0.1:3000/api' : 'http://47.96.16.65:3000/api',
  UPLOAD_URL: import.meta.env.DEV ? 'http://127.0.0.1:3000' : 'http://47.96.16.65:3000',
  urlPrefix: '',
  AuthApi: {
    //获取短信验证码的接口
    getCaptcha: '/acfx-sms',
    //注册接口
    register: '/acfx-auth/register',
    // 退出
    logout: '/user/logout',
    // 登录
    login: '/user/login?turnstile=',
    // 用户模型
    models: '/user/models'
  },
  ACFX_API: {
    GetAllTokens: '/token',
    GetMyUsefulTeamKeys: '/winload_team_key/self_useful'
  }
}
