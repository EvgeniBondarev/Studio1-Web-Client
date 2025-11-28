import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authenticateUser } from '../api/users.ts'
import type { CtUser } from '../api/types.ts'

const { Title } = Typography

interface LoginPageProps {
  onLogin: (user: CtUser) => void
  isDarkMode?: boolean
}

export const LoginPage = ({ onLogin, isDarkMode = false }: LoginPageProps) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: { login: string; password: string }) => {
    setLoading(true)
    try {
      const user = await authenticateUser(values.login, values.password)
      if (user) {
        onLogin(user)
        message.success('Успешный вход в систему')
      } else {
        message.error('Неверный логин или пароль')
      }
    } catch (error) {
      console.error('Login error:', error)
      message.error('Ошибка при входе в систему')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#0f0f0f' : '#f5f7fb',
      }}
    >
      <Card
        style={{
          width: 400,
          border: isDarkMode ? '1px solid #303030' : '1px solid #e5e7eb',
          backgroundColor: isDarkMode ? '#181818' : undefined,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/logo.svg"
            alt="Logo"
            style={{
              height: 80,
              width: 'auto',
              marginBottom: 16,
            }}
          />
          <Title level={2} style={{ margin: 0 }}>Вход в систему</Title>
        </div>
        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="login"
            rules={[{ required: true, message: 'Пожалуйста, введите логин!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Логин"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

