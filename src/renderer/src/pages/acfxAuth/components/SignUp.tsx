import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { ACFX_CONFIG } from '@renderer/config/env'
import { defHttp } from '@renderer/utils/http/axios'
import { Button, ConfigProvider, Flex, Form, FormProps, Input, notification } from 'antd'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useStyle } from '../style'
import { SignUpProps } from '../type'
import { countdown, SmsEnum } from '../useLogin'

type FieldType = {
  username?: string
  phone?: string
  password?: string
  confirm_password?: string
  code?: string
}

let codeTimer: NodeJS.Timeout

const SignUp: React.FC<SignUpProps> = ({ setSignupVisible }) => {
  const { t } = useTranslation()
  const { styles } = useStyle()
  const [codeVisible, setCodeVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(countdown)
  // const [messageApi, contextHolder] = message.useMessage()
  const [notificationApi, notificationContextHolder] = notification.useNotification()

  const [btnContent, setBtnContent] = useState('获取验证码')
  // username: data.account,
  // password: data.password,
  // phone: data.mobile,
  // smscode: data.sms,
  const [form] = Form.useForm()
  useEffect(() => {
    clearInterval(codeTimer)
    return () => clearInterval(codeTimer)
  }, [])

  useEffect(() => {
    if (time > 0 && time < countdown) {
      setBtnContent(`${time}`)
    } else {
      clearInterval(codeTimer)
      setCodeVisible(true)
      setTime(countdown)
      setBtnContent('获取验证码')
    }
  }, [time])

  const getCode = async () => {
    const mobile = form.getFieldValue('phone')
    if (!mobile) {
      window.message.error('请输入手机号')
      return
    }

    setCodeVisible(false)
    codeTimer = setInterval(() => setTime((t) => --t), 1000)
    //发送验证码的函数
    await defHttp.post({
      url: ACFX_CONFIG.AuthApi.getCaptcha,
      data: {
        mobile: mobile,
        type: SmsEnum.REGISTER
      }
    })
  }

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      setLoading(true)
      notificationApi.destroy()
      const resultInfo = await defHttp.post({
        url: ACFX_CONFIG.AuthApi.register,
        data: values
      })
      if (resultInfo && resultInfo.data.success) {
        notificationApi.success({
          message: t('成功提示'),
          description: resultInfo.data.message || t('注册成功，即将跳转登录页...'),
          duration: 2,
          key: 'resister_notify'
        })
        setSignupVisible(false)
        // handleBackLogin()
      } else {
        notificationApi.warning({
          message: t('错误提示'),
          description: resultInfo.data.message || t('网络异常，请检查您的网络连接是否正常!'),
          duration: 3,
          key: 'resister_notify'
        })
      }
    } catch (error) {
      notificationApi.error({
        message: t('错误提示'),
        // @ts-ignore error
        description: error.message || t('网络异常，请检查您的网络连接是否正常!'),
        duration: 3,
        key: 'resister_notify'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {notificationContextHolder}
      <Container>
        <Title>{t('欢迎注册')}</Title>
        <Form
          name="wrap"
          form={form}
          labelCol={{ flex: '110px' }}
          labelAlign="left"
          labelWrap
          wrapperCol={{ flex: 1 }}
          colon={false}
          onFinish={onFinish}
          style={{ maxWidth: 600 }}>
          <Form.Item name="username" rules={[{ required: true, message: t('用户名不能为空') }]}>
            <Input autoFocus placeholder={t('用户名')} />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: t('	手机号码不能为空') },
              {
                pattern: /^1[3|4|5|7|8][0-9]\d{8}$/,
                message: t('手机号码格式不正确！')
              }
            ]}>
            <Input placeholder={t('手机号码')} />
          </Form.Item>

          <Form.Item name="smscode" rules={[{ required: true, message: t('验证码格式错误') }]}>
            <Flex gap={10}>
              <Input placeholder={t('验证码')} className="flex-1" />
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      fontWeight: 600
                    }
                  }
                }}>
                <Button
                  disabled={!codeVisible}
                  style={{ width: 80, fontSize: '12px', color: '#642ab5' }}
                  onClick={() => getCode()}>
                  {btnContent}
                </Button>
              </ConfigProvider>
            </Flex>
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: t('密码不能为空') }]}>
            <Input.Password
              placeholder={t('密码')}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            rules={[
              ({ getFieldValue }) => ({
                validator(_rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve(true)
                  }
                  return Promise.reject(t('两次密码不匹配'))
                }
              })
            ]}>
            <Input.Password
              placeholder={t('确认密码')}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '10px' }}>
            <ConfigProvider
              button={{
                className: styles.linearGradientButton
              }}>
              <Button type="primary" htmlType="submit" block>
                {t('注册')}
              </Button>
            </ConfigProvider>
          </Form.Item>
        </Form>
        <Footer className="flex justify-center items-strecth gap-2px">
          <FooterText className="color-[var(--color-gray-2)] text-13px lh-32px">{t('已有账号')}?</FooterText>
          <Button
            loading={loading}
            onClick={() => setSignupVisible(false)}
            color="purple"
            variant="link"
            style={{ fontSize: '13px' }}>
            {t('去登录')}
          </Button>
        </Footer>
      </Container>
    </>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`
const Title = styled.h2`
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 20px;
`
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 2px;
  align-items: stretch;
  color: var(--color-gray-2);
`
const FooterText = styled.span`
  font-size: 13px;
  line-height: 32px;
`

export default SignUp
