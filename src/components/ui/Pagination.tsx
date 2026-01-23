import React from 'react';
import { Button, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 7;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    minWidth: 32,
    height: 32,
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: active ? '#1890FF' : 'white',
    color: active ? 'white' : '#595959',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
  });

  const ellipsisStyle: React.CSSProperties = {
    padding: '0 8px',
    fontSize: 14,
    color: '#595959',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Space style={{ marginTop: 24 }} size={4}>
      {/* Кнопка назад */}
      <Button
        type="text"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={buttonStyle(false)}
      >
        <LeftOutlined />
      </Button>

      {/* Первая страница + "..." */}
      {startPage > 1 && (
        <>
          <Button type="text" onClick={() => onPageChange(1)} style={buttonStyle(false)}>
            1
          </Button>
          {startPage > 2 && <span style={ellipsisStyle}>...</span>}
        </>
      )}

      {/* Основные страницы */}
      {pages.map((page) => (
        <Button
          key={page}
          type="text"
          onClick={() => onPageChange(page)}
          style={buttonStyle(currentPage === page)}
        >
          {page}
        </Button>
      ))}

      {/* Последняя страница + "..." */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span style={ellipsisStyle}>...</span>}
          <Button type="text" onClick={() => onPageChange(totalPages)} style={buttonStyle(false)}>
            {totalPages}
          </Button>
        </>
      )}

      {/* Кнопка вперед */}
      <Button
        type="text"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={buttonStyle(false)}
      >
        <RightOutlined />
      </Button>
    </Space>
  );
};
