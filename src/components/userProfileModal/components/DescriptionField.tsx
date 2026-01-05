import {hasValue} from '../UserProfileModal.tsx';
import {Descriptions, Typography} from 'antd';
import React from 'react';
const { Text } = Typography

export type DescriptionField<T = string | number> = {
  label: string
  value?: T | null
  copyable?: boolean
  span?: number
  format?: (value: T) => React.ReactNode
}

type Props = {
  title: string
  fields: DescriptionField[]
  column?: number
}

export const DescriptionSection = ({
                                     title,
                                     fields,
                                     column = 1,
                                   }: Props) => {
  const visibleFields = fields.filter(f => hasValue(f.value))

  if (visibleFields.length === 0) {
    return null
  }

  return (
    <Descriptions title={title} bordered column={column} size="small">
      {visibleFields.map(({ label, value, copyable, span, format }) => (
        <Descriptions.Item key={label} label={label} span={span}>
          {copyable ? (
            <Text copyable>
              {format ? format(value!) : value}
            </Text>
          ) : (
            format ? format(value!) : value
          )}
        </Descriptions.Item>
      ))}
    </Descriptions>
  )
}

