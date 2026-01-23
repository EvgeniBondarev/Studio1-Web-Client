import {Card, Typography, List, Tag, Space, Divider} from 'antd';
import type {AccessoryDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  accessories: AccessoryDto[]
  url: string
}

export const Accessories = ({accessories, url}: Props) => {
  return (
    <Card
      title={<Typography.Title level={4}>
        Аксессуары ({accessories.length})
      </Typography.Title>}
    >
      {accessories.length > 0 ? (
        <List
          dataSource={accessories}
          renderItem={(acc, idx) => (
            <List.Item
              key={idx}
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                padding: 8,
                marginBottom: 8
              }}
            >
              <Space orientation="vertical" style={{width: '100%'}}>
                <div>
                  <a
                    href={`${url}/${acc.accSupplierId}/${acc.accDataSupplierArticleNumber}`}
                    style={{
                      color: '#2563eb',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontSize: 14
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {acc.accDataSupplierArticleNumber}
                  </a>
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: 10,
                      display: 'block',
                      marginTop: 2
                    }}
                  >
                    Supplier ID: {acc.accSupplierId}
                  </Typography.Text>
                </div>

                {acc.accSupplier && (
                  <>
                    <Divider style={{margin: '8px 0'}}/>

                    <Typography.Text style={{fontSize: 12}}>
                      {acc.accSupplier.description}
                    </Typography.Text>

                    <Space size={[8, 4]} wrap style={{marginTop: 4}}>
                      {acc.accSupplier.matchcode && (
                        <Tag color="default" style={{fontSize: 10, margin: 0}}>
                          Код: {acc.accSupplier.matchcode}
                        </Tag>
                      )}

                      {acc.accSupplier.dataVersion && (
                        <Tag color="default" style={{fontSize: 10, margin: 0}}>
                          Версия: {acc.accSupplier.dataVersion}
                        </Tag>
                      )}

                      {acc.accSupplier.nbrOfArticles !== undefined && (
                        <Tag color="blue" style={{fontSize: 10, margin: 0}}>
                          Артикулов: {acc.accSupplier.nbrOfArticles.toLocaleString()}
                        </Tag>
                      )}
                    </Space>
                  </>
                )}
              </Space>
            </List.Item>
          )}
        />
      ) : (
        <Typography.Text type="secondary">
          Аксессуары не найдены
        </Typography.Text>
      )}

    </Card>
  )
}