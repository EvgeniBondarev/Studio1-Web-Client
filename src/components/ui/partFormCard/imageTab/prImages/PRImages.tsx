import type {ProductImage} from '../../../../../api/types.ts';
import {Divider, Flex, Modal, Typography} from 'antd';
import {useState} from 'react';
import {PRImageItem} from './PRImageItem.tsx';
import {ArticleImage} from '../../../tecDoc/ArticleImage.tsx';
import type {ImageDto} from '../../../../../api/TecDoc/api/types.ts';

type Props = {
  prImg: ProductImage[];
  s3Img: string[]
  tecDocImg?: ImageDto[]
  supplierId?: number
}

export const PRImages = ({s3Img, prImg, tecDocImg, supplierId}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (link: string) => {
    setSelectedImage(link);
    setModalVisible(true);
  };

  return (<>
      <Flex vertical>

        <Typography.Text style={{borderLeft: '2px solid black', paddingLeft: '8px'}}>
          Producer
        </Typography.Text>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {prImg.map((img) => (
            <PRImageItem key={img.Id} img={img.Link} onClick={handleImageClick}/>
          ))}
        </div>

        <Divider size={'small'}/>

        <Typography.Text style={{borderLeft: '2px solid black', paddingLeft: '8px'}}>
          S3
        </Typography.Text>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {s3Img.map((url, index) => (
            <PRImageItem key={index} img={url} onClick={handleImageClick}/>
          ))}
        </div>

        <Divider size={'small'}/>

        <Typography.Text style={{borderLeft: '2px solid black', paddingLeft: '8px'}}>
          TecDoc
        </Typography.Text>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {tecDocImg && supplierId &&
            tecDocImg.map((img, index) => (
            <ArticleImage key={index} image={img} supplierId={supplierId}/>
          ))}
        </div>

      </Flex>

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        centered
        width="auto"
        style={{textAlign: 'center', padding: 0}}
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="enlarged"
            style={{maxWidth: '90vw', maxHeight: '90vh'}}
          />
        )}
      </Modal>
    </>
  );
};
