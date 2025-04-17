import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { ACFX_CONFIG } from '@renderer/config/env'
import { useAcfxAuth } from '@renderer/hooks/useAcfxAuth'
import { defHttp } from '@renderer/utils/http/axios'
import { Button, ConfigProvider, Divider, Form, FormProps, Input, message } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useStyle } from '../style'
import { SignUpProps } from '../type'

type FieldType = {
  username: string
  password: string
}

const LogIn: React.FC<SignUpProps> = ({ setSignupVisible }) => {
  const { t } = useTranslation()
  const { styles } = useStyle()
  const [isLogining, setLogining] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  const { login, user } = useAcfxAuth()
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setLogining(true)
    messageApi.open({
      type: 'success',
      content: t('正在登录中...	'),
      duration: 0,
      key: 'login_message'
    })

    const signInRes = await defHttp
      .post({
        url: ACFX_CONFIG.AuthApi.login,
        data: {
          username: values.username,
          password: values.password
        }
      })
      .finally(() => {
        messageApi.destroy()
        setLogining(false)
      })

    login(signInRes)
    navigate('/')
  }

  const visitorLogin = () => {
    navigate('/')
  }

  return (
    <>
      {contextHolder}
      <Container>
        <Title>{t('欢迎使用')}</Title>
        <Form
          name="wrap"
          labelCol={{ flex: '110px' }}
          labelAlign="left"
          labelWrap
          wrapperCol={{ flex: 1 }}
          colon={false}
          onFinish={onFinish}
          initialValues={{ username: user?.username, password: '' }}
          style={{ maxWidth: 600 }}>
          <Form.Item name="username" rules={[{ required: true, message: t('用户名不能为空') }]}>
            <Input autoFocus placeholder={t('用户名')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('密码不能为空') }]}>
            <Input.Password
              placeholder={t('密码')}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '10px' }}>
            <ConfigProvider
              button={{
                className: styles.linearGradientButton
              }}>
              <Button type="primary" loading={isLogining} htmlType="submit" block>
                {t('登录')}
              </Button>
            </ConfigProvider>
          </Form.Item>
        </Form>
        <GoAccount>
          <Button onClick={() => setSignupVisible(true)} color="purple" variant="link" style={{ fontSize: '12px' }}>
            {t('注册账号')}
          </Button>
        </GoAccount>

        <Divider plain>{t('其他登录方式')}</Divider>
        <Button onClick={visitorLogin} color="default" variant="dashed">
          {t('游客登录')}
        </Button>
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

const GoAccount = styled.div`
  display: flex;
  justify-content: end;
  align-items: stretch;
`

export default LogIn
