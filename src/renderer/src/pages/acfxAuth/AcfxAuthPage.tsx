import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { APP_NAME } from '@renderer/config/env'
import { type FC, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import LogIn from './components/LogIn'
import SignUp from './components/SignUp'
const AcfxAuthPage: FC = () => {
  const { state } = useLocation()
  const _state = state || { isSignup: false }

  const [signupVisible, setSignupVisible] = useState<boolean>(_state.isSignup)

  return (
    <AuthContainer>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>注册 {APP_NAME}</NavbarCenter>
      </Navbar>
      <AuthContainerBg></AuthContainerBg>
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

const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`
const AuthContainer = styled(FlexCenter)`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-background);
`

const AuthContainerBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(154deg, #07070915 30%, hsl(212, 100%, 45%, 20%) 48%, #07070915 64%);
  filter: blur(100px);
`

const Content = styled(FlexCenter)`
  width: 100%;
  height: 100%;
`

const Center = styled(FlexCenter)`
  width: 400px;
  height: 400px;
  margin-top: -60px;
`
const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 22px;
`

export default AcfxAuthPage
