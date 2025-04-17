import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons'
import CustomCollapse from '@renderer/components/CustomCollapse'
import CustomTag from '@renderer/components/CustomTag'
import { ACFX_CONFIG } from '@renderer/config/env'
import { useAcfxAuth } from '@renderer/hooks/useAcfxAuth'
import { defHttp } from '@renderer/utils/http/axios'
import { Avatar, Button, Card, Col, Input, List, Row, Skeleton, Space, Tooltip, Typography } from 'antd'
import { FC, memo, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
const { Paragraph } = Typography
interface PersonalApi {
  id: number
  user_id: number
  key: string
  status: number
  name: string
  created_time: number
  accessed_time: number
  expired_time: number
  remain_quota: number
  unlimited_quota: boolean
  model_limits_enabled: boolean
  model_limits: string
  allow_ips: string
  used_quota: number
  group: string
  DeletedAt: null | any // 如果 DeletedAt 可能包含其他类型的值，可以调整为合适的类型
  loading: boolean
}

interface Team {
  id: number
  name: string
  code: string
  leader: number
  owner: number
  owner_name: string
  is_shared_key: boolean
  joining_approval: boolean
  avatar: string
  description: string
  created_at: string
  updated_at: string
}

interface Key {
  id: number
  key_id: number
  key_user_id: number
  key_api: string
  team_id: number
  team_owner_id: number
  created_at: string
  updated_at: string
  user_id: number
  key: string
  status: number
  name: string
  created_time: number
  accessed_time: number
  expired_time: number
  remain_quota: number
  unlimited_quota: boolean
  model_limits_enabled: boolean
  model_limits: string
  allow_ips: string | null
  used_quota: number
  group: string
}

interface TeamKey {
  team: Team
  keys: Key[]
}

interface AcfxApiContentProps {
  addAcfxKey: (value: string, addable: boolean) => void
  apiKey: string
}
const personalApiCount = 3
const AcfxApiContent: FC<AcfxApiContentProps> = ({ addAcfxKey, apiKey }) => {
  const { user } = useAcfxAuth()
  const personalApiPager = useRef(0)
  const personalApiMore = useRef(true)
  const [initLoading, setInitLoading] = useState(true)
  // const [personalApiMore, setPersonalApiMore] = useState('加载更多')
  // const [personalApiPager, setPersonalApiPager] = useState(0)
  const [personalApiData, setPersonalApiData] = useState<PersonalApi[]>([])
  const [personalApiList, setPersonalApiList] = useState<PersonalApi[]>([])
  const [personalFetching, setPersonalFetching] = useState(false)
  const [teamApiList, setTeamApiList] = useState<TeamKey[]>([])
  const [teamFetching, setTeamFetching] = useState(false)

  useEffect(() => {
    fetchPersonalKeys().then((data) => {
      setInitLoading(false)
      setPersonalApiData(data)
      setPersonalApiList(data)
    })

    fetchTeamKeys().then((data) => {
      setTeamApiList(data)
    })
  }, [])

  const fetchPersonalKeys = async () => {
    setPersonalFetching(true)
    const res = await defHttp
      .get<PersonalApi[]>({
        url: `${ACFX_CONFIG.ACFX_API.GetAllTokens}/?size=${personalApiCount}&p=${personalApiPager.current}`,
        withCredentials: true
      })
      .finally(() => {
        setPersonalFetching(false)
      })

    if (res.length < personalApiCount) {
      personalApiMore.current = false
    } else {
      personalApiPager.current = personalApiPager.current + 1
    }

    return res
  }

  const fetchTeamKeys = async () => {
    setTeamFetching(true)
    return await defHttp
      .get<TeamKey[]>({
        url: `${ACFX_CONFIG.ACFX_API.GetMyUsefulTeamKeys}`,
        withCredentials: true
      })
      .finally(() => {
        setTeamFetching(false)
      })
  }

  const onLoadMore = () => {
    setPersonalApiList(
      personalApiData.concat(
        Array.from({ length: personalApiCount }).map(() => ({
          id: 0,
          user_id: 0,
          key: '',
          status: 0,
          name: '',
          created_time: 0,
          accessed_time: 0,
          expired_time: 0,
          remain_quota: 0,
          unlimited_quota: false,
          model_limits_enabled: false,
          model_limits: '',
          allow_ips: '',
          used_quota: 0,
          group: '',
          DeletedAt: null,
          loading: true
        }))
      )
    )
    fetchPersonalKeys().then((data) => {
      const newData = personalApiData.concat(data)
      setPersonalApiData(newData)
      setPersonalApiList(newData)
      window.dispatchEvent(new Event('resize'))
    })
  }

  const reFetch = () => {
    personalApiMore.current = true
    personalApiPager.current = 0
    fetchPersonalKeys().then((data) => {
      setPersonalApiData(data)
      setPersonalApiList(data)
    })
  }

  const loadMore =
    !initLoading && !personalFetching ? (
      <LoadMore>
        <Button disabled={!personalApiMore.current} onClick={onLoadMore}>
          {personalApiMore.current ? '加载更多' : '没有更多了'}
        </Button>
      </LoadMore>
    ) : null

  const addKey = (key: string, addable: boolean) => {
    const api = 'sk-' + key
    addAcfxKey(api, addable)
  }

  return (
    <Container>
      <Space.Compact>
        <Title>
          <span style={{ fontSize: '12px' }}>用户</span>
          <CustomTag color="#1677ff" icon={<UserOutlined />}>
            {user?.username}
          </CustomTag>
        </Title>
      </Space.Compact>
      <CustomCollapse
        label={<span>团队API密钥</span>}
        extra={
          <ReloadOutlined
            onClick={(event) => {
              event.stopPropagation()
              fetchTeamKeys()
            }}
          />
        }>
        <TeamContent>
          {teamApiList.map((teamKey) => {
            return (
              <Card
                loading={teamFetching}
                key={teamKey.team.id}
                title={
                  <>
                    <Avatar size="small" src={ACFX_CONFIG.UPLOAD_URL + teamKey.team.avatar}></Avatar>
                    <span style={{ marginLeft: '4px', fontSize: '15px' }}>{teamKey.team.name}</span>
                  </>
                }>
                <Row gutter={[16, 16]}>
                  {teamKey.keys.map((key) => {
                    const isTeamKeyUsed = apiKey.indexOf('sk-' + key.key_api) > -1
                    return (
                      <Col key={key.id} lg={{ flex: '100%' }} xl={{ flex: '50%' }} xxl={{ flex: '33%' }}>
                        <Card
                          title={<span style={{ fontSize: '12px' }}>{key.name}</span>}
                          extra={
                            <Tooltip title={isTeamKeyUsed ? '删除' : '添加'}>
                              {isTeamKeyUsed ? (
                                <RemoveIcon
                                  onClick={() => {
                                    addKey(key.key_api, false)
                                  }}
                                />
                              ) : (
                                <PlusCircleOutlined
                                  onClick={() => {
                                    addKey(key.key_api, true)
                                  }}
                                />
                              )}
                            </Tooltip>
                          }>
                          <Input.Password value={'sk-' + key.key_api}></Input.Password>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>
              </Card>
            )
          })}
        </TeamContent>
      </CustomCollapse>
      <CustomCollapse
        label={<span>个人API密钥</span>}
        extra={
          <ReloadOutlined
            onClick={(event) => {
              event.stopPropagation()
              reFetch()
            }}
          />
        }>
        <List
          dataSource={personalApiList}
          loading={personalFetching}
          itemLayout="horizontal"
          loadMore={loadMore}
          renderItem={(item) => {
            const isKeyUsed = apiKey.indexOf('sk-' + item.key) > -1
            return (
              <List.Item
                actions={[
                  <Tooltip key="list-loadmore-add" title={isKeyUsed ? '删除' : '添加'}>
                    {isKeyUsed ? (
                      <RemoveIcon
                        onClick={() => {
                          addKey(item.key, false)
                        }}
                      />
                    ) : (
                      <PlusCircleOutlined
                        onClick={() => {
                          addKey(item.key, true)
                        }}
                      />
                    )}
                  </Tooltip>,
                  <Paragraph
                    key="list-loadmore-more"
                    copyable={{
                      text: 'sk-' + item.key,
                      tooltips: ['复制', '复制成功']
                    }}
                  />
                ]}>
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    title={
                      <>
                        <span style={{ marginRight: '10px' }}>{item.name}</span>
                        {isKeyUsed && (
                          <CustomTag color="#1fb572">
                            <CheckCircleOutlined />
                          </CustomTag>
                        )}
                      </>
                    }
                    description={'sk-' + item.key}
                  />
                </Skeleton>
              </List.Item>
            )
          }}></List>
      </CustomCollapse>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`

const LoadMore = styled.div`
  text-align: center;
  margin-top: 16px;
  height: 32px;
  line-height: 32px;
`

const Title = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const TeamContent = styled.div`
  padding-top: 12px;
`

const RemoveIcon = styled(MinusCircleOutlined)`
  color: var(--color-error);
  font-size: 13px;
  cursor: pointer;
`

export default memo(AcfxApiContent)
