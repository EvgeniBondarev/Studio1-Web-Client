import type {ProductImage} from '../../../../../api/types.ts';
import {Modal, Typography} from 'antd';
import {useState} from 'react';
import {PRImageItem} from './PRImageItem.tsx';

type Props = {
    prImg: ProductImage[];
    s3Img: string[]
}

export const PRImages = ({s3Img, prImg}: Props) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageClick = (link: string) => {
        setSelectedImage(link);
        setModalVisible(true);
    };

    return (<>
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{borderBottom: '1px solid #f0f0f0'}}>
                    <Typography.Text
                        style={{borderLeft: '2px solid black', paddingLeft: '8px'}}
                    >
                        Producer
                    </Typography.Text>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        {prImg.map((img) => (
                            <PRImageItem key={img.Id} img={img.Link} onClick={handleImageClick}/>
                        ))}
                    </div>
                </div>

                <div style={{borderBottom: '1px solid #f0f0f0'}}>
                    <Typography.Text
                        style={{ borderLeft: '2px solid black', paddingLeft: '8px'}}
                    >
                        S3
                    </Typography.Text>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        {s3Img.map((url, index) => (
                            <PRImageItem key={index} img={url} onClick={handleImageClick}/>
                        ))}
                    </div>
                </div>
            </div>

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
