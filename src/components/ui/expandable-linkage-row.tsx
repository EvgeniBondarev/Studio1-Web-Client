import { useState, Fragment } from 'react'
import {  Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import type {LinkageDto} from '../../api/TecDoc/api/types.ts';


interface ExpandableLinkageRowProps {
  linkage: LinkageDto
  index: number
  getLinkageTypeLabel: (typeId: string) => string
}

export function ExpandableLinkageRow({
                                       linkage,
                                       index,
                                       getLinkageTypeLabel,
                                     }: ExpandableLinkageRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const vehicle = linkage.vehicle
  const model = vehicle?.model
  const manufacturer = model?.manufacturer
  const attributes = vehicle?.attributes || []

  return (
    <Fragment>
      <tr
        style={{
          borderBottom: '1px solid #f3f4f6',
          cursor: 'default',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <td style={{ padding: '8px 12px', fontSize: 12, color: '#6b7280' }}>{index + 1}</td>

        <td style={{ padding: '8px 12px', fontSize: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              fontWeight: 500,
              fontSize: 10,
            }}
          >
            {getLinkageTypeLabel(linkage.linkageTypeId)}
          </span>
          <span style={{ marginLeft: 4, fontSize: 10, color: '#6b7280' }}>
            ({linkage.linkageTypeId})
          </span>
        </td>

        <td style={{ padding: '8px 12px', fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
          {linkage.linkageId}
        </td>

        <td style={{ padding: '8px 12px', fontSize: 12 }}>
          {vehicle ? (
            <div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{vehicle.description}</div>
              {vehicle.fullDescription && vehicle.fullDescription !== vehicle.description && (
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>
                  {vehicle.fullDescription}
                </div>
              )}
            </div>
          ) : (
            <span style={{ color: '#9ca3af' }}>—</span>
          )}
        </td>

        <td style={{ padding: '8px 12px', fontSize: 12 }}>
          {model ? (
            <div>
              {manufacturer && (
                <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                  {manufacturer.description}
                </div>
              )}
              <div style={{ color: '#374151' }}>{model.description}</div>
              {model.fullDescription && model.fullDescription !== model.description && (
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{model.fullDescription}</div>
              )}
            </div>
          ) : (
            <span style={{ color: '#9ca3af' }}>—</span>
          )}
        </td>

        <td style={{ padding: '8px 12px', fontSize: 12, color: '#6b7280' }}>
          {vehicle?.constructionInterval || model?.constructionInterval || '—'}
        </td>

        <td style={{ padding: '8px 12px', fontSize: 12 }}>
          {attributes.length > 0 ? (
            <Button
              type="link"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ padding: 0, fontSize: 12 }}
              icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            >
              Характеристики ({attributes.length})
            </Button>
          ) : (
            <span style={{ color: '#9ca3af' }}>—</span>
          )}
        </td>
      </tr>

      {isExpanded && attributes.length > 0 && (
        <tr style={{ backgroundColor: '#f9fafb' }}>
          <td colSpan={7} style={{ padding: '16px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563' }}>
                    Группа
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563' }}>
                    Тип
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563' }}>
                    Заголовок
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563' }}>
                    Значение
                  </th>
                </tr>
                </thead>
                <tbody>
                {attributes.map((attr, attrIdx) => (
                  <tr
                    key={attrIdx}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{attr.attributeGroup}</td>
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{attr.attributeType}</td>
                    <td style={{ padding: '8px 12px', color: '#374151' }}>{attr.displayTitle}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#111827' }}>{attr.displayValue}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  )
}
