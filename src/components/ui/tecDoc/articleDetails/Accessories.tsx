import {Card, Typography} from 'antd';
import type {AccessoryDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  accessories: AccessoryDto[]
  url:string
}
export const Accessories = ({accessories,url}: Props) => {
  return (
    <Card style={{marginBottom: 24}}>
      <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
        <Typography.Title level={5} style={{margin: 0}}>
          Аксессуары ({accessories.length})
        </Typography.Title>
      </div>

      <div style={{padding: 24}}>
        {accessories.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {accessories.map((acc, idx) => (
              <div
                key={idx}
                style={{padding: 8, border: '1px solid #d9d9d9', borderRadius: 4,}}
              >
                <a
                  href={`${url}/${acc.accSupplierId}/${acc.accDataSupplierArticleNumber}`}
                  style={{color: '#2563eb', fontWeight: 600, textDecoration: 'none'}}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {acc.accDataSupplierArticleNumber}
                </a>
                <p style={{fontSize: 10, color: '#6b7280', margin: '4px 0 0 0'}}>
                  Supplier ID: {acc.accSupplierId}
                </p>
                {acc.accSupplier && (
                  <div style={{marginTop: 4, fontSize: 12, color: '#374151'}}>
                    <p style={{margin: 0}}>{acc.accSupplier.description}</p>
                    {acc.accSupplier.matchcode && (
                      <p style={{fontSize: 10, color: '#6b7280', margin: '2px 0 0 0'}}>
                        Код: {acc.accSupplier.matchcode}
                      </p>
                    )}
                    {acc.accSupplier.dataVersion && (
                      <p style={{fontSize: 10, color: '#6b7280', margin: '2px 0 0 0'}}>
                        Версия: {acc.accSupplier.dataVersion}
                      </p>
                    )}
                    {acc.accSupplier.nbrOfArticles !== undefined && (
                      <p style={{fontSize: 10, color: '#6b7280', margin: '2px 0 0 0'}}>
                        Артикулов: {acc.accSupplier.nbrOfArticles.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12}}>Аксессуары не найдены</p>
        )}
      </div>
    </Card>
  )
}