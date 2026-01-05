import {Empty, message, Spin} from 'antd';
import type {ProductImage} from '../../../../../api/types.ts';
import {PRImages} from './prImages/PRImages.tsx';
import {useEffect, useState} from 'react';
import type {ImageResponseItem} from '../../../../../api/clientTypes.ts';
import {fetchImageUrlByProducerId} from '../../../../../api/interPartsClient.ts';

type Props = {
    prIsLoading: boolean;
    prImages?: ProductImage[];
    code: string
    producerId: string
};

export const ImagesTab = ({prIsLoading, prImages = [], code, producerId}: Props) => {
    const [s3Loading, setS3Loading] = useState<boolean>(true);
    const [s3Images, setS3Images] = useState<string[]>([]);
    useEffect(() => {
        async function fetchImages() {
            setS3Loading(true);
            try {
                const result: ImageResponseItem = await fetchImageUrlByProducerId({code, producerId});
                const urls = Array.isArray(result.url) ? result.url : [result.url];
                setS3Images(urls);
            } catch (error) {
                console.error('Failed to fetch images:', error);
                const errorMsg = 'Не удалось загрузить изображения (S3)'

                message.warning({
                    content: errorMsg,
                    duration: 5,
                });

            } finally {
                setS3Loading(false);
            }
        }

        fetchImages();
    }, []);

    if (prIsLoading || s3Loading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300}}>
                <Spin/>
            </div>
        );
    }

    if ((!prImages || prImages.length === 0) && (!s3Images || s3Images.length === 0)) {
        return (
            <div style={{textAlign: 'center', padding: '50px 0'}}>
                <Empty description="Картинки отсутствуют"/>
            </div>
        );
    }

    return <PRImages prImg={prImages}
                     s3Img={s3Images}
    />


};
