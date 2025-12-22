import {Tag} from 'antd';
import type {ProductVendorCategory} from '../../../../../../api/types.ts';

type Props = {
    categories: ProductVendorCategory[]
}

const VENDOR_LABELS = ['Категория', 'Код поставщика'] as const;

export const PRVendorCategories = ({categories}: Props) => {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20}}>
            {categories.map((item) => (
                <div key={item.Id}>
                    {VENDOR_LABELS.map((label, i) => (
                        <div key={label} style={{marginBottom: i === 0 ? 12 : 0}}>
                            <div style={{fontSize: 12, color: 'gray', marginBottom: 4}}>
                                {label}
                            </div>
                            {label === 'Категория' ? (
                                <div>{item.VendorCategory.Name}</div>
                            ) : (
                                <Tag color="blue">{item.VendorCategory.Vendor_Code}</Tag>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

};
