import {Card, Typography, List, Tag, Space, Divider} from 'antd';
import type {NewNumberDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  newNumbers: NewNumberDto[]
  url: string
}

export const NewNumbers = ({newNumbers, url}: Props) => {
  return (
    <Card
      title={<Typography.Title level={4}>
        Новые номера ({newNumbers.length})
      </Typography.Title>}
    >
      {newNumbers.length > 0 ? (
        <List
          dataSource={newNumbers}
          renderItem={(newNum, idx) => (
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
                    href={`${url}/${newNum.newSupplierId}/${newNum.newDataSupplierArticleNumber}`}
                    style={{
                      color: '#2563eb',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontSize: 14
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {newNum.newDataSupplierArticleNumber}
                  </a>
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: 10,
                      display: 'block',
                      marginTop: 2
                    }}
                  >
                    Supplier ID: {newNum.newSupplierId}
                  </Typography.Text>
                </div>

                {newNum.newSupplier && (
                  <>
                    <Divider style={{margin: '8px 0'}}/>

                    <Typography.Text style={{fontSize: 12}}>
                      {newNum.newSupplier.description}
                    </Typography.Text>

                    <Space size={[8, 4]} wrap style={{marginTop: 4}}>
                      {newNum.newSupplier.matchcode && (
                        <Tag color="default" style={{fontSize: 10, margin: 0}}>
                          Код: {newNum.newSupplier.matchcode}
                        </Tag>
                      )}

                      {newNum.newSupplier.dataVersion && (
                        <Tag color="default" style={{fontSize: 10, margin: 0}}>
                          Версия: {newNum.newSupplier.dataVersion}
                        </Tag>
                      )}

                      {newNum.newSupplier.nbrOfArticles !== undefined && (
                        <Tag color="blue" style={{fontSize: 10, margin: 0}}>
                          Артикулов: {newNum.newSupplier.nbrOfArticles.toLocaleString()}
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
          Новые номера не найдены
        </Typography.Text>
      )}
    </Card>
  )
}