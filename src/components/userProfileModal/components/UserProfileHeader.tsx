import {Tag, Typography} from 'antd';
import {formatFullName} from '../UserProfileModal.tsx';
const { Text, Title } = Typography

type Props={
  firstName?:string
  lastName?:string
  login:string
  confirmsEmails?:boolean
  locked?:boolean
}

export const UserProfileHeader = ({ firstName, lastName, login, confirmsEmails, locked }:Props) => {
  return (
    <div>
      <Title level={4} style={{ margin: 0 }}>
        {formatFullName(firstName, lastName) || login}
      </Title>
      {formatFullName(firstName, lastName) && (
        <Text type="secondary" style={{ fontSize: 14 }}>
          {login}
        </Text>
      )}
      <div style={{ marginTop: 8 }}>
        <Tag color={locked ? 'red' : 'green'} style={{ marginRight: 8 }}>
          {locked ? 'Заблокирован' : 'Активен'}
        </Tag>
        {confirmsEmails && (
          <Tag color="blue">Email подтвержден</Tag>
        )}
      </div>
    </div>
  )
}
