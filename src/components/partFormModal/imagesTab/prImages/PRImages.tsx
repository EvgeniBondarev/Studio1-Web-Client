import type {ProductImage} from '../../../../api/types.ts';
import {Modal} from 'antd';
import {useState} from 'react';
import {PRImageItem} from './PRImageItem.tsx';

type Props = {
    images: ProductImage[];
}

export const PRImages = ({images}: Props) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);


    const handleImageClick = (link: string) => {
        setSelectedImage(link);
        setModalVisible(true);
    };

    return (<>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                {images.map((img) => (
                    <PRImageItem key={img.Id} img={img.Link} onClick={handleImageClick}/>
                ))}
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
