import {Card, Typography} from 'antd';
import {FileImageOutlined} from '@ant-design/icons';
import type {ImageDto} from '../../../../api/TecDoc/api/types.ts';

type Props={
  images:ImageDto[]
  supplierIdNum:string
}

export const ImgInfo=({images}:Props)=>{
  return(
    <Card style={{marginBottom: 24}}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <FileImageOutlined style={{width: 20, height: 20}}/>
        <Typography.Title level={5} style={{margin: 0}}>
          Изображения ({images.length})
        </Typography.Title>
      </div>

      <h1>IMAGES</h1>
      {/*<div style={{ padding: 24 }}>*/}
      {/*  {images.length > 0 ? (*/}
      {/*    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>*/}
      {/*      {images.map((img, idx) => (*/}
      {/*        <ArticleImage*/}
      {/*          key={idx}*/}
      {/*          image={img}*/}
      {/*          supplierId={supplierIdNum}*/}
      {/*        />*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  ) : (*/}
      {/*    <p style={{ color: '#6b7280', fontSize: 12 }}>Изображения не найдены</p>*/}
      {/*  )}*/}
      {/*</div>*/}
    </Card>
  )
}