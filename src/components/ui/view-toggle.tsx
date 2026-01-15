import React from 'react';
import { Button, Space } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';

export type ViewMode = 'cards' | 'rows';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  style?: React.CSSProperties;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, style }) => {
  const buttonStyle = (active: boolean): React.CSSProperties => ({
    height: 32,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: active ? '#E6F7FF' : 'white',
    color: active ? '#1890FF' : '#595959',
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  });

  const iconStyle: React.CSSProperties = { marginRight: 6, fontSize: 16 };

  return (
    <Space
      style={{
        padding: 4,
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        backgroundColor: 'white',
        ...style,
      }}
      size={4} // gap между кнопками
    >
      <Button type="text" onClick={() => onChange('cards')} style={buttonStyle(value === 'cards')}>
        <AppstoreOutlined style={iconStyle} />
        Карточки
      </Button>
      <Button type="text" onClick={() => onChange('rows')} style={buttonStyle(value === 'rows')}>
        <UnorderedListOutlined style={iconStyle} />
        Строки
      </Button>
    </Space>
  );
};
