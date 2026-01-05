import { Modal, Descriptions, Spin, Tag, Space, Typography, Divider } from 'antd'
import { useQuery } from '@tanstack/react-query'
import {fetchUserDetailsByLogin} from '../../api/users.ts';
import type {CtUser} from '../../api/types.ts';
import {UserProfileHeader} from './components/UserProfileHeader.tsx';
import {DescriptionSection} from './components/DescriptionField.tsx';
import {useDescriptionFields} from './hooks/useDescriptionFields.ts';

const { Text, Title } = Typography

interface UserProfileModalProps {
  user: CtUser | null
  open: boolean
  onClose: () => void
}

export const formatFullName = (firstName?: string, lastName?: string) => {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

export const hasValue = (value: any): boolean => {
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

  const { contact, main, dates } = useDescriptionFields(userDetails)

  return (
    <Modal
      title="Профиль пользователя"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
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
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">

          {/* Заголовок с именем */}
          <UserProfileHeader
            login={userDetails.Login}
            locked={userDetails.Locked}
            firstName={userDetails.FirstName}
            lastName={userDetails.LastName}
            confirmsEmails={userDetails.ConfirmsEmails}
          />

          <Divider style={{ margin: '16px 0' }} />

          {/* Контактная информация */}
          <DescriptionSection
            title="Контактная информация"
            fields={contact}
          />

           {/*Основные параметры */}
          <DescriptionSection
            title="Основные параметры"
            column={2}
            fields={main}
          />

          {/* Даты */}
          <DescriptionSection
            title="Даты"
            column={2}
            fields={dates}
          />

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

