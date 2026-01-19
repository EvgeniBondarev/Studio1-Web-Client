import {Card, Typography} from 'antd';
import type {NewNumberDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  newNumbers: NewNumberDto[]
  url:string
}

export const NewNumbers = ({newNumbers, url}: Props) => {
  return (
    <Card style={{marginBottom: 24}}>
      <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
        <Typography.Title level={5} style={{margin: 0}}>
          Новые номера ({newNumbers.length})
        </Typography.Title>
      </div>

      <div style={{padding: 24}}>
        {newNumbers.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {newNumbers.map((newNum, idx) => (
              <div
                key={idx}
                style={{padding: 8, border: '1px solid #d9d9d9', borderRadius: 4,}}
              >
                <a
                  href={`${url}/${newNum.newSupplierId}/${newNum.newDataSupplierArticleNumber}`}
                  style={{color: '#2563eb', fontWeight: 600, textDecoration: 'none'}}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {newNum.newDataSupplierArticleNumber}
                </a>
                <p style={{fontSize: 10, color: '#6b7280', margin: '4px 0 0 0'}}>
                  Supplier ID: {newNum.newSupplierId}
                </p>
                {newNum.newSupplier && (
                  <div style={{marginTop: 4, fontSize: 12, color: '#374151'}}>
                    <p style={{margin: 0}}>{newNum.newSupplier.description}</p>
                    {newNum.newSupplier.matchcode && (
                      <p style={{fontSize: 10, color: '#6b7280', margin: '2px 0 0 0'}}>
                        Код: {newNum.newSupplier.matchcode}
                      </p>
                    )}
                    {newNum.newSupplier.dataVersion && (
                      <p style={{fontSize: 10, color: '#6b7280', margin: '2px 0 0 0'}}>
                        Версия: {newNum.newSupplier.dataVersion}
                      </p>
                    )}
                    {newNum.newSupplier.nbrOfArticles !== undefined && (
                      <p style={{fontSize: 10, color: '#6b7280', margin: '2px 0 0 0'}}>
                        Артикулов: {newNum.newSupplier.nbrOfArticles.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12}}>Новые номера не найдены</p>
        )}
      </div>
    </Card>
  )
}