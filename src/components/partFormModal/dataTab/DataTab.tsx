import {Empty} from 'antd';
import {PRVendorCategories} from './prVendorCategories/PRVendorCategories.tsx';
import {PRAttributes} from './prAttributes/PRAttributes.tsx';
import type {ProductAttribute, ProductVendorCategory} from '../../../api/types.ts';

type Props = {
    attributes?: ProductAttribute[]
    categories?: ProductVendorCategory[]
}
export const DataTab = ({attributes = [], categories = []}: Props) => {
    return (
        (!attributes?.length && !categories?.length) ? (
            <Empty description="Данные отсутствуют"/>
        ) : (
            <>
                {categories?.length > 0 && (
                    <PRVendorCategories categories={categories}/>
                )}

                {attributes?.length > 0 && (
                    <PRAttributes attributes={attributes}/>
                )}
            </>
        )
    )
}