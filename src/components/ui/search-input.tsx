import { Input } from 'antd'
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onClear?: () => void
}

export function SearchInput({
                              value,
                              onChange,
                              placeholder = 'Поиск...',
                              className,
                              onClear,
                            }: SearchInputProps) {
  return (
    <div className={className} style={{ position: 'relative', width: '100%' }}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        allowClear={{
          clearIcon: (
            <CloseCircleFilled
              style={{ color: '#a0a0a0', fontSize: 14 }}
              onClick={() => {
                onChange('')
                onClear?.()
              }}
            />
          ),
        }}
        prefix={<SearchOutlined style={{ color: '#a0a0a0', fontSize: 14 }} />}
        style={{ paddingLeft: 30 }}
      />
    </div>
  )
}
