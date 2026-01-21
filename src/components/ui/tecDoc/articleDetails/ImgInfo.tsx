import {Card, Typography, Space, List} from 'antd';
import {FileImageOutlined} from '@ant-design/icons';
import type {ImageDto} from '../../../../api/TecDoc/api/types.ts';
import {ArticleImage} from '../ArticleImage.tsx';


type Props = {
  images: ImageDto[];
  supplierIdNum: number;
};

export const ImgInfo = ({images, supplierIdNum}: Props) => {

  return (
    <Card
      title={<Space align="center" size={8}>
        <FileImageOutlined style={{fontSize: 16}}/>
        <Typography.Title level={4} style={{margin: 0, flex: 1}}>
          Изображения ({images.length})
        </Typography.Title>
      </Space>}
    >
      {images.length > 0 ? (
        <List
          dataSource={images}
          renderItem={(img, idx) => (
            <List.Item key={idx} style={{padding: 0, marginBottom: 16}}>
              <ArticleImage
                image={img}
                supplierId={supplierIdNum}
              />
            </List.Item>
          )}
        />
      ) : (
        <Typography.Text type="secondary">
          Изображения не найдены
        </Typography.Text>
      )}
    </Card>
  )
}