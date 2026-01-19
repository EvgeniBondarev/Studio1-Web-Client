import {Typography, Card, Input} from 'antd';
import type {AttributeDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  filteredAttributes: AttributeDto[]
  attributesSearch: string,
  globalSearch: string
  attributesLength: number
  setAttributesSearch: (value: string) => void
}

export const Characteristics = ({
                                  filteredAttributes,
                                  attributesLength,
                                  globalSearch,
                                  attributesSearch,
                                  setAttributesSearch
                                }: Props) => {


  return (
    <Card style={{marginBottom: 24,}}>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Typography.Title level={4} style={{margin: 0}}>
          Характеристики ({filteredAttributes.length}
          {attributesSearch || globalSearch ? ` из ${attributesLength}` : ''})
        </Typography.Title>
      </div>

      <div style={{padding: 24,}}>
        <div style={{marginBottom: 16}}>
          <Input
            value={attributesSearch}
            onChange={(e) => setAttributesSearch(e.target.value)}
            placeholder="Поиск по ID, описанию, заголовку, значению..."
            // allowClear
          />
        </div>

        {filteredAttributes.length > 0 ? (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse',}}>
              <thead>
              <tr
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#fafafa',
                }}
              >
                <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                  ID
                </th>
                <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                  Описание
                </th>
                <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                  Заголовок
                </th>
                <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                  Значение
                </th>
              </tr>
              </thead>
              <tbody>
              {filteredAttributes.map((attr) => (
                <tr
                  key={attr.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#fafafa')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <td style={{padding: '8px 12px', fontSize: 12, color: '#6b7280',}}>
                    {attr.id}
                  </td>
                  <td style={{padding: '8px 12px', fontSize: 12, color: '#374151',}}>
                    {attr.description}
                  </td>
                  <td style={{padding: '8px 12px', fontSize: 12, color: '#374151',}}>
                    {attr.displayTitle || '-'}
                  </td>
                  <td style={{padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#111827',}}>
                    {attr.displayValue}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        ) : attributesSearch || globalSearch ? (
          <p style={{color: '#6b7280', fontSize: 12, textAlign: 'center', padding: '32px 0',}}>
            По запросу &quot;{attributesSearch || globalSearch}&quot; ничего не
            найдено
          </p>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12,}}>
            Характеристики не найдены
          </p>
        )}
      </div>
    </Card>
  )
}