import {LinkOutlined} from '@ant-design/icons';
import {Card, Empty, Input, Space, Typography} from 'antd';
import type {LinkageDto} from '../../../../api/TecDoc/api/types.ts';
import {LinkageTable} from '../../LinkageTable.tsx';

type Props = {
  linkagesLength: number
  filteredLinkages: LinkageDto[]
  linkagesSearch: string
  globalSearch: string
  setLinkagesSearch: (value: string) => void
}

export const ApplicabilityTable = ({
                                     linkagesLength,
                                     filteredLinkages,
                                     globalSearch,
                                     linkagesSearch,
                                     setLinkagesSearch,
                                   }: Props) => {
  return (
    <Card id="linkages-table" style={{marginBottom: 24}}
          title={<Space align="center" size={8} style={{width: '100%'}}>
            <LinkOutlined style={{width: 20, height: 20}}/>
            <Typography.Title level={4} style={{margin: 0, flex: 1}}>
              Применимость ({filteredLinkages.length}
              {linkagesSearch || globalSearch ? ` из ${linkagesLength}` : ''})
            </Typography.Title>
          </Space>}
    >

      <Space orientation="vertical" size={16} style={{width: '100%'}}>
        <Input
          value={linkagesSearch}
          onChange={(e) => setLinkagesSearch(e.target.value)}
          placeholder="Поиск по типу, ID, транспортному средству, модели, производителю, характеристикам..."
          allowClear
        />

        {filteredLinkages.length > 0 ? (
          <LinkageTable items={filteredLinkages}/>
        ) : linkagesSearch || globalSearch ? (
          <Empty description={`По запросу ${linkagesSearch || globalSearch} ничего не найдено`}/>
        ) : (
          <Empty description={'Применимость не найдена'}/>
        )}
      </Space>
    </Card>
  )
}