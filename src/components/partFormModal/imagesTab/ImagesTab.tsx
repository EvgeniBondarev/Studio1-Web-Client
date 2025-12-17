import { Empty, Spin } from 'antd';
import type { ProductImage } from '../../../api/types.ts';
import { PRImages } from './prImages/PRImages.tsx';

type Props = {
    isLoading: boolean;
    images?: ProductImage[];
};

export const ImagesTab = ({ isLoading, images = [] }: Props) => {
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <Spin />
            </div>
        );
    }

    if (!images || images.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                <Empty description="Картинки отсутствуют" />
            </div>
        );
    }

    return <PRImages images={images} />;
};
