import { Modal, Descriptions, Spin, Tag, Space, Typography, Divider } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { fetchUserDetailsByLogin } from '../api/users.ts'
import type { CtUser } from '../api/types.ts'
import dayjs from 'dayjs'

const { Text, Title } = Typography

interface UserProfileModalProps {
  user: CtUser | null
  open: boolean
  onClose: () => void
}

const formatDate = (date?: string) => {
  if (!date) return null
  const parsed = dayjs(date)
  return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : null
}

const formatFullName = (firstName?: string, lastName?: string) => {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

const hasValue = (value: any): boolean => {
  return value !== undefined && value !== null && value !== ''
}

export const UserProfileModal = ({ user, open, onClose }: UserProfileModalProps) => {
  const {
    data: userDetails,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['userDetails', user?.Login],
    queryFn: () => (user?.Login ? fetchUserDetailsByLogin(user.Login) : Promise.resolve(null)),
    enabled: Boolean(user?.Login && open),
  })

  return (
    <Modal
      title="Профиль пользователя"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {isFetching ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#ff4d4f' }}>
          Ошибка при загрузке данных профиля
        </div>
      ) : userDetails ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Заголовок с именем */}
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {formatFullName(userDetails.FirstName, userDetails.LastName) || userDetails.Login}
            </Title>
            {formatFullName(userDetails.FirstName, userDetails.LastName) && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {userDetails.Login}
              </Text>
            )}
            <div style={{ marginTop: 8 }}>
              <Tag color={userDetails.Locked ? 'red' : 'green'} style={{ marginRight: 8 }}>
                {userDetails.Locked ? 'Заблокирован' : 'Активен'}
              </Tag>
              {userDetails.ConfirmsEmails && (
                <Tag color="blue">Email подтвержден</Tag>
              )}
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* Контактная информация */}
          {(hasValue(userDetails.Email) || hasValue(userDetails.Phones) || hasValue(userDetails.Icq) || hasValue(userDetails.Address)) && (
            <Descriptions title="Контактная информация" bordered column={1} size="small">
              {hasValue(userDetails.Email) && (
                <Descriptions.Item label="Email">
                  <Text copyable>{userDetails.Email}</Text>
                </Descriptions.Item>
              )}
              {hasValue(userDetails.Phones) && (
                <Descriptions.Item label="Телефоны">
                  <Text copyable>{userDetails.Phones}</Text>
                </Descriptions.Item>
              )}
              {hasValue(userDetails.Icq) && (
                <Descriptions.Item label="ICQ">{userDetails.Icq}</Descriptions.Item>
              )}
              {hasValue(userDetails.Address) && (
                <Descriptions.Item label="Адрес">{userDetails.Address}</Descriptions.Item>
              )}
            </Descriptions>
          )}

          {/* Основные параметры */}
          <Descriptions title="Основные параметры" bordered column={2} size="small">
            <Descriptions.Item label="ID">{userDetails.Id}</Descriptions.Item>
            {hasValue(userDetails.Region) && (
              <Descriptions.Item label="Регион">{userDetails.Region}</Descriptions.Item>
            )}
            {hasValue(userDetails.Coef) && (
              <Descriptions.Item label="Коэффициент">{userDetails.Coef}</Descriptions.Item>
            )}
            {hasValue(userDetails.CurrencyId) && (
              <Descriptions.Item label="Валюта">{userDetails.CurrencyId}</Descriptions.Item>
            )}
            {hasValue(userDetails.UserType) && (
              <Descriptions.Item label="Тип пользователя">{userDetails.UserType}</Descriptions.Item>
            )}
            {hasValue(userDetails.OrganisationType) && (
              <Descriptions.Item label="Тип организации">{userDetails.OrganisationType}</Descriptions.Item>
            )}
            {hasValue(userDetails.Manager) && (
              <Descriptions.Item label="Менеджер" span={2}>
                {userDetails.Manager}
              </Descriptions.Item>
            )}
            {hasValue(userDetails.Inn) && (
              <Descriptions.Item label="ИНН">{userDetails.Inn}</Descriptions.Item>
            )}
            {hasValue(userDetails.Kpp) && (
              <Descriptions.Item label="КПП">{userDetails.Kpp}</Descriptions.Item>
            )}
          </Descriptions>

          {/* Даты */}
          {(formatDate(userDetails.Date) || formatDate(userDetails.BirthDate) || formatDate(userDetails.LastActivity)) && (
            <Descriptions title="Даты" bordered column={2} size="small">
              {formatDate(userDetails.Date) && (
                <Descriptions.Item label="Дата регистрации">
                  {formatDate(userDetails.Date)}
                </Descriptions.Item>
              )}
              {formatDate(userDetails.BirthDate) && (
                <Descriptions.Item label="Дата рождения">
                  {formatDate(userDetails.BirthDate)}
                </Descriptions.Item>
              )}
              {formatDate(userDetails.LastActivity) && (
                <Descriptions.Item label="Последняя активность">
                  {formatDate(userDetails.LastActivity)}
                </Descriptions.Item>
              )}
              {hasValue(userDetails.LastArea) && (
                <Descriptions.Item label="Последняя область">
                  {userDetails.LastArea}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}

          {/* Внешние системы - показываем только активные */}
          {(hasValue(userDetails.ExtId) || 
            hasValue(userDetails.ExistLogin) || 
            (userDetails.UseAutodoc !== undefined && userDetails.UseAutodoc !== 2) ||
            (userDetails.UseExist !== undefined && userDetails.UseExist !== 2) ||
            (userDetails.UseEmex !== undefined && userDetails.UseEmex !== 2) ||
            (userDetails.UseAutopiter !== undefined && userDetails.UseAutopiter !== 2)) && (
            <>
              <Descriptions title="Внешние системы" bordered column={2} size="small">
                {hasValue(userDetails.ExtId) && (
                  <Descriptions.Item label="Внешний ID">{userDetails.ExtId}</Descriptions.Item>
                )}
                {hasValue(userDetails.ExtData1) && (
                  <Descriptions.Item label="Внешние данные">{userDetails.ExtData1}</Descriptions.Item>
                )}
                {hasValue(userDetails.ExistLogin) && (
                  <Descriptions.Item label="Exist Login">{userDetails.ExistLogin}</Descriptions.Item>
                )}
                {hasValue(userDetails.ExistPassword) && (
                  <Descriptions.Item label="Exist Password">••••••••</Descriptions.Item>
                )}
                {(userDetails.UseAutodoc !== undefined && userDetails.UseAutodoc !== 2) && (
                  <Descriptions.Item label="Autodoc">
                    <Tag color={userDetails.UseAutodoc === 1 ? 'green' : 'default'}>
                      {userDetails.UseAutodoc === 1 ? 'Включен' : 'Отключен'}
                    </Tag>
                    {userDetails.UseAutodocCrossLimit !== undefined && userDetails.UseAutodocCrossLimit !== -1 && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        (лимит: {userDetails.UseAutodocCrossLimit})
                      </Text>
                    )}
                  </Descriptions.Item>
                )}
                {(userDetails.UseExist !== undefined && userDetails.UseExist !== 2) && (
                  <Descriptions.Item label="Exist">
                    <Tag color={userDetails.UseExist === 1 ? 'green' : 'default'}>
                      {userDetails.UseExist === 1 ? 'Включен' : 'Отключен'}
                    </Tag>
                    {userDetails.UseExistCrossLimit !== undefined && userDetails.UseExistCrossLimit !== -1 && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        (лимит: {userDetails.UseExistCrossLimit})
                      </Text>
                    )}
                  </Descriptions.Item>
                )}
                {(userDetails.UseEmex !== undefined && userDetails.UseEmex !== 2) && (
                  <Descriptions.Item label="Emex">
                    <Tag color={userDetails.UseEmex === 1 ? 'green' : 'default'}>
                      {userDetails.UseEmex === 1 ? 'Включен' : 'Отключен'}
                    </Tag>
                    {userDetails.UseEmexCrossLimit !== undefined && userDetails.UseEmexCrossLimit !== -1 && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        (лимит: {userDetails.UseEmexCrossLimit})
                      </Text>
                    )}
                  </Descriptions.Item>
                )}
                {(userDetails.UseAutopiter !== undefined && userDetails.UseAutopiter !== 2) && (
                  <Descriptions.Item label="Autopiter">
                    <Tag color={userDetails.UseAutopiter === 1 ? 'green' : 'default'}>
                      {userDetails.UseAutopiter === 1 ? 'Включен' : 'Отключен'}
                    </Tag>
                    {userDetails.UseAutopiterCrossLimit !== undefined && userDetails.UseAutopiterCrossLimit !== -1 && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        (лимит: {userDetails.UseAutopiterCrossLimit})
                      </Text>
                    )}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </>
          )}

          {/* Комментарии */}
          {hasValue(userDetails.Comments) && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>Комментарии</Title>
                <Text>{userDetails.Comments}</Text>
              </div>
            </>
          )}
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">Данные профиля не найдены</Text>
        </div>
      )}
    </Modal>
  )
}

