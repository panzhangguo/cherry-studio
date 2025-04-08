import authBg from '@renderer/assets/images/expand/auth-bg.svg'
import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { APP_NAME } from '@renderer/config/env'
import { type FC, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import LogIn from './components/LogIn'
import SignUp from './components/SignUp'
const LoginPage: FC = () => {
  const { state } = useLocation()
  const _state = state || { isSignup: false }

  const [signupVisible, setSignupVisible] = useState<boolean>(_state.isSignup)

  return (
    <AuthContainer>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>注册 {APP_NAME}</NavbarCenter>
      </Navbar>
      <Content>
        <Center>
          <Title>{APP_NAME}</Title>
          {signupVisible ? (
            <SignUp setSignupVisible={setSignupVisible}></SignUp>
          ) : (
            <LogIn setSignupVisible={setSignupVisible}></LogIn>
          )}
        </Center>
      </Content>
    </AuthContainer>
  )
}

const AuthContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-background);
  background-image: url(${authBg});
  background-size: cover;
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const Center = styled.div`
  width: 350px;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 22px;
`

export default LoginPage
