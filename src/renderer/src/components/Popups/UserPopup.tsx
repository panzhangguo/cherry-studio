import { QuestionCircleOutlined } from '@ant-design/icons' // pfee 引入auth模块
import DefaultAvatar from '@renderer/assets/images/avatar.png'
import { ACFX_CONFIG } from '@renderer/config/env'
import useAvatar from '@renderer/hooks/useAvatar'
import { useExpandAuth } from '@renderer/hooks/useExpandAuth' // pfee 引入auth模块
import { useSettings } from '@renderer/hooks/useSettings'
import ImageStorage from '@renderer/services/ImageStorage'
import { useAppDispatch } from '@renderer/store'
import { setAvatar } from '@renderer/store/runtime'
import { setUserName } from '@renderer/store/settings'
import { compressImage, isEmoji } from '@renderer/utils'
import { defHttp } from '@renderer/utils/http/axios'
import { Avatar, Button, Divider, Dropdown, Flex, Input, Modal, Popover, Tooltip, Upload } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom' // pfee 引入auth模块
import styled from 'styled-components'

import EmojiPicker from '../EmojiPicker'
import { Center, HStack, VStack } from '../Layout'
import { TopView } from '../TopView'

interface Props {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ resolve }) => {
  const [open, setOpen] = useState(true)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { t } = useTranslation()
  const { userName } = useSettings()
  const dispatch = useAppDispatch()
  const avatar = useAvatar()
  /* pfee 引入auth模块 */
  const navigate = useNavigate()
  const { logout: authLogout, isLogin, user } = useExpandAuth()
  const toAuth = async (isSignup = false) => {
    if (!isSignup && isLogin) {
      await defHttp.get({
        url: ACFX_CONFIG.AuthApi.logout
      })

      authLogout()
    } else {
      setOpen(false)
      navigate('/acfx-auth', {
        state: { isSignup: isSignup }
      })
    }
  }
  /* pfee 引入auth模块 */
  const onOk = () => {
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  const handleEmojiClick = async (emoji: string) => {
    try {
      // set emoji string
      await ImageStorage.set('avatar', emoji)
      // update avatar display
      dispatch(setAvatar(emoji))
      setEmojiPickerOpen(false)
    } catch (error: any) {
      window.message.error(error.message)
    }
  }
  const handleReset = async () => {
    try {
      await ImageStorage.set('avatar', DefaultAvatar)
      dispatch(setAvatar(DefaultAvatar))
      setDropdownOpen(false)
    } catch (error: any) {
      window.message.error(error.message)
    }
  }
  const items = [
    {
      key: 'upload',
      label: (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Upload
            customRequest={() => {}}
            accept="image/png, image/jpeg, image/gif"
            itemRender={() => null}
            maxCount={1}
            onChange={async ({ file }) => {
              try {
                const _file = file.originFileObj as File
                if (_file.type === 'image/gif') {
                  await ImageStorage.set('avatar', _file)
                } else {
                  const compressedFile = await compressImage(_file)
                  await ImageStorage.set('avatar', compressedFile)
                }
                dispatch(setAvatar(await ImageStorage.get('avatar')))
                setDropdownOpen(false)
              } catch (error: any) {
                window.message.error(error.message)
              }
            }}>
            {t('settings.general.image_upload')}
          </Upload>
        </div>
      )
    },
    {
      key: 'emoji',
      label: (
        <div
          style={{ width: '100%', textAlign: 'center' }}
          onClick={(e) => {
            e.stopPropagation()
            setEmojiPickerOpen(true)
            setDropdownOpen(false)
          }}>
          {t('settings.general.emoji_picker')}
        </div>
      )
    },
    {
      key: 'reset',
      label: (
        <div
          style={{ width: '100%', textAlign: 'center' }}
          onClick={(e) => {
            e.stopPropagation()
            handleReset()
          }}>
          {t('settings.general.avatar.reset')}
        </div>
      )
    }
  ]

  return (
    <Modal
      width="600px" // pfee 修改宽度
      open={open}
      footer={null}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      transitionName="ant-move-down"
      centered>
      <Center mt="30px">
        <VStack alignItems="center" gap="10px">
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            open={dropdownOpen}
            align={{ offset: [0, 4] }}
            placement="bottom"
            onOpenChange={(visible) => {
              setDropdownOpen(visible)
              if (visible) {
                setEmojiPickerOpen(false)
              }
            }}>
            <Popover
              content={<EmojiPicker onEmojiClick={handleEmojiClick} />}
              trigger="click"
              open={emojiPickerOpen}
              onOpenChange={(visible) => {
                setEmojiPickerOpen(visible)
                if (visible) {
                  setDropdownOpen(false)
                }
              }}
              placement="bottom">
              {isEmoji(avatar) ? <EmojiAvatar>{avatar}</EmojiAvatar> : <UserAvatar src={avatar} />}
            </Popover>
          </Dropdown>
        </VStack>
      </Center>
      <HStack alignItems="center" gap="10px" p="20px">
        <Input
          placeholder={t('settings.general.user_name.placeholder')}
          disabled={isLogin} // pfee 登录后不允许修改用户名
          value={user?.display_name || user?.username || userName} // pfee 如果已经登录，则使用用户名，否则使用输入框的值
          onChange={(e) => dispatch(setUserName(e.target.value.trim()))}
          style={{ flex: 1, textAlign: 'center', width: '100%' }}
          maxLength={30}
        />
      </HStack>

      {/* pfee 权限模块 */}
      <Divider plain>
        {!isLogin ? t('当前为游客模式，获取完整体验，请登录。') : t('当前账户已登录，畅游AI智能世界。')}
      </Divider>
      <Flex gap="small" wrap justify="center">
        <Button color="default" variant="solid" onClick={() => toAuth(true)}>
          {t('注册账号')}
        </Button>
        <Button color="purple" variant="solid" onClick={() => toAuth()}>
          <Tooltip title={t('若账号过期，请退出重新登录')}>
            <QuestionCircleOutlined />
          </Tooltip>
          {!isLogin ? t('登录') : t('退出登录')}
        </Button>
      </Flex>
      <Divider plain>{t('settings.provider.charge')}</Divider>
      <Flex justify="center">
        <Button color="pink" disabled={true} variant="solid">
          {t('settings.provider.charge')}
        </Button>
      </Flex>
      {/* pfee 权限模块 */}
    </Modal>
  )
}

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  width: 80px;
  height: 80px;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.8;
  }
`

const EmojiAvatar = styled.div`
  cursor: pointer;
  width: 80px;
  height: 80px;
  border-radius: 20%;
  background-color: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  transition: opacity 0.3s ease;
  border: 0.5px solid var(--color-border);
  &:hover {
    opacity: 0.8;
  }
`

export default class UserPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('UserPopup')
  }
  static show() {
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'UserPopup'
      )
    })
  }
}
